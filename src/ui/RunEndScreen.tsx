import { useState } from 'react'
import type { RunState } from '../engine/types'
import { nomeFase } from '../engine/run'
import { getAttributeLabel } from '../engine/attributes'
import { Leaderboard, submitScore } from './Leaderboard'
import { dailySeed } from '../engine/rng'

interface Props {
  run: RunState
  onVoltarTitulo: () => void
}

export function RunEndScreen({ run, onVoltarTitulo }: Props) {
  const venceu = run.status === 'vitoria'
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const isDaily = run.seed === dailySeed()

  // Submit score for daily challenge
  useState(() => {
    if (isDaily && run.ultimaPontuacao) {
      submitScore(run.seed, run.ultimaPontuacao.total, run.fase, run.ultimaPontuacao.combos.length)
    }
  })

  const handleShareSeed = () => {
    const text = venceu
      ? `Fui CAMPEAO no CRAQUES! Era: ${run.era.map(getAttributeLabel).join(', ')}. Seed: ${run.seed}. Tenta superar!`
      : `Fui eliminado na ${nomeFase(run.fase)} no CRAQUES. Era: ${run.era.map(getAttributeLabel).join(', ')}. Seed: ${run.seed}`

    if (navigator.share) {
      navigator.share({ text }).catch(() => {
        navigator.clipboard.writeText(text)
      })
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-black/50">
      {/* Resultado */}
      <div className={`text-6xl font-black mb-4 ${venceu ? 'text-yellow-400' : 'text-red-500'}`}>
        {venceu ? 'CAMPEAO!' : 'ELIMINADO'}
      </div>

      <div className="text-gray-400 mb-2">
        {venceu
          ? 'Voce venceu todas as fases e conquistou a Copa!'
          : `Eliminado na ${nomeFase(run.fase)}`
        }
      </div>

      {/* Stats */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mb-6 w-72">
        <div className="text-xs text-gray-500 mb-2">Resumo da Run</div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Era:</span>
            <span className="text-white">{run.era.map(getAttributeLabel).join(', ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Fase:</span>
            <span className="text-white">{nomeFase(run.fase)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Seed:</span>
            <span className="text-white font-mono">{run.seed}</span>
          </div>
          {run.ultimaPontuacao && (
            <div className="flex justify-between">
              <span className="text-gray-400">Ultima pontuacao:</span>
              <span className="text-white">{run.ultimaPontuacao.total.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard modal */}
      {showLeaderboard && (
        <Leaderboard seed={run.seed} onClose={() => setShowLeaderboard(false)} />
      )}

      {/* Ações */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 280 }}>
        <button onClick={handleShareSeed} className="btn-arcade btn-advance btn-md" style={{ width: '100%' }}>
          Compartilhar
        </button>
        {isDaily && (
          <button onClick={() => setShowLeaderboard(true)} className="btn-arcade btn-md" style={{
            width: '100%',
            background: 'linear-gradient(180deg, #9a6cf0, #6a3fbf)',
            boxShadow: 'inset 0 2px 0 rgba(255,255,255,.35), 0 6px 0 #4a2a8f, 0 12px 18px rgba(0,0,0,.4)',
          }}>
            Ranking
          </button>
        )}
        <button onClick={onVoltarTitulo} className="btn-arcade btn-play btn-md" style={{ width: '100%' }}>
          Nova Run
        </button>
      </div>
    </div>
  )
}
