import type { PlayerCard } from '../engine/types'
import { PlayerCardComponent } from './PlayerCard'

interface Props {
  cards: PlayerCard[]
  activeAttributes: string[]
  onSelect: (id: string) => void
  selectedIds?: Set<string>
  escaladoIds?: Set<string>
  comboHighlights?: Map<string, number>
  mobile?: boolean
  deckSize?: number
}

export function Hand({ cards, activeAttributes, onSelect, selectedIds, escaladoIds, comboHighlights, mobile, deckSize }: Props) {
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
          flex: 1,
          minWidth: 0,
        }}
      >
        {cards.map(card => {
          const isSelected = selectedIds?.has(card.id) ?? false
          const isEscalado = escaladoIds?.has(card.id) ?? false
          const comboCount = comboHighlights?.get(card.id) ?? 0

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
                position: 'relative',
              }}
            >
              {/* Combo highlight glow */}
              {comboCount > 0 && !isEscalado && (
                <div style={{
                  position: 'absolute',
                  inset: -3,
                  borderRadius: 18,
                  border: '2px solid var(--gold)',
                  boxShadow: '0 0 12px rgba(242,193,78,.4), inset 0 0 8px rgba(242,193,78,.1)',
                  pointerEvents: 'none',
                  zIndex: 10,
                  animation: 'breathe 1.4s ease-in-out infinite',
                }}>
                  <span style={{
                    position: 'absolute',
                    top: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--gold)',
                    color: '#1a1000',
                    fontFamily: '"Silkscreen", monospace',
                    fontSize: 8,
                    padding: '1px 5px',
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                  }}>
                    +{comboCount} COMBO
                  </span>
                </div>
              )}
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

      {/* Deck stack (right side) */}
      {deckSize != null && deckSize > 0 && (
        <div style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginLeft: 4,
        }}>
          <div style={{ position: 'relative', width: 48, height: 64 }}>
            {/* Stacked card backs */}
            {[2, 1, 0].map(i => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: i * 2,
                  top: i * 2,
                  width: 44,
                  height: 58,
                  background: 'linear-gradient(180deg, var(--panel-3), var(--panel))',
                  border: '2px solid var(--panel-line)',
                  borderRadius: 'var(--r-sm)',
                  boxShadow: i === 0
                    ? 'inset 0 1px 0 var(--panel-top), 0 3px 6px rgba(0,0,0,0.3)'
                    : 'none',
                }}
              />
            ))}
          </div>
          <span className="micro" style={{
            marginTop: 4,
            fontSize: 9,
            color: 'var(--label)',
          }}>
            {deckSize}
          </span>
        </div>
      )}
    </div>
  )
}
