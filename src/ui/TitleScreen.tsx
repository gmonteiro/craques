import { useState } from 'react'
import { getAttributeLabel } from '../engine/attributes'
import { Tutorial } from './Tutorial'

interface Props {
  onNovaRun: (seed?: number) => void
  onDailyRun: () => void
}

export function TitleScreen({ onNovaRun, onDailyRun }: Props) {
  const [seedInput, setSeedInput] = useState('')
  const [showTutorial, setShowTutorial] = useState(false)
  const eraExemplo = ['gols', 'drible', 'seguidores']

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black/50">
      {/* Tutorial modal */}
      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}

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
      <div className="space-y-4 w-72">
        <button
          onClick={() => setShowTutorial(true)}
          className="btn-arcade btn-advance w-full"
          style={{ fontSize: 10 }}
        >
          Como Jogar
        </button>

        <button onClick={() => onNovaRun()} className="btn-arcade btn-play w-full text-sm">
          Nova Run
        </button>

        <button onClick={onDailyRun} className="btn-arcade btn-next w-full" style={{ fontSize: 11 }}>
          Desafio Diario
        </button>

        {/* Seed compartilhada */}
        <div className="flex gap-2">
          <input
            value={seedInput}
            onChange={e => setSeedInput(e.target.value)}
            placeholder="Colar seed..."
            className="flex-1 px-3 py-2 bg-gray-800 border-2 border-gray-600 rounded text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500"
            style={{ fontFamily: "'VT323', monospace", fontSize: 18 }}
          />
          <button
            onClick={() => {
              const n = parseInt(seedInput)
              if (!isNaN(n)) onNovaRun(n)
            }}
            disabled={!seedInput}
            className="btn-arcade btn-swap"
            style={{ fontSize: 9, padding: '8px 16px' }}
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
