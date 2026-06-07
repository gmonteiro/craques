import type { PlayerCard } from '../engine/types'
import { PlayerCardComponent } from './PlayerCard'

interface Props {
  cards: PlayerCard[]
  activeAttributes: string[]
  onSelect: (id: string) => void
  selectedIds?: Set<string>
  escaladoIds?: Set<string>
  mobile?: boolean
  deckSize?: number
}

export function Hand({ cards, activeAttributes, onSelect, selectedIds, escaladoIds, mobile, deckSize }: Props) {
  if (cards.length === 0 && !deckSize) {
    return (
      <div className="val" style={{
        textAlign: 'center',
        padding: '16px 0',
        color: 'var(--ink-dim)',
        fontSize: 22,
      }}>
        Mao vazia
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
      {/* Scrollable cards */}
      <div
        className="scroll"
        style={{
          display: 'flex',
          gap: mobile ? 2 : 6,
          overflowX: 'auto',
          paddingBottom: 4,
          paddingTop: 20,
          flex: 1,
          minWidth: 0,
        }}
      >
        {cards.map(card => {
          const isSelected = selectedIds?.has(card.id) ?? false
          const isEscalado = escaladoIds?.has(card.id) ?? false

          return (
            <div
              key={card.id}
              style={{
                flexShrink: 0,
                transform: isSelected ? 'translateY(-16px)' : 'translateY(0)',
                transition: 'transform 0.15s ease, opacity 0.2s ease, filter 0.2s ease',
                opacity: isEscalado ? 0.32 : 1,
                filter: isEscalado ? 'grayscale(0.5)' : 'none',
                cursor: isEscalado ? 'not-allowed' : 'pointer',
              }}
            >
              <PlayerCardComponent
                player={card}
                activeAttributes={activeAttributes}
                onClick={() => !isEscalado && onSelect(card.id)}
                selected={isSelected}
                scale={mobile ? 0.65 : 0.85}
              />
            </div>
          )
        })}
      </div>

      {/* Deck stack (right side) — red card backs like handoff */}
      {deckSize != null && deckSize > 0 && (
        <div style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingLeft: 8,
          borderLeft: '2px solid var(--panel-line)',
        }}>
          <div style={{ position: 'relative', width: 92, height: 128 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                position: 'absolute',
                inset: 0,
                transform: `translate(${i * 3}px, ${-i * 3}px)`,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #c0392b, #8e2a20)',
                border: '3px solid #f4f6f1',
                boxShadow: '0 5px 0 rgba(0,0,0,.35)',
              }}>
                {i === 2 && (
                  <div style={{
                    position: 'absolute', inset: 8, borderRadius: 6,
                    border: '2px solid rgba(255,255,255,.5)',
                    background: 'repeating-linear-gradient(45deg, rgba(255,255,255,.12) 0 6px, transparent 6px 12px)',
                  }} />
                )}
              </div>
            ))}
          </div>
          <div className="micro" style={{ fontSize: 12, color: 'var(--ink-dim)', marginTop: 6 }}>
            Cartas {deckSize}
          </div>
        </div>
      )}
    </div>
  )
}
