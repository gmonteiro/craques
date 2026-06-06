import type { PlayerCard } from '../engine/types'
import { PlayerCardComponent } from './PlayerCard'

interface Props {
  cards: PlayerCard[]
  activeAttributes: string[]
  onSelect: (id: string) => void
  selectedIds?: Set<string>
  mobile?: boolean
}

export function Hand({ cards, activeAttributes, onSelect, selectedIds, mobile }: Props) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        Mão vazia
      </div>
    )
  }

  return (
    <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2 px-1 md:px-2 snap-x">
      {cards.map(card => (
        <div key={card.id} className="snap-start flex-shrink-0">
          <PlayerCardComponent
            player={card}
            activeAttributes={activeAttributes}
            onClick={() => onSelect(card.id)}
            selected={selectedIds?.has(card.id)}
            scale={mobile ? 0.35 : 0.45}
          />
        </div>
      ))}
    </div>
  )
}
