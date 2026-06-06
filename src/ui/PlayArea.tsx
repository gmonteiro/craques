import type { PlayerCard } from '../engine/types'
import { PlayerCardComponent } from './PlayerCard'

interface Props {
  escalacao: PlayerCard[]
  activeAttributes: string[]
  maxSlots: number
  onRemove: (id: string) => void
  mobile?: boolean
}

export function PlayArea({ escalacao, activeAttributes, maxSlots, onRemove, mobile }: Props) {
  const emptySlots = maxSlots - escalacao.length
  const scale = mobile ? 0.38 : 0.50
  const emptyW = 388 * scale
  const emptyH = 500 * scale

  return (
    <div>
      <div className="mb-2 px-2">
        <span className="text-xs md:text-sm font-bold text-gray-300">
          Escalacao ({escalacao.length}/{maxSlots})
        </span>
      </div>

      <div className="flex gap-1 md:gap-2 overflow-x-auto snap-x md:flex-wrap md:justify-center md:overflow-visible pb-2">
        {escalacao.map(card => (
          <div key={card.id} className="snap-start flex-shrink-0 md:flex-shrink">
            <PlayerCardComponent
              player={card}
              activeAttributes={activeAttributes}
              onClick={() => onRemove(card.id)}
              selected
              scale={scale}
            />
          </div>
        ))}
        {!mobile && Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{ width: emptyW, height: emptyH }}
            className="rounded border-2 border-dashed border-gray-700 flex items-center justify-center flex-shrink-0"
          >
            <span className="text-gray-600 text-xs">Vazio</span>
          </div>
        ))}
        {mobile && emptySlots > 0 && (
          <div
            style={{ width: emptyW * 0.5, height: emptyH }}
            className="rounded border-2 border-dashed border-gray-700 flex items-center justify-center flex-shrink-0"
          >
            <span className="text-gray-600 text-[10px]">+{emptySlots}</span>
          </div>
        )}
      </div>
    </div>
  )
}
