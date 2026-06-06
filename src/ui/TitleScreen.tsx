import { useState } from 'react'
import { getAttributeLabel } from '../engine/attributes'
import { useCollection } from '../state/collection'
import { Tutorial } from './Tutorial'
import { Album } from './Album'

interface Props {
  onNovaRun: (seed?: number) => void
  onDailyRun: () => void
}

export function TitleScreen({ onNovaRun, onDailyRun }: Props) {
  const [seedInput, setSeedInput] = useState('')
  const [showTutorial, setShowTutorial] = useState(false)
  const [showAlbum, setShowAlbum] = useState(false)
  const collection = useCollection()
  const eraExemplo = ['gols', 'drible', 'seguidores']

  const totalCards = 57 + 27 // players + boosts
  const totalUnlocked = collection.unlockedPlayers.length + collection.unlockedBoosts.length
  const pct = totalCards > 0 ? Math.round((totalUnlocked / totalCards) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black/50">
      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
      {showAlbum && (
        <Album
          unlockedPlayers={collection.unlockedPlayers}
          unlockedBoosts={collection.unlockedBoosts}
          stats={collection.stats}
          onClose={() => setShowAlbum(false)}
        />
      )}

      {/* Logo */}
      <div className="mb-6 text-center">
        <h1 className="text-6xl font-black bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500 bg-clip-text text-transparent mb-2">
          CRAQUES
        </h1>
        <p className="text-gray-400 text-sm">Uma Copa roguelike de cartas</p>
      </div>

      {/* Era preview */}
      <div className="mb-6 bg-gray-800/50 rounded-lg p-3 border border-gray-700">
        <span className="text-xs text-gray-500 block mb-1">Exemplo de Era:</span>
        <div className="flex gap-2">
          {eraExemplo.map(attr => (
            <span key={attr} className="text-sm bg-white/5 px-3 py-1 rounded-full text-gray-300">
              {getAttributeLabel(attr)}
            </span>
          ))}
        </div>
      </div>

      {/* Collection progress */}
      {totalUnlocked > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-gray-500 text-xs" style={{ fontFamily: "'VT323',monospace", fontSize: 14 }}>
            Colecao:
          </span>
          <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-yellow-400 text-xs font-bold">{totalUnlocked}/{totalCards}</span>
        </div>
      )}

      {/* Buttons */}
      <div className="space-y-3 w-72">
        <button onClick={() => setShowAlbum(true)} className="btn-arcade btn-advance w-full" style={{ fontSize: 10 }}>
          Meu Album
        </button>

        <button onClick={() => setShowTutorial(true)} className="btn-arcade btn-cancel w-full" style={{ fontSize: 10 }}>
          Como Jogar
        </button>

        <button onClick={() => onNovaRun()} className="btn-arcade btn-play w-full text-sm">
          Nova Run
        </button>

        <button onClick={onDailyRun} className="btn-arcade btn-next w-full" style={{ fontSize: 11 }}>
          Desafio Diario
        </button>

        {/* Seed */}
        <div className="flex gap-2">
          <input
            value={seedInput}
            onChange={e => setSeedInput(e.target.value)}
            placeholder="Colar seed..."
            className="flex-1 px-3 py-2 bg-gray-800 border-2 border-gray-600 rounded text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500"
            style={{ fontFamily: "'VT323', monospace", fontSize: 18 }}
          />
          <button
            onClick={() => { const n = parseInt(seedInput); if (!isNaN(n)) onNovaRun(n) }}
            disabled={!seedInput}
            className="btn-arcade btn-swap"
            style={{ fontSize: 9, padding: '8px 16px' }}
          >
            Ir
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-600 text-xs">
        <p>Monte escalacoes, ative combos, bata metas.</p>
      </div>
    </div>
  )
}
