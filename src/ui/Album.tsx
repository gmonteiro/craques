import { useState } from 'react'
import type { PlayerCard, BoostCard } from '../engine/types'
import { PlayerCardComponent } from './PlayerCard'
import { BoostCardComponent } from './BoostCard'
import allPlayersRaw from '../../data/players.json'
import allBoostsRaw from '../../data/boosts.json'

const allPlayers = allPlayersRaw as PlayerCard[]
const allBoosts = allBoostsRaw as BoostCard[]

interface Props {
  unlockedPlayers: string[]
  unlockedBoosts: string[]
  stats: { runs: number; wins: number; bestScore: number }
  onClose: () => void
}

type Tab = 'jogadores' | 'boosts' | 'stats'

export function Album({ unlockedPlayers, unlockedBoosts, stats, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('jogadores')

  const unlockedP = new Set(unlockedPlayers)
  const unlockedB = new Set(unlockedBoosts)
  const totalCards = allPlayers.length + allBoosts.length
  const totalUnlocked = unlockedP.size + unlockedB.size
  const pct = totalCards > 0 ? Math.round((totalUnlocked / totalCards) * 100) : 0

  const tabs: { id: Tab; label: string }[] = [
    { id: 'jogadores', label: `Jogadores (${unlockedP.size}/${allPlayers.length})` },
    { id: 'boosts', label: `Boosts (${unlockedB.size}/${allBoosts.length})` },
    { id: 'stats', label: 'Stats' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-800 bg-gray-900/90">
        <div>
          <h1 className="text-yellow-400 font-black"
            style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 16 }}>
            MEU ALBUM
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-gray-400 text-xs" style={{ fontFamily: "'VT323',monospace", fontSize: 16 }}>
              {totalUnlocked}/{totalCards} figurinhas
            </span>
            <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-yellow-400 text-xs font-bold">{pct}%</span>
          </div>
        </div>
        <button onClick={onClose} className="btn-arcade btn-cancel" style={{ fontSize: 9, padding: '8px 14px' }}>
          Fechar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-gray-800">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              tab === t.id
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            style={{ fontFamily: "'VT323',monospace", fontSize: 16 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'jogadores' && (
          <div className="flex flex-wrap gap-2 justify-center">
            {allPlayers.map(p => {
              const unlocked = unlockedP.has(p.id)
              return (
                <div key={p.id} className={`transition-all ${unlocked ? '' : 'grayscale brightness-[0.15]'}`}>
                  <PlayerCardComponent
                    player={unlocked ? p : { ...p, apelido: '???', nome: '???', clube: '???', nacionalidade: '???' }}
                    scale={0.28}
                  />
                </div>
              )
            })}
          </div>
        )}

        {tab === 'boosts' && (
          <div className="flex flex-wrap gap-2 justify-center">
            {allBoosts.map(b => {
              const unlocked = unlockedB.has(b.id)
              return (
                <div key={b.id} className={`transition-all ${unlocked ? '' : 'grayscale brightness-[0.15]'}`}>
                  <BoostCardComponent
                    boost={unlocked ? b : { ...b, nome: '???', descricao: '???' }}
                  />
                </div>
              )
            })}
          </div>
        )}

        {tab === 'stats' && (
          <div className="max-w-sm mx-auto space-y-4 mt-8">
            <StatRow label="Runs jogadas" value={String(stats.runs)} />
            <StatRow label="Vitorias" value={String(stats.wins)} />
            <StatRow label="Taxa de vitoria" value={stats.runs > 0 ? `${Math.round((stats.wins / stats.runs) * 100)}%` : '-'} />
            <StatRow label="Melhor pontuacao" value={stats.bestScore > 0 ? stats.bestScore.toLocaleString() : '-'} />
            <StatRow label="Jogadores desbloqueados" value={`${unlockedP.size}/${allPlayers.length}`} />
            <StatRow label="Boosts desbloqueados" value={`${unlockedB.size}/${allBoosts.length}`} />
            <StatRow label="Colecao completa" value={`${pct}%`} />
          </div>
        )}
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-3">
      <span className="text-gray-400" style={{ fontFamily: "'VT323',monospace", fontSize: 20 }}>{label}</span>
      <span className="text-yellow-400 font-bold" style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14 }}>{value}</span>
    </div>
  )
}
