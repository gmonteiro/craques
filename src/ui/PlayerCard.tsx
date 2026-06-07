import { memo } from 'react'
import type { PlayerCard as PlayerCardType } from '../engine/types'
import { getAttributeLabel } from '../engine/attributes'

const POS_COLORS: Record<string, string> = {
  GOL: 'var(--pos-gol)', ZAG: 'var(--pos-zag)', LAT: 'var(--pos-lat)',
  MEI: 'var(--pos-mei)', ATA: 'var(--pos-ata)',
}

const STAT_COLORS = ['var(--green)', 'var(--gold)', 'var(--pos-mei)']

function abbreviate(label: string): string {
  const map: Record<string, string> = {
    'Velocidade': 'Vel', 'Finalização': 'Fin', 'Assistências': 'Ast',
    'Gols pela Seleção': 'GSel', 'Valor de Mercado': 'Val', 'Seguidores': 'Seg',
  }
  return map[label] ?? label
}

function formatRaw(v: number): string {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(0) + 'B'
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(0) + 'M'
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K'
  return String(v)
}

interface Props {
  player: PlayerCardType & { visual?: Record<string, unknown> }
  activeAttributes?: string[]
  onClick?: () => void
  selected?: boolean
  compact?: boolean
  scale?: number
  skinId?: string
}

export const PlayerCardComponent = memo(function PlayerCardComponent({
  player, activeAttributes, onClick, selected, scale: scaleProp,
}: Props) {
  const v = (player.visual ?? {}) as Record<string, string | number>
  const band = (v.headerBar as string) ?? '#3a3460'
  const shirt = (v.jersey as string) ?? '#3a3460'
  const numc = (v.numberColor as string) ?? '#fff'
  const hair = (v.hair as string) ?? '#241a12'
  const skinColor = (v.skin as string) ?? '#d39a6a'
  const numeroCamisa = (v.numeroCamisa as number) ?? 0
  const posColor = POS_COLORS[player.posicao] ?? 'var(--label)'
  const displayName = player.apelido || player.nome

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

  const borderColor = selected ? 'var(--accent)' : band
  const shadow = selected
    ? '0 0 0 3px var(--accent), 0 10px 0 rgba(0,0,0,.32), 0 16px 22px rgba(0,0,0,.45)'
    : player.raridade === 'lendario'
    ? '0 0 12px rgba(242,193,78,.3), 0 7px 0 rgba(0,0,0,.34), 0 12px 20px rgba(0,0,0,.4)'
    : '0 7px 0 rgba(0,0,0,.34), 0 12px 20px rgba(0,0,0,.4)'

  return (
    <div onClick={onClick} style={{ width: w, flexShrink: 0, cursor: 'pointer', display: 'inline-block' }}>
      <div style={{
        width: baseW,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        padding: 4,
        background: 'linear-gradient(180deg, #11201a, #0c1812)',
        border: `3px solid ${borderColor}`,
        boxShadow: shadow,
        transition: 'border-color .15s, box-shadow .15s',
      }}>
        {/* Header: pos + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 5px 6px' }}>
          <span className="postag" style={{ background: posColor }}>{player.posicao}</span>
          <span className="val" style={{
            fontSize: 22, color: '#fff', lineHeight: 1,
            textShadow: '0 2px 0 rgba(0,0,0,.5)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{displayName}</span>
        </div>

        {/* Subtitle */}
        <div className="micro" style={{ padding: '0 6px 6px', fontSize: 9, color: '#7c9686' }}>
          {player.nacionalidade} · {player.clube}
        </div>

        {/* Portrait with sky frame + scanlines */}
        <div style={{
          background: 'linear-gradient(180deg, #7fc4e6, #cfe9f4)',
          borderRadius: 6, overflow: 'hidden',
          border: '2px solid rgba(0,0,0,.25)',
        }}>
          <div style={{
            position: 'relative', height: 96, borderRadius: 4, overflow: 'hidden',
            background: `repeating-linear-gradient(135deg, ${band}22 0 8px, ${band}33 8px 16px)`,
            display: 'grid', placeItems: 'center',
          }}>
            {/* Grass */}
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: 30,
              background: 'linear-gradient(180deg, #3f9d57, #2f7e43)',
              borderTop: '2px solid rgba(0,0,0,.12)',
            }} />

            {/* Player figure */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -6 }}>
              {/* Hair */}
              <div style={{ width: 30, height: 12, background: hair, borderRadius: '15px 15px 2px 2px' }} />
              {/* Face */}
              <div style={{
                width: 26, height: 16, background: skinColor,
                borderRadius: '2px 2px 8px 8px', marginTop: -1,
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: 4, left: 3, width: 5, height: 4, borderRadius: 1, background: '#241a12' }} />
                <div style={{ position: 'absolute', top: 4, right: 3, width: 5, height: 4, borderRadius: 1, background: '#241a12' }} />
                <div style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 8, height: 3, borderRadius: 2, background: '#b5654a' }} />
              </div>
              {/* Neck */}
              <div style={{ width: 8, height: 3, background: skinColor }} />
              {/* Shirt */}
              <div style={{
                width: 52, height: 38, background: shirt,
                borderRadius: '8px 8px 4px 4px',
                boxShadow: 'inset 0 2px 0 rgba(255,255,255,.25), inset 0 -3px 0 rgba(0,0,0,.18)',
                display: 'grid', placeItems: 'center',
                marginTop: -1,
              }}>
                <span className="val" style={{ fontSize: 28, color: numc, textShadow: '0 2px 0 rgba(0,0,0,.25)' }}>
                  {numeroCamisa}
                </span>
              </div>
            </div>

            {/* Scanlines overlay */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.10) 0 1px, transparent 1px 3px)',
            }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gap: 5, padding: '8px 6px 5px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, background: s.color, flexShrink: 0 }} />
              <span className="val" style={{ fontSize: 16, color: '#cfe0d4', flex: 1 }}>{s.label}</span>
              <span className="val" style={{ fontSize: 19, color: '#fff', textShadow: '0 1px 0 rgba(0,0,0,.6)' }}>
                {s.value}
                <span style={{ fontSize: 11, color: '#8ea597', marginLeft: 2 }}>({formatRaw(s.rawValue)})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
