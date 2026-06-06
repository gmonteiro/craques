import type { BoostCard as BoostCardType } from '../engine/types'

const TIPO_COLOR: Record<string, string> = {
  aditivo: 'border-green-500/50 bg-green-500/5',
  multiplicativo: 'border-red-500/50 bg-red-500/5',
  condicional: 'border-blue-500/50 bg-blue-500/5',
  evento: 'border-yellow-500/50 bg-yellow-500/5',
}

const TIPO_BADGE: Record<string, string> = {
  aditivo: 'bg-green-600 text-green-100',
  multiplicativo: 'bg-red-600 text-red-100',
  condicional: 'bg-blue-600 text-blue-100',
  evento: 'bg-yellow-600 text-yellow-100',
}

const RARIDADE_GLOW: Record<string, string> = {
  lendario: 'shadow-yellow-500/30 shadow-lg',
  raro: 'shadow-purple-500/20 shadow-md',
  incomum: 'shadow-blue-500/10',
  comum: '',
}

interface Props {
  boost: BoostCardType
  onClick?: () => void
  showPrice?: boolean
  compact?: boolean
}

export function BoostCardComponent({ boost, onClick, showPrice, compact }: Props) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg border p-3 cursor-pointer transition-all duration-200
        hover:scale-105
        ${TIPO_COLOR[boost.tipo]}
        ${RARIDADE_GLOW[boost.raridade]}
        ${compact ? 'w-28' : 'w-36'}
      `}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs font-bold text-white truncate flex-1">{boost.nome}</span>
        <span className={`text-[9px] px-1 py-0.5 rounded ${TIPO_BADGE[boost.tipo]}`}>
          {boost.tipo === 'multiplicativo' ? 'MULT' : boost.tipo === 'aditivo' ? 'BASE' : boost.tipo.toUpperCase()}
        </span>
      </div>

      <p className="text-[10px] text-gray-400 leading-tight mb-2">{boost.descricao}</p>

      {showPrice && (
        <div className="text-right">
          <span className="text-xs font-bold text-yellow-400">${boost.preco}</span>
        </div>
      )}
    </div>
  )
}
