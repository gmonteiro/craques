import type { PlayerCard } from '../engine/types'

/** Formation slot positions (percentage-based) */
const SLOT_POS = [
  { x: '24%', y: '32%' },
  { x: '24%', y: '68%' },
  { x: '50%', y: '50%' },
  { x: '74%', y: '33%' },
  { x: '74%', y: '67%' },
]

const POS_COLORS: Record<string, string> = {
  GOL: 'var(--pos-gol)',
  ZAG: 'var(--pos-zag)',
  LAT: 'var(--pos-lat)',
  MEI: 'var(--pos-mei)',
  ATA: 'var(--pos-ata)',
}

interface Props {
  escalacao: PlayerCard[]
  activeAttributes: string[]
  maxSlots: number
  onRemove: (id: string) => void
  onSlotClick?: (slotIndex: number) => void
  mobile?: boolean
}

export function PlayArea({ escalacao, maxSlots, onRemove, onSlotClick }: Props) {
  // Build slots: filled with players from escalacao, rest empty
  const slots: (PlayerCard | null)[] = []
  for (let i = 0; i < maxSlots; i++) {
    slots.push(escalacao[i] ?? null)
  }

  return (
    <div
      className="panel"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4 / 3',
        background: 'radial-gradient(130% 120% at 50% 0%, var(--felt-2), var(--felt-0))',
        overflow: 'hidden',
        minHeight: 240,
      }}
    >
      {/* Pitch markings */}
      {/* Stripes */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(90deg, var(--line-soft) 0 90px, transparent 90px 180px)',
      }} />

      {/* Pitch outline */}
      <div style={{
        position: 'absolute', inset: '6%',
        border: '2px solid var(--line)',
        borderRadius: 4,
        pointerEvents: 'none',
      }} />

      {/* Center line */}
      <div style={{
        position: 'absolute', left: '50%', top: '6%', bottom: '6%',
        width: 2, background: 'var(--line)',
        transform: 'translateX(-1px)',
        pointerEvents: 'none',
      }} />

      {/* Center circle */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: 80, height: 80,
        border: '2px solid var(--line)',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      {/* Left penalty area */}
      <div style={{
        position: 'absolute', left: '6%', top: '28%', bottom: '28%',
        width: '12%',
        border: '2px solid var(--line)',
        borderLeft: 'none',
        pointerEvents: 'none',
      }} />

      {/* Right penalty area */}
      <div style={{
        position: 'absolute', right: '6%', top: '28%', bottom: '28%',
        width: '12%',
        border: '2px solid var(--line)',
        borderRight: 'none',
        pointerEvents: 'none',
      }} />

      {/* Slots */}
      {slots.map((card, i) => {
        const pos = SLOT_POS[i] ?? { x: '50%', y: '50%' }
        return (
          <div
            key={card?.id ?? `empty-${i}`}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: card ? 'pointer' : onSlotClick ? 'pointer' : 'default',
              zIndex: 2,
            }}
            onClick={() => {
              if (card) {
                onRemove(card.id)
              } else if (onSlotClick) {
                onSlotClick(i)
              }
            }}
          >
            {card ? (
              /* Filled slot: player token — uses shirt/numc from visual */
              (() => {
                const v = (card.visual ?? {}) as Record<string, string | number>
                const shirtColor = (v.jersey as string) ?? (v.headerBar as string) ?? '#3a3460'
                const numColor = (v.numberColor as string) ?? '#fff'
                const num = (v.numeroCamisa as number) ?? 0
                const posCol = POS_COLORS[card.posicao] ?? '#6b7280'
                return (
                  <>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: 64, height: 64,
                        borderRadius: '50%',
                        background: shirtColor,
                        border: '3px solid #f4f6f1',
                        display: 'grid',
                        placeItems: 'center',
                        boxShadow: '0 6px 0 rgba(0,0,0,.4), 0 10px 16px rgba(0,0,0,.5), inset 0 3px 0 rgba(255,255,255,.25)',
                      }}>
                        <span style={{
                          fontFamily: '"Jersey 10", monospace',
                          fontSize: 34,
                          color: numColor,
                          textShadow: '0 2px 0 rgba(0,0,0,.3)',
                          lineHeight: 1,
                        }}>
                          {num}
                        </span>
                      </div>
                      {/* Position chip — top right of circle */}
                      <span className="postag" style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        background: posCol,
                        fontSize: 9,
                      }}>
                        {card.posicao}
                      </span>
                    </div>
                    {/* Name badge below */}
                    <span style={{
                      fontFamily: '"Jersey 10", monospace',
                      fontSize: 17,
                      color: '#fff',
                      background: 'rgba(8,16,11,.78)',
                      padding: '2px 9px 1px',
                      borderRadius: 7,
                      textShadow: '0 1px 0 rgba(0,0,0,.6)',
                      whiteSpace: 'nowrap',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.1)',
                      marginTop: 5,
                      maxWidth: 100,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {card.apelido}
                    </span>
                  </>
                )
              })()
            ) : (
              /* Empty slot: dashed circle */
              <div style={{
                width: 72, height: 72,
                borderRadius: '50%',
                border: '3px dashed var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.6,
                transition: 'opacity 0.15s ease',
              }}>
                <span className="micro" style={{ fontSize: 9, color: 'var(--label)' }}>
                  {i + 1}
                </span>
              </div>
            )}
          </div>
        )
      })}

      {/* Escalacao count label */}
      <div style={{
        position: 'absolute',
        bottom: 6,
        right: 10,
        zIndex: 3,
      }}>
        <span className="micro" style={{ fontSize: 9 }}>
          {escalacao.length}/{maxSlots}
        </span>
      </div>
    </div>
  )
}
