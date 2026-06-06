import { useEffect, useState } from 'react'
import type { ScoreResult } from '../engine/types'

interface Props {
  result: ScoreResult | null
  meta: number
  tentativas: number
  trocas: number
}

export function ScoreDisplay({ result, meta, tentativas, trocas }: Props) {
  const [animatedTotal, setAnimatedTotal] = useState(0)
  const [showBreakdown, setShowBreakdown] = useState(false)

  useEffect(() => {
    if (!result) {
      setAnimatedTotal(0)
      setShowBreakdown(false)
      return
    }

    setShowBreakdown(false)
    const target = result.total
    const duration = 1500
    const start = performance.now()

    function animate(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedTotal(Math.round(eased * target))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setShowBreakdown(true)
      }
    }

    requestAnimationFrame(animate)
  }, [result])

  const passou = result ? result.total >= meta : false

  return (
    <div className="text-center py-4">
      {/* Meta */}
      <div className="mb-3">
        <span className="text-xs text-gray-500">META: </span>
        <span className="text-lg font-black text-gray-300">{meta.toLocaleString()}</span>
      </div>

      {/* Score animado */}
      {result && (
        <div className={`transition-all duration-300 ${passou ? 'text-green-400' : 'text-red-400'}`}>
          <div className="text-5xl font-black tabular-nums">
            {animatedTotal.toLocaleString()}
          </div>

          {/* Breakdown */}
          {showBreakdown && (
            <div className="mt-2 text-sm space-y-1">
              <div className="text-gray-400">
                <span className="text-blue-400 font-bold">{result.base}</span>
                <span className="mx-1">×</span>
                <span className="text-red-400 font-bold">{result.mult.toFixed(1)}</span>
                <span className="mx-1">=</span>
                <span className="font-black">{result.total.toLocaleString()}</span>
              </div>

              {result.combos.length > 0 && (
                <div className="flex gap-1 justify-center flex-wrap">
                  {result.combos.map(c => (
                    <span key={c.id} className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full">
                      {c.nome}
                    </span>
                  ))}
                </div>
              )}

              <div className={`text-lg font-black mt-2 ${passou ? 'text-green-400' : 'text-red-400'}`}>
                {passou ? 'PASSOU!' : 'NAO PASSOU'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tentativas e trocas */}
      <div className="flex justify-center gap-6 mt-3">
        <div>
          <span className="text-xs text-gray-500">Escalacoes: </span>
          <span className="text-sm font-bold text-white">{tentativas}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500">Trocas: </span>
          <span className="text-sm font-bold text-white">{trocas}</span>
        </div>
      </div>
    </div>
  )
}
