import type { BoostCard } from '../engine/types'
import { BoostCardComponent } from './BoostCard'

interface Props {
  boosts: BoostCard[]
}

export function BoostBar({ boosts }: Props) {
  if (boosts.length === 0) return null

  return (
    <div className="px-2">
      <span className="text-xs font-bold text-gray-400 mb-1 block">Boosts Ativos</span>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {boosts.map(boost => (
          <div key={boost.id} className="flex-shrink-0">
            <BoostCardComponent boost={boost} compact />
          </div>
        ))}
      </div>
    </div>
  )
}
