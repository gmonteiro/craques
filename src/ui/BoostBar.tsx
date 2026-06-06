import { useState } from 'react'
import type { BoostCard } from '../engine/types'

const TIPO_COLOR: Record<string, string> = {
  aditivo: '#3fa95b',
  multiplicativo: '#dc2626',
  condicional: '#3b82f6',
  evento: '#ffd84d',
  targeted: '#e879f9',
}

const TIPO_BG: Record<string, string> = {
  aditivo: 'bg-green-900/50 border-green-700/50',
  multiplicativo: 'bg-red-900/50 border-red-700/50',
  condicional: 'bg-blue-900/50 border-blue-700/50',
  evento: 'bg-yellow-900/50 border-yellow-700/50',
  targeted: 'bg-fuchsia-900/50 border-fuchsia-700/50',
}

const TIPO_LABEL: Record<string, string> = {
  aditivo: '+B',
  multiplicativo: '×M',
  condicional: '?',
  evento: '!',
  targeted: '⊕',
}

interface Props {
  boosts: BoostCard[]
}

export function BoostBar({ boosts }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (boosts.length === 0) return null

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-2">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
        Boosts ({boosts.length})
      </span>
      <div className="flex gap-1 flex-wrap">
        {boosts.map(boost => {
          const color = TIPO_COLOR[boost.tipo] ?? '#9ca3af'
          const isExpanded = expanded === boost.id
          return (
            <div key={boost.id} className="relative">
              <button
                onClick={() => setExpanded(isExpanded ? null : boost.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] transition-all ${TIPO_BG[boost.tipo]}`}
                title={boost.descricao}
              >
                <span className="font-bold" style={{ color }}>{TIPO_LABEL[boost.tipo]}</span>
                <span className="text-gray-300 font-bold truncate max-w-[80px]">{boost.nome}</span>
              </button>
              {/* Tooltip expandido */}
              {isExpanded && (
                <div className="absolute z-10 bottom-full left-0 mb-1 bg-gray-900 border border-gray-700 rounded-lg p-2 w-48 shadow-lg">
                  <div className="text-xs font-bold text-white mb-1">{boost.nome}</div>
                  <div className="text-[10px] text-gray-400">{boost.descricao}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
