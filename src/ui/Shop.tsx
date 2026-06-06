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
  onComprarBoost: (id: string, targetPlayerId?: string) => void
  onVenderJogador: (id: string) => void
  onReroll: () => void
  onRefresh: () => void
  onSair: () => void
  custoReroll: number
}

type ShopPhase = 'packs' | 'opening' | 'reveal' | 'pickTarget'
type PackType = 'jogador' | 'boost'

const PRECO_PACK: Record<string, number> = { jogador: 6, boost: 4 }
const MAX_PACKS = 3 // máximo de pacotes por janela

export function Shop({
  jogadores, boosts, orcamento, activeAttributes,
  baralhoJogadores,
  onComprarJogador, onComprarBoost, onVenderJogador,
  onReroll, onRefresh, onSair, custoReroll,
}: Props) {
  const [phase, setPhase] = useState<ShopPhase>('packs')
  const [packType, setPackType] = useState<PackType>('jogador')
  const [packsOpened, setPacksOpened] = useState(0)
  const [pendingBoostId, setPendingBoostId] = useState<string | null>(null)

  const canOpenMore = packsOpened < MAX_PACKS

  const abrirPack = (tipo: PackType) => {
    if (!canOpenMore) return
    const preco = PRECO_PACK[tipo]
    if (orcamento < preco) return
    if (tipo === 'jogador' && jogadores.length === 0) return
    if (tipo === 'boost' && boosts.length === 0) return

    setPackType(tipo)
    setPhase('opening')
    setTimeout(() => setPhase('reveal'), 800)
  }

  const escolherCarta = (id: string) => {
    if (packType === 'jogador') {
      onComprarJogador(id)
      setPacksOpened(p => p + 1)
      onRefresh() // refresh grátis (sem custo)
      setPhase('packs')
    } else {
      const boost = boosts.find(b => b.id === id)
      if (boost?.tipo === 'targeted') {
        setPendingBoostId(id)
        setPhase('pickTarget')
      } else {
        onComprarBoost(id)
        setPacksOpened(p => p + 1)
        onRefresh()
        setPhase('packs')
      }
    }
  }

  const escolherAlvo = (playerId: string) => {
    if (pendingBoostId) {
      onComprarBoost(pendingBoostId, playerId)
      setPendingBoostId(null)
      setPacksOpened(p => p + 1)
      onRefresh()
      setPhase('packs')
    }
  }

  // === PICK TARGET: escolher jogador para boost targeted ===
  if (phase === 'pickTarget') {
    const boost = boosts.find(b => b.id === pendingBoostId)
    const allPlayers = [...baralhoJogadores]
    return (
      <div className="p-4 bg-black/40 h-screen flex flex-col items-center justify-center overflow-hidden">
        <h2 className="text-xl font-black text-yellow-400 mb-2"
          style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14 }}>
          ESCOLHA O JOGADOR
        </h2>
        <p className="text-sm text-gray-400 mb-6" style={{ fontFamily: "'VT323',monospace", fontSize: 18 }}>
          {boost?.nome}: {boost?.descricao}
        </p>
        <div className="flex gap-3 overflow-x-auto snap-x pb-4 max-w-full px-4">
          {allPlayers.map(p => (
            <div key={p.id} className="snap-start flex-shrink-0 hover:scale-105 transition-transform">
              <PlayerCardComponent
                player={p}
                activeAttributes={activeAttributes}
                onClick={() => escolherAlvo(p.id)}
                scale={0.45}
              />
            </div>
          ))}
        </div>
        <button onClick={() => { setPendingBoostId(null); setPhase('packs') }}
          className="btn-arcade btn-cancel mt-4">
          Cancelar
        </button>
      </div>
    )
  }

  // === OPENING ANIMATION ===
  if (phase === 'opening') {
    return (
      <div className="p-4 bg-black/40 h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="animate-bounce">
          <PackSVG tipo={packType} scale={2} opening />
          <p className="text-center text-yellow-400 mt-4 animate-pulse"
            style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 12 }}>
            Abrindo...
          </p>
        </div>
      </div>
    )
  }

  // === REVEAL: cartas reveladas ===
  if (phase === 'reveal') {
    return (
      <div className="p-4 bg-black/40 h-screen flex flex-col items-center justify-center overflow-hidden">
        <h2 className="text-center font-black text-yellow-400 mb-6"
          style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14 }}>
          ESCOLHA UMA CARTA!
        </h2>
        <div className="flex gap-3 md:gap-6 justify-center mb-6 overflow-x-auto snap-x pb-2">
          {packType === 'jogador' ? (
            jogadores.map(p => (
              <div key={p.id} className="animate-[fadeInUp_0.5s_ease-out] snap-start flex-shrink-0 hover:scale-105 transition-transform">
                <PlayerCardComponent
                  player={p}
                  activeAttributes={activeAttributes}
                  onClick={() => escolherCarta(p.id)}
                  scale={0.50}
                />
              </div>
            ))
          ) : (
            boosts.map(b => (
              <div key={b.id} className="animate-[fadeInUp_0.5s_ease-out] snap-start flex-shrink-0 hover:scale-105 transition-transform">
                <BoostCardComponent
                  boost={b}
                  onClick={() => escolherCarta(b.id)}
                />
              </div>
            ))
          )}
        </div>
        <button onClick={() => { setPacksOpened(p => p + 1); setPhase('packs') }}
          className="btn-arcade btn-cancel">
          Pular
        </button>
      </div>
    )
  }

  // === MAIN SHOP: packs ===
  return (
    <div className="p-4 md:p-6 bg-black/40 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 md:mb-6">
        <h2 className="text-white" style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14 }}>
          TRANSFERENCIAS
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-yellow-400 font-bold"
            style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 16 }}>
            ${orcamento}
          </span>
          <span className="text-gray-500 text-xs"
            style={{ fontFamily: "'VT323',monospace" }}>
            {packsOpened}/{MAX_PACKS} pacotes
          </span>
          <button onClick={onSair} className="btn-arcade btn-next" style={{ fontSize: 10, padding: '10px 18px' }}>
            Proxima Fase
          </button>
        </div>
      </div>

      {/* Packs */}
      <div className="flex flex-col gap-4 items-center md:flex-row md:gap-8 md:justify-center mb-6 md:mb-8">
        <div
          onClick={() => abrirPack('jogador')}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
            !canOpenMore || orcamento < PRECO_PACK.jogador || jogadores.length === 0 ? 'opacity-30 pointer-events-none' : ''
          }`}
        >
          <PackSVG tipo="jogador" scale={1.4} />
          <div className="text-center mt-2">
            <span className="text-yellow-400 font-bold"
              style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 12 }}>
              ${PRECO_PACK.jogador}
            </span>
          </div>
        </div>

        <div
          onClick={() => abrirPack('boost')}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
            !canOpenMore || orcamento < PRECO_PACK.boost || boosts.length === 0 ? 'opacity-30 pointer-events-none' : ''
          }`}
        >
          <PackSVG tipo="boost" scale={1.4} />
          <div className="text-center mt-2">
            <span className="text-yellow-400 font-bold"
              style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 12 }}>
              ${PRECO_PACK.boost}
            </span>
          </div>
        </div>
      </div>

      {/* Elenco (vender) */}
      {baralhoJogadores.length > 0 && (
        <div>
          <h3 className="text-gray-400 mb-3"
            style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9 }}>
            SEU ELENCO (CLIQUE P/ VENDER)
          </h3>
          <div className="flex gap-2 flex-wrap">
            {baralhoJogadores.map(p => (
              <div key={p.id} className="relative opacity-80 hover:opacity-100 transition">
                <PlayerCardComponent
                  player={p}
                  activeAttributes={activeAttributes}
                  onClick={() => onVenderJogador(p.id)}
                  scale={0.28}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

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
      <rect x={5} y={20} width={110} height={130} rx={6} fill={color1} />
      <rect x={10} y={25} width={100} height={120} rx={4} fill={color2} />
      <path d="M5,20 L15,30 L25,20 L35,30 L45,20 L55,30 L65,20 L75,30 L85,20 L95,30 L105,20 L115,30 L115,20 L5,20z" fill={color1} />
      <rect x={20} y={45} width={8} height={8} fill={accent} opacity={0.6} transform="rotate(45,24,49)" />
      <rect x={90} y={45} width={8} height={8} fill={accent} opacity={0.6} transform="rotate(45,94,49)" />
      <rect x={55} y={35} width={10} height={10} fill={accent} opacity={0.8} transform="rotate(45,60,40)" />
      <text x={60} y={80} textAnchor="middle" fill={accent}
        style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8 }}>
        CRAQUES
      </text>
      <text x={60} y={100} textAnchor="middle" fill="#FFFFFF"
        style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7 }}>
        {isJogador ? 'JOGADORES' : 'BOOSTS'}
      </text>
      <rect x={15} y={30} width={3} height={100} fill="white" opacity={0.05} rx={1} />
    </svg>
  )
}
