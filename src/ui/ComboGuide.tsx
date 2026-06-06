import type { ComboProgress } from '../engine/combos'

interface Props {
  combos: ComboProgress[]
}

export function ComboGuide({ combos }: Props) {
  if (combos.length === 0) return null

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
        Combos
      </span>
      <div className="space-y-1.5">
        {combos.map(combo => (
          <div
            key={combo.id}
            className={`flex items-center gap-2 text-[11px] rounded px-2 py-1 transition-all ${
              combo.ativo
                ? 'bg-white/5 border border-white/10'
                : 'opacity-60'
            }`}
          >
            {/* Indicador de tipo */}
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              combo.ativo
                ? combo.tipo === 'mult' ? 'bg-red-400' : 'bg-blue-400'
                : 'bg-gray-600'
            }`} />

            {/* Nome */}
            <span className={`font-bold flex-shrink-0 ${
              combo.ativo ? 'text-white' : 'text-gray-400'
            }`}>
              {combo.nome}
            </span>

            {/* Barra de progresso */}
            <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden min-w-[40px]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  combo.ativo
                    ? combo.tipo === 'mult' ? 'bg-red-400' : 'bg-blue-400'
                    : combo.progresso > 0 ? 'bg-gray-500' : 'bg-gray-700'
                }`}
                style={{ width: `${combo.progresso * 100}%` }}
              />
            </div>

            {/* Progresso */}
            <span className={`tabular-nums flex-shrink-0 ${
              combo.ativo ? 'text-white' : 'text-gray-500'
            }`}>
              {combo.atual}/{combo.necessario}
            </span>

            {/* Bônus */}
            <span className={`flex-shrink-0 font-bold ${
              combo.ativo
                ? combo.tipo === 'mult' ? 'text-red-400' : 'text-blue-400'
                : 'text-gray-600'
            }`}>
              {combo.bonusLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
