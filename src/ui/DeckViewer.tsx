import { useState } from 'react'
import type { PlayerCard } from '../engine/types'
import { PlayerCardComponent } from './PlayerCard'

interface Props {
  mao: PlayerCard[]
  baralho: PlayerCard[]
  escalacao: PlayerCard[]
  descarte: PlayerCard[]
  activeAttributes: string[]
}

type Tab = 'mao' | 'baralho' | 'escalacao' | 'descarte'

export function DeckViewer({ mao, baralho, escalacao, descarte, activeAttributes }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState<Tab>('baralho')

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'mao', label: 'Mao', count: mao.length },
    { id: 'escalacao', label: 'Escalados', count: escalacao.length },
    { id: 'baralho', label: 'Baralho', count: baralho.length },
    { id: 'descarte', label: 'Descarte', count: descarte.length },
  ]

  const total = mao.length + baralho.length + escalacao.length + descarte.length

  const currentCards: PlayerCard[] =
    tab === 'mao' ? mao :
    tab === 'escalacao' ? escalacao :
    tab === 'baralho' ? baralho :
    descarte

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-lg overflow-hidden">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-white/5 transition"
      >
        <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">
          Cartas ({total})
        </span>
        <span className={`text-gray-500 text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-2 border-t border-gray-800">
          {/* Tabs */}
          <div className="flex gap-1 mb-2">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                  tab === t.id
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>

          {/* Cards grid */}
          {currentCards.length === 0 ? (
            <div className="text-center text-gray-600 text-xs py-4">Vazio</div>
          ) : (
            <div className="flex flex-wrap gap-1 max-h-[300px] overflow-y-auto">
              {currentCards.map(card => (
                <PlayerCardComponent
                  key={card.id}
                  player={card}
                  activeAttributes={activeAttributes}
                  scale={0.22}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
