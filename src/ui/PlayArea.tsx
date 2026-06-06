import { useRef, useState, useEffect } from 'react'
import type { PlayerCard } from '../engine/types'
import { PlayerCardComponent } from './PlayerCard'

interface Props {
  escalacao: PlayerCard[]
  activeAttributes: string[]
  maxSlots: number
  onRemove: (id: string) => void
  mobile?: boolean
}

// Card base width = 388, dynamic height ~470 (3 stats)
const CARD_W = 388
const GAP = 6

export function PlayArea({ escalacao, activeAttributes, maxSlots, onRemove, mobile }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fitScale, setFitScale] = useState(mobile ? 0.38 : 0.50)

  // Calculate scale to fit all maxSlots cards in container width
  useEffect(() => {
    function calc() {
      if (!containerRef.current) return
      const containerW = containerRef.current.clientWidth
      const totalGaps = (maxSlots - 1) * GAP
      const availableW = containerW - totalGaps - 8 // 8px padding
      const idealScale = availableW / (maxSlots * CARD_W)
      // Clamp between 0.22 (min readable) and 0.55 (max desktop)
      const clamped = Math.min(Math.max(idealScale, 0.22), 0.55)
      setFitScale(clamped)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [maxSlots])

  const emptySlots = maxSlots - escalacao.length

  return (
    <div ref={containerRef}>
      <div className="mb-1 px-1">
        <span className="text-xs md:text-sm font-bold text-gray-300">
          Escalacao ({escalacao.length}/{maxSlots})
        </span>
      </div>

      <div className="flex justify-center px-1" style={{ gap: GAP }}>
        {escalacao.map(card => (
          <PlayerCardComponent
            key={card.id}
            player={card}
            activeAttributes={activeAttributes}
            onClick={() => onRemove(card.id)}
            selected
            scale={fitScale}
          />
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{ width: CARD_W * fitScale, height: 470 * fitScale }}
            className="rounded border-2 border-dashed border-gray-700/50 flex items-center justify-center"
          >
            <span className="text-gray-700 text-[10px]">Vazio</span>
          </div>
        ))}
      </div>
    </div>
  )
}
