import type { PlayerCard } from '../engine/types'
import { PlayerCardComponent } from './PlayerCard'

interface Props {
  escalacao: PlayerCard[]
  activeAttributes: string[]
  maxSlots: number
  onRemove: (id: string) => void
}

export function PlayArea({ escalacao, activeAttributes, maxSlots, onRemove }: Props) {
  const emptySlots = maxSlots - escalacao.length

  return (
    <div>
      {/* Label */}
      <div className="mb-2 px-2">
        <span className="text-sm font-bold text-gray-300">
          Escalacao ({escalacao.length}/{maxSlots})
        </span>
      </div>

      {/* Slots */}
      <div className="flex gap-2 justify-center flex-wrap">
        {escalacao.map(card => (
          <PlayerCardComponent
            key={card.id}
            player={card}
            activeAttributes={activeAttributes}
            onClick={() => onRemove(card.id)}
            selected
            scale={0.42}
          />
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{ width: 388 * 0.42, height: 686 * 0.42 }}
            className="rounded border-2 border-dashed border-gray-700 flex items-center justify-center"
          >
            <span className="text-gray-600 text-xs">Vazio</span>
          </div>
        ))}
      </div>
    </div>
  )
}
