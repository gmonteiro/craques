import type { ComboProgress } from '../engine/combos'

interface Props {
  combos: ComboProgress[]
}

export function ComboGuide({ combos }: Props) {
  if (combos.length === 0) return null

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-2 md:p-3 overflow-hidden">
      <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
        Combos
      </span>
      <div className="space-y-1">
        {combos.map(combo => (
          <div
            key={combo.id}
            className={`text-[10px] md:text-[11px] rounded px-1.5 py-1 transition-all ${
              combo.ativo
                ? 'bg-white/5 border border-white/10'
                : 'opacity-60'
            }`}
          >
            {/* Linha 1: dot + nome + progresso */}
            <div className="flex items-center gap-1 min-w-0">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                combo.ativo
                  ? combo.tipo === 'mult' ? 'bg-red-400' : 'bg-blue-400'
                  : 'bg-gray-600'
              }`} />
              <span className={`font-bold truncate min-w-0 ${
                combo.ativo ? 'text-white' : 'text-gray-400'
              }`}>
                {combo.nome}
              </span>
              <span className={`tabular-nums flex-shrink-0 ml-auto ${
                combo.ativo ? 'text-white' : 'text-gray-500'
              }`}>
                {combo.atual}/{combo.necessario}
              </span>
              <span className={`flex-shrink-0 font-bold text-[9px] md:text-[10px] ${
                combo.ativo
                  ? combo.tipo === 'mult' ? 'text-red-400' : 'text-blue-400'
                  : 'text-gray-600'
              }`}>
                {combo.ativo ? combo.bonusLabel : ''}
              </span>
            </div>
            {/* Barra de progresso */}
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden mt-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  combo.ativo
                    ? combo.tipo === 'mult' ? 'bg-red-400' : 'bg-blue-400'
                    : combo.progresso > 0 ? 'bg-gray-500' : 'bg-gray-700'
                }`}
                style={{ width: `${combo.progresso * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
