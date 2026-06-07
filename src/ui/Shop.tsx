import { useState, useRef, useCallback } from 'react'
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

type AnimPhase = 'in' | 'tear' | 'pop' | 'done'
type PackType = 'jogador' | 'boost'

const PRECO_PACK: Record<string, number> = { jogador: 6, boost: 4 }
const MAX_PACKS = 3

/* sell value = half of rarity price, matches engine logic */
function precoRaridade(raridade: string): number {
  const precos: Record<string, number> = {
    comum: 2, incomum: 3, bom: 4, raro: 5, elite: 6, lendario: 8,
  }
  return precos[raridade] ?? 4
}
function sellValue(p: PlayerCard): number {
  return Math.floor(precoRaridade(p.raridade) / 2)
}

/* sparkle angles: 12 sparkles, 30deg apart */
const SPARKLE_ANGLES = Array.from({ length: 12 }, (_, i) => `${i * 30}deg`)

export function Shop({
  jogadores, boosts, orcamento, activeAttributes,
  baralhoJogadores,
  onComprarJogador, onComprarBoost, onVenderJogador,
  onReroll, onRefresh, onSair, custoReroll,
}: Props) {
  const [packsOpened, setPacksOpened] = useState(0)
  const [animPhase, setAnimPhase] = useState<AnimPhase | null>(null)
  const [revealType, setRevealType] = useState<PackType>('jogador')
  const [revealPlayer, setRevealPlayer] = useState<PlayerCard | null>(null)
  const [revealBoost, setRevealBoost] = useState<BoostCard | null>(null)
  const [pendingBoostId, setPendingBoostId] = useState<string | null>(null)
  const [pickTarget, setPickTarget] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const canOpenMore = packsOpened < MAX_PACKS

  const flash = useCallback((txt: string) => {
    setToast(txt)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 1700)
  }, [])

  const startAnim = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setAnimPhase('in')
    timers.current.push(setTimeout(() => setAnimPhase('tear'), 340))
    timers.current.push(setTimeout(() => setAnimPhase('pop'), 800))
    timers.current.push(setTimeout(() => setAnimPhase('done'), 1300))
  }, [])

  const skipAnim = useCallback(() => {
    if (animPhase !== 'done') {
      timers.current.forEach(clearTimeout)
      setAnimPhase('done')
    }
  }, [animPhase])

  const [showChoose, setShowChoose] = useState(false)

  const abrirPack = useCallback((tipo: PackType) => {
    if (!canOpenMore) return flash('Limite de pacotes desta fase atingido')
    const preco = PRECO_PACK[tipo]
    if (orcamento < preco) return flash('Dinheiro insuficiente')

    if (tipo === 'jogador') {
      if (jogadores.length === 0) return flash('Sem jogadores disponíveis')
    } else {
      if (boosts.length === 0) return flash('Sem boosts disponíveis')
    }
    setRevealType(tipo)
    setRevealPlayer(null)
    setRevealBoost(null)
    setShowChoose(false)
    startAnim()
  }, [canOpenMore, orcamento, jogadores, boosts, flash, startAnim])

  // When animation reaches 'done', show 3 cards to choose from
  const onAnimDone = useCallback(() => {
    setShowChoose(true)
  }, [])

  // Player picks 1 card from the 3 revealed
  const escolherCarta = useCallback((id: string) => {
    if (revealType === 'jogador') {
      onComprarJogador(id)
      const p = jogadores.find(j => j.id === id)
      flash(`${p?.apelido || p?.nome || 'Jogador'} entrou no elenco!`)
    } else {
      const b = boosts.find(b => b.id === id)
      if (b?.tipo === 'targeted') {
        setPendingBoostId(id)
        setPickTarget(true)
        setAnimPhase(null)
        setShowChoose(false)
        return
      }
      onComprarBoost(id)
      flash(`Boost aplicado: ${b?.nome || 'Boost'}`)
    }
    setPacksOpened(p => p + 1)
    onRefresh()
    timers.current.forEach(clearTimeout)
    setAnimPhase(null)
    setShowChoose(false)
  }, [revealType, jogadores, boosts, onComprarJogador, onComprarBoost, onRefresh, flash])

  const skipChoose = useCallback(() => {
    // Skip without choosing — still counts as opened
    setPacksOpened(p => p + 1)
    timers.current.forEach(clearTimeout)
    setAnimPhase(null)
    setShowChoose(false)
  }, [])

  // keep() is called from the old "Guardar" button — now just triggers choose screen
  const keep = useCallback(() => {
    setShowChoose(true)
  }, [])

  const escolherAlvo = useCallback((playerId: string) => {
    if (pendingBoostId) {
      onComprarBoost(pendingBoostId, playerId)
      setPendingBoostId(null)
      setPacksOpened(p => p + 1)
      onRefresh()
      flash('Boost aplicado!')
    }
    setPickTarget(false)
  }, [pendingBoostId, onComprarBoost, onRefresh, flash])

  // === PICK TARGET: choose player for targeted boost ===
  if (pickTarget) {
    const boost = boosts.find(b => b.id === pendingBoostId)
    return (
      <div className="open-bg" onClick={() => { setPendingBoostId(null); setPickTarget(false) }}>
        <div className="reveal" onClick={e => e.stopPropagation()}
          style={{ background: 'linear-gradient(180deg, var(--panel-2), var(--panel))', borderRadius: 20, border: '2px solid var(--panel-line)' }}>
          <div className="micro">BOOST DIRECIONADO</div>
          <h3 style={{ fontFamily: '"Jersey 10", monospace', fontSize: 30, color: 'var(--gold)', textShadow: '0 3px 0 rgba(0,0,0,.5)', margin: '4px 0 8px' }}>
            Escolha o jogador
          </h3>
          {boost && (
            <p style={{ fontFamily: '"Jersey 10", monospace', fontSize: 18, color: 'var(--ink-dim)', marginBottom: 16 }}>
              {boost.nome}: {boost.descricao}
            </p>
          )}
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '14px 2px 8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {baralhoJogadores.map(p => (
              <div key={p.id} style={{ flex: '0 0 auto', cursor: 'pointer' }}
                onClick={() => escolherAlvo(p.id)}>
                <PlayerCardComponent player={p} activeAttributes={activeAttributes} scale={0.45} />
              </div>
            ))}
          </div>
          <button className="btn-arcade btn-cancel btn-md" style={{ marginTop: 16 }}
            onClick={() => { setPendingBoostId(null); setPickTarget(false) }}>
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  const isGreen = revealType === 'jogador'
  const packOff = (tipo: PackType) => {
    const preco = PRECO_PACK[tipo]
    if (!canOpenMore) return true
    if (orcamento < preco) return true
    if (tipo === 'jogador' && jogadores.length === 0) return true
    if (tipo === 'boost' && boosts.length === 0) return true
    return false
  }

  return (
    <div id="stage-t">
      {/* HEADER */}
      <div className="t-header panel" style={{ borderRadius: 0, border: 'none' }}>
        <div className="t-title">
          <div className="badge"><span>&#x21C4;</span></div>
          <h1>Transferências</h1>
        </div>
        <div className="t-right">
          <div className="stat-pill">
            <span className="coin" />
            <span className="val" style={{ fontFamily: '"Jersey 10",monospace', fontSize: 26, color: 'var(--gold)' }}>{orcamento}</span>
          </div>
          <div className="stat-pill">
            <span className="micro">Pacotes</span>
            <span style={{ fontFamily: '"Jersey 10",monospace', fontSize: 22, color: packsOpened >= MAX_PACKS ? 'var(--green)' : 'var(--ink)' }}>
              {packsOpened}/{MAX_PACKS}
            </span>
          </div>
          <button className="btn-arcade btn-next btn-md" onClick={onSair}>
            Próxima Fase →
          </button>
        </div>
      </div>

      {/* SHOP */}
      <div className="shop">
        <div className="shop-head">
          <h2>Abra seus pacotes</h2>
          <p>Compre e abra até {MAX_PACKS} pacotes por fase.</p>
        </div>
        <div className="packs">
          {/* JOGADORES pack */}
          <div className={'pack-col' + (packOff('jogador') ? ' off' : '')}>
            <div className="pack green" onClick={packOff('jogador') ? undefined : () => abrirPack('jogador')}>
              <div className="tear" />
              <div className="gems">
                <span className="gem green" />
                <span className="gem big green" />
                <span className="gem green" />
              </div>
              <div className="body">
                <div className="kicker">CRAQUES</div>
                <div className="ptitle">JOGADORES</div>
                <div className="psub">1 craque</div>
              </div>
              <div className="shine" />
            </div>
            <div className="price-coin"><span className="coin" /><b>{PRECO_PACK.jogador}</b></div>
          </div>

          {/* BOOSTS pack */}
          <div className={'pack-col' + (packOff('boost') ? ' off' : '')}>
            <div className="pack purple" onClick={packOff('boost') ? undefined : () => abrirPack('boost')}>
              <div className="tear" />
              <div className="gems">
                <span className="gem purple" />
                <span className="gem big purple" />
                <span className="gem purple" />
              </div>
              <div className="body">
                <div className="kicker">CRAQUES</div>
                <div className="ptitle">BOOSTS</div>
                <div className="psub">1 reforço</div>
              </div>
              <div className="shine" />
            </div>
            <div className="price-coin"><span className="coin" /><b>{PRECO_PACK.boost}</b></div>
          </div>
        </div>
      </div>

      {/* ROSTER */}
      <div className="roster panel">
        <div className="roster-head">
          <span className="val shadow-hard rtitle" style={{ fontFamily: '"Jersey 10",monospace', fontSize: 24, color: '#fff' }}>
            Seu elenco
          </span>
          <span className="hint">clique numa carta p/ vender · {baralhoJogadores.length} cartas</span>
        </div>
        {baralhoJogadores.length > 0 ? (
          <div className="roster-row scroll">
            {baralhoJogadores.map(p => {
              const sv = sellValue(p)
              return (
                <div key={p.id} className="rcard">
                  <span className="sell-chip">${sv}</span>
                  <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left' }}>
                    <PlayerCardComponent player={p} activeAttributes={activeAttributes} />
                  </div>
                  <div className="sell-over" onClick={() => onVenderJogador(p.id)}>
                    <b>VENDER ${sv}</b>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="roster-empty">Elenco vazio — compre um pacote de jogadores!</div>
        )}
      </div>

      {/* PACK OPENING OVERLAY — animation phases */}
      {animPhase && !showChoose && (
        <div className="open-bg" onClick={skipAnim}>
          <div className={`open-stage ${isGreen ? 'green' : 'purple'}`} data-phase={animPhase}
            onClick={e => e.stopPropagation()}>
            <div className="op-area">
              <div className="beam" />
              <div className="flash" />
              <div className="open-pack">
                <div className="op-base">
                  <div className="op-front">
                    <span className="kicker">CRAQUES</span>
                    <span className="ptitle">{isGreen ? 'JOGADORES' : 'BOOSTS'}</span>
                  </div>
                </div>
                <div className="tear-strip">
                  <span className="gem" /><span className="gem big" /><span className="gem" />
                </div>
              </div>
              <div className="sparkles">
                {SPARKLE_ANGLES.map((a, i) => (
                  <span key={i} style={{ '--a': a } as React.CSSProperties} />
                ))}
              </div>
            </div>
            <div className="open-cta">
              <div className="micro">{isGreen ? 'Pacote aberto!' : 'Pacote aberto!'}</div>
              <h3 style={{ fontFamily: '"Jersey 10", monospace', fontSize: 30, color: 'var(--gold)', textShadow: '0 3px 0 rgba(0,0,0,.5)', margin: '4px 0 12px' }}>
                Escolha 1 de 3!
              </h3>
              <button className="btn-arcade btn-next btn-md" onClick={() => setShowChoose(true)}>
                Ver cartas
              </button>
            </div>
            {animPhase !== 'done' && <div className="skip-hint">toque para pular</div>}
          </div>
        </div>
      )}

      {/* CHOOSE 1 of 3 cards */}
      {showChoose && (
        <div className="open-bg" onClick={skipChoose}>
          <div onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div className="micro" style={{ fontSize: 12, marginBottom: 4 }}>
              {revealType === 'jogador' ? 'Novo craque!' : 'Reforço tático!'}
            </div>
            <h3 style={{ fontFamily: '"Jersey 10", monospace', fontSize: 36, color: 'var(--gold)', textShadow: '0 3px 0 rgba(0,0,0,.5)', marginBottom: 16 }}>
              ESCOLHA UMA CARTA
            </h3>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              {revealType === 'jogador' ? (
                jogadores.map(p => (
                  <div key={p.id} style={{ cursor: 'pointer', transition: 'transform .12s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    onClick={() => escolherCarta(p.id)}>
                    <PlayerCardComponent player={p} activeAttributes={activeAttributes} scale={0.75} />
                  </div>
                ))
              ) : (
                boosts.map(b => (
                  <div key={b.id} style={{ cursor: 'pointer', transition: 'transform .12s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    onClick={() => escolherCarta(b.id)}>
                    <BoostCardComponent boost={b} />
                  </div>
                ))
              )}
            </div>
            <button className="btn-arcade btn-cancel btn-md" onClick={skipChoose}>
              Pular
            </button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className="t-toast">{toast}</div>}
    </div>
  )
}
