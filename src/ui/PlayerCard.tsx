import { memo } from 'react'
import type { PlayerCard as PlayerCardType, TierName } from '../engine/types'
import { getAttributeLabel } from '../engine/attributes'

const DIGITS: Record<string, number[][]> = {
  '0': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  '1': [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2': [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
  '3': [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]],
  '4': [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
  '5': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
  '6': [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
  '7': [[1,1,1],[0,0,1],[0,1,0],[0,1,0],[0,1,0]],
  '8': [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
  '9': [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
}

function pixelNumberPath(number: number, cx: number, y: number, px: number): string {
  const digits = String(number).split('')
  const totalWidth = digits.length * (3 * px) + (digits.length - 1) * px
  const startX = cx - totalWidth / 2
  let d = ''
  digits.forEach((ch, di) => {
    const bitmap = DIGITS[ch]
    if (!bitmap) return
    const dx = startX + di * (3 * px + px)
    bitmap.forEach((row, ry) => {
      row.forEach((cell, cxi) => {
        if (cell) d += `M${dx + cxi * px},${y + ry * px}h${px}v${px}h-${px}z`
      })
    })
  })
  return d
}

function portraitPaths(hair: string, skin: string, jersey: string, sleeve: string, collar: string) {
  return [
    { fill: hair, d: 'M296,172h90v18h-90zM296,190h18v18h-18zM368,190h18v18h-18zM312,206h16v5h-16zM354,206h16v5h-16z' },
    { fill: skin, d: 'M314,190h54v18h-54zM287,208h9v20h-9zM386,208h9v20h-9zM296,208h90v18h-90zM296,226h90v18h-90zM305,244h72v18h-72zM323,262h36v16h-36z' },
    { fill: '#241a12', d: 'M313,213h14v10h-14zM356,213h14v10h-14z' },
    { fill: '#b5654a', d: 'M327,240h28v6h-28z' },
    { fill: jersey, d: 'M272,280h138v52h-138z' },
    { fill: sleeve, d: 'M272,280h22v30h-22zM388,280h22v30h-22z' },
    { fill: collar, d: 'M318,280h46v9h-46z' },
  ]
}

const TIER_COLORS: Record<TierName, string> = {
  lendario: '#ffd84d',
  elite: '#c084fc',
  bom: '#60a5fa',
  regular: '#9ca3af',
  fraco: '#6b7280',
}

const POSICAO_COLORS: Record<string, string> = {
  GOL: '#d97706',
  ZAG: '#2563eb',
  LAT: '#0891b2',
  MEI: '#16a34a',
  ATA: '#dc2626',
}

interface PlayerVisual {
  numeroCarta?: number
  numeroCamisa?: number
  headerBar?: string
  jersey?: string
  sleeve?: string
  collar?: string
  numberColor?: string
  hair?: string
  skin?: string
  badgeText?: string
}

interface Props {
  player: PlayerCardType & { visual?: PlayerVisual }
  activeAttributes?: string[]
  onClick?: () => void
  selected?: boolean
  compact?: boolean
  scale?: number
}

export const PlayerCardComponent = memo(function PlayerCardComponent({ player, activeAttributes, onClick, selected, scale: scaleProp }: Props) {
  const v = player.visual ?? {}
  const headerBar = v.headerBar ?? '#3a3460'
  const jersey = v.jersey ?? '#3a3460'
  const sleeve = v.sleeve ?? '#211d3d'
  const collar = v.collar ?? '#FFFFFF'
  const numberColor = v.numberColor ?? '#FFFFFF'
  const hair = v.hair ?? '#241a12'
  const skin = v.skin ?? '#d39a6a'
  const badgeText = v.badgeText ?? '#0d0b1f'
  const numeroCarta = v.numeroCarta ?? 0
  const numeroCamisa = v.numeroCamisa ?? 0

  const stats: { label: string; value: string; tier: TierName }[] = []
  if (activeAttributes && player.pontosNormalizados) {
    for (const attr of activeAttributes) {
      stats.push({
        label: getAttributeLabel(attr),
        value: String(player.pontosNormalizados[attr] ?? 0),
        tier: player.tiersPorAtributo?.[attr] ?? 'fraco',
      })
    }
  }

  const displayName = player.apelido || player.nome
  const clubLines = packClubLines(player.clubesCarreira)
  const posColor = POSICAO_COLORS[player.posicao] ?? '#6b7280'

  // Total score
  const totalScore = player.pontosNormalizados
    ? Object.values(player.pontosNormalizados).reduce((s, v2) => s + v2, 0)
    : 0

  // Dynamic height: stats start at 350, each stat is 37px, then footer
  const statsHeight = stats.length * 37
  const footerY = 350 + statsHeight + 8
  const cardHeight = footerY + 80 + 12 // footer height + bottom padding
  const viewH = cardHeight - 18 // viewBox starts at y=18

  const scale = scaleProp ?? 0.42
  const w = 388 * scale
  const h = viewH * scale

  const portrait = portraitPaths(hair, skin, jersey, sleeve, collar)
  const shirtNumberPath = pixelNumberPath(numeroCamisa, 340, 291, 5)

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all duration-200 inline-block ${
        selected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-105' : 'hover:scale-105'
      }`}
      style={{ width: w, height: h }}
    >
      <svg
        viewBox={`148 18 388 ${viewH}`}
        width={w}
        height={h}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Frame */}
        <rect x={156} y={26} width={368} height={cardHeight - 26} fill="#ffd84d" />
        <path d={`M156,26h10v10h-10zM514,26h10v10h-10zM156,${cardHeight - 10}h10v10h-10zM514,${cardHeight - 10}h10v10h-10z`} fill="#0d0b1f" />
        <rect x={164} y={34} width={352} height={cardHeight - 42} fill="#211d3d" />

        {/* Header bar */}
        <rect x={176} y={46} width={328} height={44} fill={headerBar} />
        <rect x={184} y={52} width={32} height={32} fill="#ffd84d" rx={2} />
        <text x={200} y={74} textAnchor="middle" fill={badgeText}
          style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 13 }}>
          {numeroCarta}
        </text>

        {/* Position badge - BIG and prominent */}
        <rect x={460} y={52} width={44} height={32} rx={4} fill={posColor} />
        <text x={482} y={74} textAnchor="middle" fill="#FFFFFF"
          style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 11, fontWeight: 'bold' }}>
          {player.posicao}
        </text>

        {/* Name */}
        <text x={180} y={118} fill="#ffd84d"
          style={{ fontFamily: "'VT323',monospace", fontSize: 34, letterSpacing: 1 }}>
          {displayName.length > 16 ? displayName.slice(0, 14) + '…' : displayName}
        </text>
        {/* Subtitle: nationality · club */}
        <text x={181} y={140} fill="#b9b2e0"
          style={{ fontFamily: "'VT323',monospace", fontSize: 17, letterSpacing: 1 }}>
          {player.nacionalidade} · {player.clube}
        </text>

        {/* Portrait */}
        <rect x={176} y={156} width={328} height={120} fill="#8fd3f4" />
        <rect x={176} y={276} width={328} height={56} fill="#3fa95b" />
        <rect x={176} y={276} width={328} height={6} fill="#2f8a48" />
        {portrait.map((p, i) => <path key={i} d={p.d} fill={p.fill} />)}
        <path d={shirtNumberPath} fill={numberColor} />
        <path d="M176,164h328v2h-328zM176,188h328v2h-328zM176,212h328v2h-328zM176,236h328v2h-328zM176,260h328v2h-328zM176,300h328v2h-328z" fill="#000" opacity={0.07} />

        {/* Total score badge */}
        {totalScore > 0 && (
          <>
            <rect x={176} y={336} width={328} height={2} fill="#3a3460" />
            <text x={340} y={350} textAnchor="middle" fill="#ffd84d"
              style={{ fontFamily: "'VT323',monospace", fontSize: 14, letterSpacing: 2 }}>
              TOTAL
            </text>
            <text x={340} y={350} textAnchor="middle" fill="#ffd84d"
              style={{ fontFamily: "'VT323',monospace", fontSize: 14, letterSpacing: 2 }}>
              TOTAL
            </text>
          </>
        )}

        {/* Stats */}
        {stats.map((stat, i) => {
          const dy = 350 + i * 37
          return (
            <g key={i}>
              <rect x={176} y={dy} width={328} height={2} fill="#3a3460" />
              <rect x={182} y={dy + 12} width={10} height={10} fill="#ffd84d" />
              <text x={202} y={dy + 23} fill="#e8e4f5"
                style={{ fontFamily: "'VT323',monospace", fontSize: 20, letterSpacing: 1 }}>
                {stat.label}
              </text>
              <text x={498} y={dy + 24} textAnchor="end" fill={TIER_COLORS[stat.tier]}
                style={{ fontFamily: "'VT323',monospace", fontSize: 25, fontWeight: 'bold' }}>
                {stat.value}
              </text>
            </g>
          )
        })}

        {/* Clubs footer */}
        <rect x={176} y={footerY} width={328} height={2} fill="#3a3460" />
        <rect x={176} y={footerY + 8} width={328} height={72} fill="#1a1733" />
        <text x={340} y={footerY + 28} textAnchor="middle" fill="#fff4d6"
          style={{ fontFamily: "'VT323',monospace", fontSize: 16, letterSpacing: 2 }}>
          CLUBES
        </text>
        {clubLines.map((line, i) => (
          <text key={i} x={340} y={footerY + (clubLines.length === 1 ? 52 : 48 + i * 20)} textAnchor="middle" fill="#b9b2e0"
            style={{ fontFamily: "'VT323',monospace", fontSize: 16, letterSpacing: 1 }}>
            {line}
          </text>
        ))}

        {/* Selected glow */}
        {selected && <rect x={156} y={26} width={368} height={cardHeight - 26} fill="white" opacity={0.08} />}
      </svg>
    </div>
  )
})

function packClubLines(clubs: string[]): string[] {
  if (!clubs || clubs.length === 0) return ['']
  const joined = clubs.join(' · ')
  if (joined.length <= 30) return [joined]
  const mid = Math.ceil(clubs.length / 2)
  return [clubs.slice(0, mid).join(' · '), clubs.slice(mid).join(' · ')]
}
