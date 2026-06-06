import { memo } from 'react'
import type { PlayerCard as PlayerCardType, TierName } from '../engine/types'
import { getAttributeLabel } from '../engine/attributes'

const POS_COLORS: Record<string, string> = {
  GOL: 'var(--pos-gol)',
  ZAG: 'var(--pos-zag)',
  LAT: 'var(--pos-lat)',
  MEI: 'var(--pos-mei)',
  ATA: 'var(--pos-ata)',
}

const STAT_COLORS: Record<TierName, string> = {
  lendario: 'var(--gold)',
  elite: 'var(--pos-mei)',
  bom: 'var(--green)',
  regular: 'var(--ink-dim)',
  fraco: 'var(--label)',
}

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
  const numeroCamisa = (v.numeroCamisa as number) ?? 0
  const posColor = POS_COLORS[player.posicao] ?? 'var(--label)'

  const displayName = player.apelido || player.nome

  const stats: { label: string; value: number; color: string }[] = []
  if (activeAttributes && player.pontosNormalizados) {
    const tierColors = [
      'var(--green)',  // first stat
      'var(--gold)',   // second stat
      'var(--pos-mei)', // third stat
    ]
    for (let i = 0; i < activeAttributes.length; i++) {
      const attr = activeAttributes[i]
      stats.push({
        label: getAttributeLabel(attr),
        value: player.pontosNormalizados[attr] ?? 0,
        color: tierColors[i % tierColors.length],
      })
    }
  }

  const scale = scaleProp ?? 0.45
  const baseW = 176
  const baseH = 246
  const w = baseW * scale
  const h = baseH * scale

  // Glow for legendaries
  const glowBorder = player.raridade === 'lendario'
    ? '2px solid var(--gold)'
    : player.raridade === 'elite'
    ? '2px solid var(--pos-mei)'
    : selected
    ? '2px solid var(--accent)'
    : '2px solid #0e1813'

  const glowShadow = selected
    ? '0 0 0 3px var(--accent), 0 10px 0 rgba(0,0,0,.3), 0 16px 24px rgba(0,0,0,.45)'
    : player.raridade === 'lendario'
    ? '0 0 12px rgba(242,193,78,.3), inset 0 2px 0 rgba(255,255,255,.05), 0 7px 0 rgba(0,0,0,.32), 0 12px 20px rgba(0,0,0,.4)'
    : 'inset 0 2px 0 rgba(255,255,255,.05), 0 7px 0 rgba(0,0,0,.32), 0 12px 20px rgba(0,0,0,.4)'

  return (
    <div
      onClick={onClick}
      style={{
        width: w,
        height: h,
        cursor: 'pointer',
        flexShrink: 0,
        display: 'inline-block',
      }}
    >
      <div style={{
        width: baseW,
        height: baseH,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #222e27, #1a241e)',
        border: glowBorder,
        boxShadow: glowShadow,
        padding: '13px 14px 14px',
        transition: 'border-color .15s, box-shadow .15s',
      }}>
        {/* Watermark number */}
        <span style={{
          position: 'absolute',
          right: -8,
          top: -22,
          fontFamily: '"Jersey 10", monospace',
          fontSize: 150,
          color: band,
          opacity: 0.18,
          lineHeight: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          {numeroCamisa}
        </span>

        {/* Position chip + club dot */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          position: 'relative',
        }}>
          <span className="postag" style={{ background: posColor }}>{player.posicao}</span>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: band,
            boxShadow: '0 0 0 2px rgba(0,0,0,.25)',
          }} />
        </div>

        {/* Name */}
        <div style={{
          fontFamily: '"Jersey 10", monospace',
          fontSize: 25,
          color: '#fff',
          marginTop: 10,
          lineHeight: 0.92,
          textShadow: '0 2px 0 rgba(0,0,0,.5)',
          position: 'relative',
          maxWidth: 138,
          wordBreak: 'break-word',
        }}>
          {displayName}
        </div>

        {/* Subtitle */}
        <div className="micro" style={{
          marginTop: 4,
          color: '#7c9686',
          position: 'relative',
          fontSize: 9,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {player.nacionalidade} · {player.clube}
        </div>

        {/* Stats (anchored to bottom) */}
        <div style={{
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 13,
          display: 'grid',
          gap: 9,
        }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{
                fontFamily: '"Jersey 10", monospace',
                fontSize: 16,
                color: '#8ea597',
                width: 50,
                flexShrink: 0,
              }}>
                {s.label}
              </span>
              <span style={{
                flex: 1,
                height: 9,
                background: '#0e1813',
                borderRadius: 5,
                overflow: 'hidden',
              }}>
                <span style={{
                  display: 'block',
                  height: '100%',
                  width: s.value + '%',
                  background: s.color,
                  borderRadius: 5,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4)',
                  transition: 'width .3s',
                }} />
              </span>
              <span style={{
                fontFamily: '"Jersey 10", monospace',
                fontSize: 19,
                color: '#fff',
                width: 26,
                textAlign: 'right',
                flexShrink: 0,
              }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
