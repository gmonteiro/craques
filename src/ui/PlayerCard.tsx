import { memo } from 'react'
import type { PlayerCard as PlayerCardType } from '../engine/types'
import { getAttributeLabel } from '../engine/attributes'
import { PixelFace } from './PixelFace'

function abbreviate(label: string): string {
  const map: Record<string, string> = {
    'Velocidade': 'Vel', 'Finalização': 'Fin', 'Assistências': 'Ast',
    'Gols pela Seleção': 'G.Sel', 'Valor de Mercado': 'V.Merc',
    'Seguidores': 'Seg', 'Títulos': 'Tít',
  }
  return map[label] ?? label
}

function formatRaw(v: number): string {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(0) + 'B'
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(0) + 'M'
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K'
  return String(v)
}

const POS_COLORS: Record<string, string> = {
  GOL: 'var(--pos-gol)',
  ZAG: 'var(--pos-zag)',
  LAT: 'var(--pos-lat)',
  MEI: 'var(--pos-mei)',
  ATA: 'var(--pos-ata)',
}

const STAT_COLORS = [
  'var(--green)',    // first attribute
  'var(--gold)',     // second
  'var(--pos-mei)',  // third
]

interface Props {
  player: PlayerCardType & { visual?: Record<string, unknown> }
  activeAttributes?: string[]
  onClick?: () => void
  selected?: boolean
  compact?: boolean
  scale?: number
}

export const PlayerCardComponent = memo(function PlayerCardComponent({
  player, activeAttributes, onClick, selected, scale: scaleProp,
}: Props) {
  const v = (player.visual ?? {}) as Record<string, string | number>
  const band = (v.headerBar as string) ?? '#3a3460'
  const shirt = (v.jersey as string) ?? '#3a3460'
  const numc = (v.numberColor as string) ?? '#fff'
  const numeroCamisa = (v.numeroCamisa as number) ?? 0
  const posColor = POS_COLORS[player.posicao] ?? 'var(--label)'
  const displayName = player.apelido || player.nome
  const lightBand = band === '#dfe3ea' || band === '#FFFFFF'

  const stats: { label: string; value: number; rawValue: number; color: string }[] = []
  if (activeAttributes && player.pontosNormalizados) {
    for (let i = 0; i < activeAttributes.length; i++) {
      const attr = activeAttributes[i]
      stats.push({
        label: abbreviate(getAttributeLabel(attr)),
        value: player.pontosNormalizados[attr] ?? 0,
        rawValue: player.atributos[attr] ?? 0,
        color: STAT_COLORS[i % STAT_COLORS.length],
      })
    }
  }

  const scale = scaleProp ?? 0.85
  const baseW = 176
  const w = baseW * scale

  const borderStyle = selected
    ? '2px solid var(--accent)'
    : player.raridade === 'lendario'
    ? '2px solid var(--gold)'
    : 'none'

  const shadowStyle = selected
    ? '0 0 0 3px var(--accent), 0 10px 0 rgba(0,0,0,.3), 0 16px 24px rgba(0,0,0,.45)'
    : player.raridade === 'lendario'
    ? '0 0 10px rgba(242,193,78,.3), 0 7px 0 rgba(0,0,0,.32), 0 13px 22px rgba(0,0,0,.4)'
    : '0 7px 0 rgba(0,0,0,.32), 0 13px 22px rgba(0,0,0,.4)'

  return (
    <div
      onClick={onClick}
      style={{ width: w, flexShrink: 0, cursor: 'pointer', display: 'inline-block' }}
    >
      <div style={{
        width: baseW,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        borderRadius: 16,
        overflow: 'hidden',
        background: '#f4f6f1',
        border: borderStyle,
        boxShadow: shadowStyle,
        transition: 'border-color .15s, box-shadow .15s',
      }}>
        {/* Band header */}
        <div style={{
          background: band,
          padding: '8px 10px 9px',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.18), inset 0 2px 0 rgba(255,255,255,.18)',
        }}>
          <span className="postag" style={{ background: posColor }}>{player.posicao}</span>
          <span style={{
            fontFamily: '"Jersey 10", monospace',
            fontSize: 21,
            lineHeight: 1,
            color: lightBand ? '#222a2e' : '#fff',
            textShadow: lightBand ? 'none' : '0 2px 0 rgba(0,0,0,.4)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
          }}>
            {displayName}
          </span>
        </div>

        {/* Subtitle bar */}
        <div className="micro" style={{
          padding: '6px 11px 8px',
          fontSize: 9.5,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: '#5d7466',
          background: '#eef1ea',
        }}>
          {player.nacionalidade} · {player.clube}
        </div>

        {/* Portrait with pixel face */}
        <div style={{ padding: '0 11px' }}>
          <div style={{
            position: 'relative',
            height: 96,
            borderRadius: 8,
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #8fcde8, #cfe9f4)',
            border: '2px solid rgba(0,0,0,.10)',
            display: 'grid',
            placeItems: 'end center',
          }}>
            {/* Grass strip */}
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: 24,
              background: 'linear-gradient(180deg, #3f9d57, #2f7e43)',
              borderTop: '2px solid rgba(0,0,0,.12)',
              zIndex: 0,
            }} />
            {/* Pixel face avatar */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <PixelFace playerId={player.id} shirt={shirt} numc={numc} size={90} />
            </div>
            {/* Squad number chip */}
            <div style={{
              position: 'absolute', bottom: 4, right: 6, zIndex: 2,
              background: 'rgba(8,16,11,.62)', borderRadius: 6,
              padding: '1px 6px 0',
            }}>
              <span className="val" style={{ fontSize: 16, color: numc }}>{numeroCamisa}</span>
            </div>
            {/* Scanlines */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.10) 0 1px, transparent 1px 3px)',
            }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: '11px 12px 13px', display: 'grid', gap: 7 }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 7, height: 20,
            }}>
              <span style={{
                width: 7, height: 7, background: s.color, borderRadius: 2, flexShrink: 0,
                boxShadow: 'inset 0 -1px 0 rgba(0,0,0,.3)',
              }} />
              <span style={{
                fontFamily: '"Jersey 10", monospace', fontSize: 16, color: '#3a4a40',
                flexShrink: 0, width: 46,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {s.label}
              </span>
              <span style={{
                flex: 1, height: 8, background: '#dde4dd', borderRadius: 4, overflow: 'hidden',
                boxShadow: 'inset 0 1px 1px rgba(0,0,0,.18)',
              }}>
                <span style={{
                  display: 'block', height: '100%',
                  width: s.value + '%',
                  background: s.color, borderRadius: 4,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4)',
                  transition: 'width .3s',
                }} />
              </span>
              <span style={{
                fontFamily: '"Jersey 10", monospace', fontSize: 17, color: '#1f2a24',
                textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap',
              }}>
                {s.value}
                <span style={{ fontSize: 11, color: '#8a9e90', marginLeft: 1 }}>({formatRaw(s.rawValue)})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
