import type { PlayerCard } from '../engine/types'
import { PlayerCardComponent } from './PlayerCard'
import { detectCombos } from '../engine/combos'

interface Props {
  escalacao: PlayerCard[]
  activeAttributes: string[]
  maxSlots: number
  onRemove: (id: string) => void
}

export function PlayArea({ escalacao, activeAttributes, maxSlots, onRemove }: Props) {
  const combos = detectCombos(escalacao)
  const emptySlots = maxSlots - escalacao.length

  return (
    <div>
      {/* Label */}
      <div className="flex items-center justify-between mb-2 px-2">
        <span className="text-sm font-bold text-gray-300">
          Escalacao ({escalacao.length}/{maxSlots})
        </span>
        {combos.length > 0 && (
          <div className="flex gap-1">
            {combos.map(combo => (
              <span
                key={combo.id}
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  combo.tipo === 'mult'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {combo.nome} {combo.tipo === 'mult' ? `x${combo.valor}` : `+${combo.valor}`}
              </span>
            ))}
          </div>
        )}
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
          />
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-40 h-48 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center"
          >
            <span className="text-gray-600 text-xs">Vazio</span>
          </div>
        ))}
      </div>
    </div>
  )
}
