import { useState } from 'react'
import { getAttributeLabel } from '../engine/attributes'

interface Props {
  onNovaRun: (seed?: number) => void
  onDailyRun: () => void
}

export function TitleScreen({ onNovaRun, onDailyRun }: Props) {
  const [seedInput, setSeedInput] = useState('')
  const eraExemplo = ['gols', 'drible', 'seguidores']

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-6xl font-black bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500 bg-clip-text text-transparent mb-2">
          CRAQUES
        </h1>
        <p className="text-gray-400 text-sm">Uma Copa roguelike de cartas</p>
      </div>

      {/* Era preview */}
      <div className="mb-8 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <span className="text-xs text-gray-500 block mb-1">Exemplo de Era:</span>
        <div className="flex gap-2">
          {eraExemplo.map(attr => (
            <span key={attr} className="text-sm bg-white/5 px-3 py-1 rounded-full text-gray-300">
              {getAttributeLabel(attr)}
            </span>
          ))}
        </div>
      </div>

      {/* Botões */}
      <div className="space-y-3 w-64">
        <button
          onClick={() => onNovaRun()}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-green-500/20"
        >
          Nova Run
        </button>

        <button
          onClick={onDailyRun}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg font-bold transition-all hover:scale-105 shadow-lg shadow-blue-500/20"
        >
          Desafio Diario
        </button>

        {/* Seed compartilhada */}
        <div className="flex gap-2">
          <input
            value={seedInput}
            onChange={e => setSeedInput(e.target.value)}
            placeholder="Colar seed..."
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
          />
          <button
            onClick={() => {
              const n = parseInt(seedInput)
              if (!isNaN(n)) onNovaRun(n)
            }}
            disabled={!seedInput}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded-lg text-sm transition"
          >
            Ir
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-600 text-xs">
        <p>Monte escalacoes, ative combos, bata metas.</p>
        <p>Cada run sorteia atributos diferentes — nenhuma partida e igual.</p>
      </div>
    </div>
  )
}
