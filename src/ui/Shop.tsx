import type { PlayerCard, BoostCard } from '../engine/types'
import { PlayerCardComponent } from './PlayerCard'
import { BoostCardComponent } from './BoostCard'

interface Props {
  jogadores: PlayerCard[]
  boosts: BoostCard[]
  orcamento: number
  activeAttributes: string[]
  baralhoJogadores: PlayerCard[]
  onComprarJogador: (id: string) => void
  onComprarBoost: (id: string) => void
  onVenderJogador: (id: string) => void
  onReroll: () => void
  onSair: () => void
  custoReroll: number
}

const PRECO_RARIDADE: Record<string, number> = {
  comum: 2, incomum: 3, bom: 4, raro: 5, elite: 6, lendario: 8,
}

export function Shop({
  jogadores, boosts, orcamento, activeAttributes,
  baralhoJogadores,
  onComprarJogador, onComprarBoost, onVenderJogador,
  onReroll, onSair, custoReroll,
}: Props) {
  return (
    <div className="p-4 space-y-6 bg-black/40 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white">Janela de Transferencias</h2>
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-yellow-400">${orcamento}</span>
          <button
            onClick={onReroll}
            disabled={orcamento < custoReroll}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded transition"
          >
            Reroll (${custoReroll})
          </button>
          <button
            onClick={onSair}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded font-bold text-sm transition"
          >
            Proxima Fase →
          </button>
        </div>
      </div>

      {/* Jogadores à venda */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 mb-2">Jogadores</h3>
        <div className="flex gap-3 flex-wrap">
          {jogadores.map(p => {
            const preco = PRECO_RARIDADE[p.raridade] ?? 4
            return (
              <div key={p.id} className="relative">
                <PlayerCardComponent
                  player={p}
                  activeAttributes={activeAttributes}
                  onClick={() => onComprarJogador(p.id)}
                  scale={0.38}
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  ${preco}
                </div>
              </div>
            )
          })}
          {jogadores.length === 0 && (
            <span className="text-gray-600 text-sm">Esgotado</span>
          )}
        </div>
      </div>

      {/* Boosts à venda */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 mb-2">Boosts</h3>
        <div className="flex gap-3 flex-wrap">
          {boosts.map(b => (
            <BoostCardComponent
              key={b.id}
              boost={b}
              onClick={() => onComprarBoost(b.id)}
              showPrice
            />
          ))}
          {boosts.length === 0 && (
            <span className="text-gray-600 text-sm">Esgotado</span>
          )}
        </div>
      </div>

      {/* Baralho atual (vender) */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 mb-2">Seu Baralho (clique para vender)</h3>
        <div className="flex gap-2 flex-wrap">
          {baralhoJogadores.map(p => {
            const precoVenda = Math.floor((PRECO_RARIDADE[p.raridade] ?? 4) / 2)
            return (
              <div key={p.id} className="relative opacity-80 hover:opacity-100 transition">
                <PlayerCardComponent
                  player={p}
                  activeAttributes={activeAttributes}
                  onClick={() => onVenderJogador(p.id)}
                  scale={0.30}
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  Vender ${precoVenda}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
