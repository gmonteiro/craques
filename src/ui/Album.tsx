import { useState } from 'react'
import type { PlayerCard, BoostCard } from '../engine/types'
import { PlayerCardComponent } from './PlayerCard'
import { BoostCardComponent } from './BoostCard'
import { ACHIEVEMENTS } from '../lib/achievements'
import allPlayersRaw from '../../data/players.json'
import allBoostsRaw from '../../data/boosts.json'

const allPlayers = allPlayersRaw as PlayerCard[]
const allBoosts = allBoostsRaw as BoostCard[]

interface Props {
  unlockedPlayers: string[]
  unlockedBoosts: string[]
  earnedAchievements: string[]
  stats: { runs: number; wins: number; bestScore: number }
  onClose: () => void
}

type Tab = 'jogadores' | 'boosts' | 'conquistas' | 'stats'

export function Album({ unlockedPlayers, unlockedBoosts, earnedAchievements, stats, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('jogadores')

  const unlockedP = new Set(unlockedPlayers)
  const unlockedB = new Set(unlockedBoosts)
  const totalCards = allPlayers.length + allBoosts.length
  const totalUnlocked = unlockedP.size + unlockedB.size
  const pct = totalCards > 0 ? Math.round((totalUnlocked / totalCards) * 100) : 0

  const earnedA = new Set(earnedAchievements)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'jogadores', label: `Jogadores (${unlockedP.size}/${allPlayers.length})` },
    { id: 'boosts', label: `Boosts (${unlockedB.size}/${allBoosts.length})` },
    { id: 'conquistas', label: `Conquistas (${earnedA.size}/${ACHIEVEMENTS.length})` },
    { id: 'stats', label: 'Stats' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-800 bg-gray-900/90">
        <div>
          <span className="val shadow-hard" style={{ fontSize: 36, color: 'var(--gold)' }}>MEU ALBUM</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span className="val" style={{ fontSize: 22, color: 'var(--ink-dim)' }}>
              {totalUnlocked}/{totalCards} figurinhas
            </span>
            <div style={{ width: 120, height: 8, background: '#0c1510', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gold)', borderRadius: 4 }} />
            </div>
            <span className="val" style={{ fontSize: 24, color: 'var(--gold)' }}>{pct}%</span>
          </div>
        </div>
        <button onClick={onClose} className="btn-arcade btn-cancel" style={{ fontSize: 22, padding: '10px 20px 12px' }}>
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
          (() => {
            const regulares = [...allPlayers]
              .filter(p => p.clube !== 'APOSENTADO')
              .sort((a, b) => (a.apelido || a.nome).localeCompare(b.apelido || b.nome))
            const lendas = [...allPlayers]
              .filter(p => p.clube === 'APOSENTADO')
              .sort((a, b) => (a.apelido || a.nome).localeCompare(b.apelido || b.nome))

            const renderCard = (p: typeof allPlayers[0]) => {
              const unlocked = unlockedP.has(p.id)
              return (
                <div key={p.id} style={{
                  filter: unlocked ? 'none' : 'grayscale(1) brightness(0.15)',
                  transition: 'filter 0.2s',
                }}>
                  <PlayerCardComponent
                    player={unlocked ? p : { ...p, apelido: '???', nome: '???', clube: '???', nacionalidade: '???' }}
                    scale={0.75}
                  />
                </div>
              )
            }

            return (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                  {regulares.map(renderCard)}
                </div>
                {lendas.length > 0 && (
                  <>
                    <div style={{ margin: '24px 0 12px', textAlign: 'center' }}>
                      <span className="val shadow-hard" style={{ fontSize: 28, color: 'var(--gold)' }}>LENDAS</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                      {lendas.map(renderCard)}
                    </div>
                  </>
                )}
              </>
            )
          })()
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

        {tab === 'conquistas' && (
          <div style={{ display: 'grid', gap: 8, maxWidth: 500, margin: '0 auto' }}>
            {ACHIEVEMENTS.map(a => {
              const earned = earnedA.has(a.id)
              return (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: earned ? 'linear-gradient(180deg,#2a2c18,#21230f)' : '#141d17',
                  border: earned ? '2px solid var(--gold)' : '2px solid #0c1510',
                  borderRadius: 'var(--r-sm)',
                  padding: '10px 14px',
                  boxShadow: earned ? '0 0 10px rgba(242,193,78,.2)' : 'none',
                }}>
                  <span style={{ fontSize: 28, filter: earned ? 'none' : 'grayscale(1) brightness(0.3)' }}>
                    {a.icone}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div className="val" style={{ fontSize: 18, color: earned ? 'var(--gold)' : 'var(--ink-dim)' }}>
                      {a.nome}
                    </div>
                    <div className="micro" style={{ fontSize: 9, color: earned ? 'var(--ink-dim)' : 'var(--label)', marginTop: 2 }}>
                      {a.descricao}
                    </div>
                  </div>
                  {earned && (
                    <span className="val" style={{ fontSize: 16, color: 'var(--gold)' }}>✓</span>
                  )}
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
