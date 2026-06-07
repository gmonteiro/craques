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

  const abrirPack = useCallback((tipo: PackType) => {
    if (!canOpenMore) return flash('Limite de pacotes desta fase atingido')
    const preco = PRECO_PACK[tipo]
    if (orcamento < preco) return flash('Dinheiro insuficiente')

    if (tipo === 'jogador') {
      if (jogadores.length === 0) return flash('Sem jogadores disponíveis')
      // pick random from available
      const pick = jogadores[Math.floor(Math.random() * jogadores.length)]
      setRevealPlayer(pick)
      setRevealBoost(null)
    } else {
      if (boosts.length === 0) return flash('Sem boosts disponíveis')
      const pick = boosts[Math.floor(Math.random() * boosts.length)]
      setRevealBoost(pick)
      setRevealPlayer(null)
    }
    setRevealType(tipo)
    startAnim()
  }, [canOpenMore, orcamento, jogadores, boosts, flash, startAnim])

  const keep = useCallback(() => {
    if (revealType === 'jogador' && revealPlayer) {
      onComprarJogador(revealPlayer.id)
      setPacksOpened(p => p + 1)
      onRefresh()
      flash(`${revealPlayer.apelido || revealPlayer.nome} entrou no elenco!`)
    } else if (revealType === 'boost' && revealBoost) {
      if (revealBoost.tipo === 'targeted') {
        setPendingBoostId(revealBoost.id)
        setPickTarget(true)
        timers.current.forEach(clearTimeout)
        setAnimPhase(null)
        return
      }
      onComprarBoost(revealBoost.id)
      setPacksOpened(p => p + 1)
      onRefresh()
      flash(`Boost aplicado: ${revealBoost.nome}`)
    }
    timers.current.forEach(clearTimeout)
    setAnimPhase(null)
    setRevealPlayer(null)
    setRevealBoost(null)
  }, [revealType, revealPlayer, revealBoost, onComprarJogador, onComprarBoost, onRefresh, flash])

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

      {/* PACK OPENING OVERLAY */}
      {animPhase && (
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
              <div className="eject">
                {revealType === 'jogador' && revealPlayer ? (
                  <PlayerCardComponent player={revealPlayer} activeAttributes={activeAttributes} scale={0.65} />
                ) : revealBoost ? (
                  <BoostCardComponent boost={revealBoost} />
                ) : null}
              </div>
              <div className="sparkles">
                {SPARKLE_ANGLES.map((a, i) => (
                  <span key={i} style={{ '--a': a } as React.CSSProperties} />
                ))}
              </div>
            </div>
            <div className="open-cta">
              <div className="micro">{revealType === 'jogador' ? 'Novo craque' : 'Novo boost'}</div>
              <h3>{revealType === 'jogador' ? 'Novo craque!' : 'Reforço tático!'}</h3>
              <button className="btn-arcade btn-next btn-md" onClick={keep}>
                {revealType === 'jogador' ? 'Guardar no elenco' : 'Aplicar boost'}
              </button>
            </div>
            {animPhase !== 'done' && <div className="skip-hint">toque para pular</div>}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className="t-toast">{toast}</div>}
    </div>
  )
}
