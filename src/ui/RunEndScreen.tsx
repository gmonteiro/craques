import type { RunState } from '../engine/types'
import { nomeFase } from '../engine/run'
import { getAttributeLabel } from '../engine/attributes'

interface Props {
  run: RunState
  onVoltarTitulo: () => void
}

export function RunEndScreen({ run, onVoltarTitulo }: Props) {
  const venceu = run.status === 'vitoria'

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

      {/* Ações */}
      <div className="space-y-3 w-64">
        <button
          onClick={handleShareSeed}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg font-bold transition-all hover:scale-105"
        >
          Compartilhar Seed
        </button>
        <button
          onClick={onVoltarTitulo}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-all"
        >
          Nova Run
        </button>
      </div>
    </div>
  )
}
