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
                scale={mobile ? 0.35 : 0.45}
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
