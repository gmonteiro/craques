import { useState } from 'react'
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

type PackState = 'closed' | 'opening' | 'open'
type PackType = 'jogador' | 'boost'

const PRECO_PACK: Record<string, number> = { jogador: 6, boost: 4 }

export function Shop({
  jogadores, boosts, orcamento, activeAttributes,
  baralhoJogadores,
  onComprarJogador, onComprarBoost, onVenderJogador,
  onReroll, onSair, custoReroll,
}: Props) {
  const [packState, setPackState] = useState<PackState>('closed')
  const [packType, setPackType] = useState<PackType>('jogador')
  const [usedPacks, setUsedPacks] = useState<Set<PackType>>(new Set())

  const abrirPack = (tipo: PackType) => {
    if (usedPacks.has(tipo)) return
    const preco = PRECO_PACK[tipo]
    if (orcamento < preco) return
    if (tipo === 'jogador' && jogadores.length === 0) return
    if (tipo === 'boost' && boosts.length === 0) return

    setPackType(tipo)
    setPackState('opening')
    setTimeout(() => setPackState('open'), 800)
  }

  const escolherCarta = (id: string) => {
    if (packType === 'jogador') onComprarJogador(id)
    else onComprarBoost(id)
    setUsedPacks(prev => new Set([...prev, packType]))
    setPackState('closed')
  }

  const fecharPack = () => {
    setPackState('closed')
  }

  // === PACK OPENING OVERLAY ===
  if (packState === 'opening' || packState === 'open') {
    return (
      <div className="p-4 bg-black/40 min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {packState === 'opening' ? (
          // Opening animation
          <div className="animate-bounce">
            <PackSVG tipo={packType} scale={2} opening />
            <p className="text-center text-yellow-400 mt-4 animate-pulse"
              style={{ fontFamily: "'VT323',monospace", fontSize: 24 }}>
              Abrindo pacote...
            </p>
          </div>
        ) : (
          // Cards revealed
          <div>
            <h2 className="text-center text-2xl font-black text-yellow-400 mb-6"
              style={{ fontFamily: "'VT323',monospace", letterSpacing: 2 }}>
              ESCOLHA UMA CARTA!
            </h2>
            <div className="flex gap-3 md:gap-6 justify-center mb-6 overflow-x-auto snap-x pb-2">
              {packType === 'jogador' ? (
                jogadores.map(p => (
                  <div key={p.id} className="animate-[fadeInUp_0.5s_ease-out] hover:scale-110 transition-transform">
                    <PlayerCardComponent
                      player={p}
                      activeAttributes={activeAttributes}
                      onClick={() => escolherCarta(p.id)}
                      scale={0.55}
                    />
                  </div>
                ))
              ) : (
                boosts.map(b => (
                  <div key={b.id} className="animate-[fadeInUp_0.5s_ease-out] hover:scale-110 transition-transform">
                    <BoostCardComponent
                      boost={b}
                      onClick={() => escolherCarta(b.id)}
                    />
                  </div>
                ))
              )}
            </div>
            <div className="text-center">
              <button
                onClick={fecharPack}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
              >
                Pular (nenhuma)
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // === MAIN SHOP VIEW ===
  return (
    <div className="p-6 bg-black/40 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 md:mb-8">
        <h2 className="text-3xl font-black text-white"
          style={{ fontFamily: "'VT323',monospace", letterSpacing: 2 }}>
          JANELA DE TRANSFERÊNCIAS
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-yellow-400"
            style={{ fontFamily: "'Press Start 2P',monospace" }}>
            ${orcamento}
          </span>
          <button
            onClick={onReroll}
            disabled={orcamento < custoReroll}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded-lg transition"
            style={{ fontFamily: "'VT323',monospace", fontSize: 18 }}
          >
            Reroll (${custoReroll})
          </button>
          <button
            onClick={onSair}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition"
            style={{ fontFamily: "'VT323',monospace", fontSize: 20 }}
          >
            Próxima Fase →
          </button>
        </div>
      </div>

      {/* Packs */}
      <div className="flex flex-col gap-4 items-center md:flex-row md:gap-8 md:justify-center mb-6 md:mb-10">
        {/* Player pack */}
        <div
          onClick={() => abrirPack('jogador')}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
            usedPacks.has('jogador') || orcamento < PRECO_PACK.jogador || jogadores.length === 0 ? 'opacity-30 pointer-events-none' : ''
          }`}
        >
          <PackSVG tipo="jogador" scale={1.4} />
          <div className="text-center mt-2">
            <span className="text-yellow-400 font-bold"
              style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 12 }}>
              ${PRECO_PACK.jogador}
            </span>
            <span className="text-gray-400 text-sm ml-2"
              style={{ fontFamily: "'VT323',monospace" }}>
              ({jogadores.length} disp.)
            </span>
          </div>
        </div>

        {/* Boost pack */}
        <div
          onClick={() => abrirPack('boost')}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
            usedPacks.has('boost') || orcamento < PRECO_PACK.boost || boosts.length === 0 ? 'opacity-30 pointer-events-none' : ''
          }`}
        >
          <PackSVG tipo="boost" scale={1.4} />
          <div className="text-center mt-2">
            <span className="text-yellow-400 font-bold"
              style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 12 }}>
              ${PRECO_PACK.boost}
            </span>
            <span className="text-gray-400 text-sm ml-2"
              style={{ fontFamily: "'VT323',monospace" }}>
              ({boosts.length} disp.)
            </span>
          </div>
        </div>
      </div>

      {/* Baralho atual (vender) */}
      {baralhoJogadores.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-400 mb-3"
            style={{ fontFamily: "'VT323',monospace", letterSpacing: 2 }}>
            SEU ELENCO (clique para vender)
          </h3>
          <div className="flex gap-2 flex-wrap">
            {baralhoJogadores.map(p => (
              <div key={p.id} className="relative opacity-80 hover:opacity-100 transition">
                <PlayerCardComponent
                  player={p}
                  activeAttributes={activeAttributes}
                  onClick={() => onVenderJogador(p.id)}
                  scale={0.30}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** SVG sticker pack */
function PackSVG({ tipo, scale = 1, opening }: { tipo: PackType; scale?: number; opening?: boolean }) {
  const w = 120 * scale
  const h = 160 * scale
  const isJogador = tipo === 'jogador'
  const color1 = isJogador ? '#1a5c2a' : '#2a1a5c'
  const color2 = isJogador ? '#2d8a42' : '#5c2a8a'
  const accent = '#ffd84d'

  return (
    <svg viewBox="0 0 120 160" width={w} height={h} xmlns="http://www.w3.org/2000/svg"
      className={opening ? 'animate-spin' : ''}>
      {/* Pack body */}
      <rect x={5} y={20} width={110} height={130} rx={6} fill={color1} />
      <rect x={10} y={25} width={100} height={120} rx={4} fill={color2} />

      {/* Zigzag tear line at top */}
      <path d="M5,20 L15,30 L25,20 L35,30 L45,20 L55,30 L65,20 L75,30 L85,20 L95,30 L105,20 L115,30 L115,20 L5,20z"
        fill={color1} />

      {/* Stars decoration */}
      <rect x={20} y={45} width={8} height={8} fill={accent} opacity={0.6} transform="rotate(45,24,49)" />
      <rect x={90} y={45} width={8} height={8} fill={accent} opacity={0.6} transform="rotate(45,94,49)" />
      <rect x={55} y={35} width={10} height={10} fill={accent} opacity={0.8} transform="rotate(45,60,40)" />

      {/* Title */}
      <text x={60} y={80} textAnchor="middle" fill={accent}
        style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8 }}>
        CRAQUES
      </text>
      <text x={60} y={95} textAnchor="middle" fill="#FFFFFF"
        style={{ fontFamily: "'VT323',monospace", fontSize: 16 }}>
        {isJogador ? 'JOGADORES' : 'BOOSTS'}
      </text>

      {/* Ball icon */}
      {isJogador ? (
        <circle cx={60} cy={118} r={12} fill="none" stroke={accent} strokeWidth={2} />
      ) : (
        <path d="M50,112h20v12h-20z" fill="none" stroke={accent} strokeWidth={2} />
      )}
      <text x={60} y={122} textAnchor="middle" fill={accent}
        style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6 }}>
        {isJogador ? '⚽' : '⚡'}
      </text>

      {/* Shine effect */}
      <rect x={15} y={30} width={3} height={100} fill="white" opacity={0.05} rx={1} />
    </svg>
  )
}
