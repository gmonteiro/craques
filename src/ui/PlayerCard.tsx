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
  GOL: '#d97706', ZAG: '#2563eb', LAT: '#0891b2', MEI: '#16a34a', ATA: '#dc2626',
}

interface Props {
  player: PlayerCardType & { visual?: Record<string, unknown> }
  activeAttributes?: string[]
  onClick?: () => void
  selected?: boolean
  compact?: boolean
  scale?: number
}

export const PlayerCardComponent = memo(function PlayerCardComponent({ player, activeAttributes, onClick, selected, scale: scaleProp }: Props) {
  const v = (player.visual ?? {}) as Record<string, string | number>
  const headerBar = (v.headerBar as string) ?? '#3a3460'
  const jersey = (v.jersey as string) ?? '#3a3460'
  const sleeve = (v.sleeve as string) ?? '#211d3d'
  const collar = (v.collar as string) ?? '#FFFFFF'
  const numberColor = (v.numberColor as string) ?? '#FFFFFF'
  const hair = (v.hair as string) ?? '#241a12'
  const skin = (v.skin as string) ?? '#d39a6a'
  const numeroCamisa = (v.numeroCamisa as number) ?? 0
  const posColor = POSICAO_COLORS[player.posicao] ?? '#6b7280'

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
  const frameFill = player.raridade === 'lendario' ? '#ffd84d' : player.raridade === 'elite' ? '#c084fc' : '#6b7280'

  // Layout: header(38) + subtitle + portrait + stats + padding
  const statsY = 330
  const statsHeight = stats.length * 38
  const cardHeight = statsY + statsHeight + 16
  const viewH = cardHeight - 18

  const scale = scaleProp ?? 0.42
  const w = 388 * scale
  const h = viewH * scale

  const portrait = portraitPaths(hair, skin, jersey, sleeve, collar)
  const shirtNumberPath = pixelNumberPath(numeroCamisa, 340, 286, 9)

  const glowClass = player.raridade === 'lendario'
    ? 'drop-shadow-[0_0_8px_rgba(255,216,77,0.6)]'
    : player.raridade === 'elite'
    ? 'drop-shadow-[0_0_6px_rgba(192,132,252,0.5)]'
    : ''

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all duration-200 inline-block ${glowClass} ${
        selected ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900 scale-105' : 'hover:scale-105'
      }`}
      style={{ width: w, height: h }}
    >
      <svg viewBox={`148 18 388 ${viewH}`} width={w} height={h} xmlns="http://www.w3.org/2000/svg">
        {/* Frame */}
        <rect x={156} y={26} width={368} height={cardHeight - 26} fill={frameFill} />
        <path d={`M156,26h10v10h-10zM514,26h10v10h-10zM156,${cardHeight - 10}h10v10h-10zM514,${cardHeight - 10}h10v10h-10z`} fill="#0d0b1f" />
        <rect x={164} y={34} width={352} height={cardHeight - 42} fill="#211d3d" />

        {/* Header: position badge + name */}
        <rect x={176} y={42} width={328} height={38} fill={headerBar} />
        <rect x={180} y={46} width={56} height={30} rx={3} fill={posColor} />
        <text x={208} y={69} textAnchor="middle" fill="#FFF"
          style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 16 }}>
          {player.posicao}
        </text>
        <text x={244} y={70} fill="#fff"
          style={{ fontFamily: "'VT323',monospace", fontSize: 30, fontWeight: 'bold' }}>
          {displayName.length > 12 ? displayName.slice(0, 11) + '..' : displayName}
        </text>

        {/* Subtitle */}
        <text x={180} y={94} fill="#b9b2e0"
          style={{ fontFamily: "'VT323',monospace", fontSize: 20 }}>
          {player.nacionalidade} · {player.clube}
        </text>

        {/* Portrait (starts at y=100, smaller) */}
        <rect x={176} y={100} width={328} height={100} fill="#8fd3f4" />
        <rect x={176} y={200} width={328} height={56} fill="#3fa95b" />
        <rect x={176} y={200} width={328} height={5} fill="#2f8a48" />
        {/* Shift portrait up by adjusting transform */}
        <g transform="translate(0,-56)">
          {portrait.map((p, i) => <path key={i} d={p.d} fill={p.fill} />)}
          <path d={shirtNumberPath} fill={numberColor} />
        </g>
        {/* Scanlines */}
        <path d="M176,108h328v2h-328zM176,128h328v2h-328zM176,148h328v2h-328zM176,168h328v2h-328zM176,188h328v2h-328zM176,220h328v2h-328z" fill="#000" opacity={0.06} />

        {/* Stats */}
        {stats.map((stat, i) => {
          const dy = statsY + i * 38
          return (
            <g key={i}>
              <rect x={176} y={dy} width={328} height={1} fill="#3a3460" />
              <rect x={182} y={dy + 11} width={10} height={10} fill="#ffd84d" />
              <text x={198} y={dy + 24} fill="#e8e4f5"
                style={{ fontFamily: "'VT323',monospace", fontSize: 24 }}>
                {stat.label}
              </text>
              <text x={498} y={dy + 25} textAnchor="end" fill={TIER_COLORS[stat.tier]}
                style={{ fontFamily: "'VT323',monospace", fontSize: 30, fontWeight: 'bold' }}>
                {stat.value}
              </text>
            </g>
          )
        })}

        {/* Selected glow */}
        {selected && <rect x={156} y={26} width={368} height={cardHeight - 26} fill="white" opacity={0.06} />}
      </svg>
    </div>
  )
})
