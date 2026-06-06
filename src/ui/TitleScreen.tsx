import { useState } from 'react'
import { getAttributeLabel } from '../engine/attributes'
import { useCollection } from '../state/collection'
import { getWeeklyChallenge } from '../lib/challenges'
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
  const weekly = getWeeklyChallenge()

  const totalCards = 57 + 27
  const totalUnlocked = collection.unlockedPlayers.length + collection.unlockedBoosts.length
  const pct = totalCards > 0 ? Math.round((totalUnlocked / totalCards) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: 'rgba(7,18,12,.7)' }}>
      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
      {showAlbum && (
        <Album
          unlockedPlayers={collection.unlockedPlayers}
          unlockedBoosts={collection.unlockedBoosts}
          earnedAchievements={collection.earnedAchievements}
          stats={collection.stats}
          onClose={() => setShowAlbum(false)}
        />
      )}

      {/* Logo */}
      <div className="mb-6 text-center">
        <h1 className="val shadow-hard" style={{ fontSize: 64, color: 'var(--gold)' }}>CRAQUES</h1>
        <p style={{ fontFamily: '"Silkscreen", monospace', fontSize: 11, color: 'var(--label)', letterSpacing: 2 }}>
          UMA COPA ROGUELIKE DE CARTAS
        </p>
      </div>

      {/* Era preview */}
      <div className="panel" style={{ padding: '10px 16px', marginBottom: 16 }}>
        <span className="micro" style={{ fontSize: 9, marginBottom: 4, display: 'block' }}>Exemplo de Era:</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {eraExemplo.map(attr => (
            <span key={attr} className="postag" style={{ background: 'var(--panel-3)', fontSize: 10 }}>
              {getAttributeLabel(attr)}
            </span>
          ))}
        </div>
      </div>

      {/* Collection progress */}
      {totalUnlocked > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span className="micro" style={{ fontSize: 10 }}>Colecao:</span>
          <div style={{ width: 80, height: 6, background: '#0c1510', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gold)', borderRadius: 3 }} />
          </div>
          <span className="val" style={{ fontSize: 16, color: 'var(--gold)' }}>{totalUnlocked}/{totalCards}</span>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 280 }}>
        <button onClick={() => onNovaRun()} className="btn-arcade btn-play btn-md" style={{ width: '100%' }}>
          Nova Run
        </button>

        <button onClick={onDailyRun} className="btn-arcade btn-advance btn-md" style={{ width: '100%' }}>
          Desafio Diario
        </button>

        {/* Weekly challenge */}
        <button
          onClick={() => onNovaRun(weekly.seed)}
          className="btn-arcade btn-md"
          style={{
            width: '100%',
            background: 'linear-gradient(180deg, #9a6cf0, #6a3fbf)',
            boxShadow: 'inset 0 2px 0 rgba(255,255,255,.35), 0 6px 0 #4a2a8f, 0 12px 18px rgba(0,0,0,.4)',
          }}
        >
          <div>{weekly.nome}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: -2 }}>{weekly.descricao}</div>
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowAlbum(true)} className="btn-arcade btn-cancel btn-md" style={{ flex: 1, fontSize: 18 }}>
            Album
          </button>
          <button onClick={() => setShowTutorial(true)} className="btn-arcade btn-cancel btn-md" style={{ flex: 1, fontSize: 18 }}>
            Como Jogar
          </button>
        </div>

        {/* Seed */}
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={seedInput}
            onChange={e => setSeedInput(e.target.value)}
            placeholder="Seed..."
            style={{
              flex: 1, padding: '8px 12px',
              background: '#141d17', border: '2px solid #0c1510', borderRadius: 'var(--r-sm)',
              color: 'var(--ink)', fontFamily: '"Jersey 10", monospace', fontSize: 20,
              outline: 'none',
            }}
          />
          <button
            onClick={() => { const n = parseInt(seedInput); if (!isNaN(n)) onNovaRun(n) }}
            disabled={!seedInput}
            className="btn-arcade btn-swap"
            style={{ fontSize: 16, padding: '6px 14px 8px' }}
          >
            Ir
          </button>
        </div>
      </div>
    </div>
  )
}
