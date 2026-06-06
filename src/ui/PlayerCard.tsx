import type { PlayerCard as PlayerCardType, TierName } from '../engine/types'
import { getAttributeLabel } from '../engine/attributes'

const TIER_COLORS: Record<TierName, string> = {
  lendario: 'text-yellow-400',
  elite: 'text-purple-400',
  bom: 'text-blue-400',
  regular: 'text-gray-400',
  fraco: 'text-gray-600',
}

const TIER_BG: Record<TierName, string> = {
  lendario: 'bg-yellow-400/10 border-yellow-400/30',
  elite: 'bg-purple-400/10 border-purple-400/30',
  bom: 'bg-blue-400/10 border-blue-400/30',
  regular: 'bg-gray-400/10 border-gray-400/30',
  fraco: 'bg-gray-600/10 border-gray-600/30',
}

const RARIDADE_BORDER: Record<string, string> = {
  lendario: 'border-yellow-500 shadow-yellow-500/20',
  elite: 'border-purple-500 shadow-purple-500/20',
  bom: 'border-blue-500 shadow-blue-500/20',
  incomum: 'border-green-500 shadow-green-500/20',
  comum: 'border-gray-500',
}

const POSICAO_LABEL: Record<string, string> = {
  GOL: 'GOL',
  ZAG: 'ZAG',
  LAT: 'LAT',
  MEI: 'MEI',
  ATA: 'ATA',
}

const POSICAO_COLOR: Record<string, string> = {
  GOL: 'bg-amber-600',
  ZAG: 'bg-blue-600',
  LAT: 'bg-cyan-600',
  MEI: 'bg-green-600',
  ATA: 'bg-red-600',
}

interface Props {
  player: PlayerCardType
  activeAttributes?: string[]
  onClick?: () => void
  selected?: boolean
  compact?: boolean
}

export function PlayerCardComponent({ player, activeAttributes, onClick, selected, compact }: Props) {
  const border = RARIDADE_BORDER[player.raridade] ?? 'border-gray-500'

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-lg border-2 p-3 cursor-pointer transition-all duration-200
        ${border}
        ${selected ? 'ring-2 ring-white scale-105 shadow-lg' : 'hover:scale-102 hover:shadow-md'}
        ${compact ? 'w-32' : 'w-40'}
        bg-gray-900/90 backdrop-blur
      `}
    >
      {/* Header: nome + posição */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold truncate text-white">{player.apelido}</div>
          <div className="text-[10px] text-gray-400 truncate">{player.clube}</div>
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${POSICAO_COLOR[player.posicao]} text-white`}>
          {POSICAO_LABEL[player.posicao]}
        </span>
      </div>

      {/* Placeholder de avatar (bloco colorido por raridade) */}
      {!compact && (
        <div className={`w-full h-16 rounded mb-2 flex items-center justify-center text-2xl font-black ${
          player.raridade === 'lendario' ? 'bg-gradient-to-br from-yellow-600/30 to-amber-800/30' :
          player.raridade === 'elite' ? 'bg-gradient-to-br from-purple-600/30 to-indigo-800/30' :
          'bg-gradient-to-br from-gray-600/30 to-gray-800/30'
        }`}>
          <span className="text-3xl">{player.nacionalidade.slice(0, 2)}</span>
        </div>
      )}

      {/* Atributos ativos */}
      {activeAttributes && player.pontosNormalizados && (
        <div className="space-y-1">
          {activeAttributes.map(attr => {
            const pts = player.pontosNormalizados![attr] ?? 0
            const tier = player.tiersPorAtributo?.[attr] ?? 'fraco'
            return (
              <div key={attr} className={`flex items-center justify-between text-[10px] px-1.5 py-0.5 rounded border ${TIER_BG[tier]}`}>
                <span className="text-gray-300 truncate mr-1">{getAttributeLabel(attr)}</span>
                <span className={`font-bold ${TIER_COLORS[tier]}`}>{pts}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Score total */}
      {player.pontosNormalizados && (
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">Total: </span>
          <span className="text-sm font-black text-white">
            {Object.values(player.pontosNormalizados).reduce((s, v) => s + v, 0)}
          </span>
        </div>
      )}

      {/* Bandeira de selecionado */}
      {selected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
          <span className="text-xs">✓</span>
        </div>
      )}
    </div>
  )
}
