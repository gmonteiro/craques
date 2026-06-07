import { useState, useEffect, useRef } from 'react'
import type { RunState } from '../engine/types'
import { infoPartida } from '../engine/run'
import { useIsMobile } from '../hooks/useIsMobile'
import { Hand } from './Hand'
import { PlayArea } from './PlayArea'
import { BoostBar } from './BoostBar'
import { ScoreDisplay } from './ScoreDisplay'
import { Shop } from './Shop'
import { ComboGuide } from './ComboGuide'
import { DeckViewer } from './DeckViewer'
import { getComboProgress } from '../engine/combos'
import { calcularPontuacao } from '../engine/scoring'
import { getAttributeLabel } from '../engine/attributes'
import { sounds } from '../lib/sounds'
import { Flag } from './MatchInfo'
import { COACHES } from '../engine/coaches'
import config from '../../data/config.json'

interface Props {
  run: RunState
  onEscalar: (id: string) => void
  onDesescalar: (id: string) => void
  onJogar: () => void
  onTrocar: (ids: string[]) => void
  onAvancar: () => void
  onComprarJogador: (id: string) => void
  onComprarBoost: (id: string, targetPlayerId?: string) => void
  onVenderJogador: (id: string) => void
  onReroll: () => void
  onRefresh: () => void
  onSairLoja: () => void
  onEscolherPath: (pathId: string) => void
  onDesistir: () => void
}

export function GameScreen({
  run, onEscalar, onDesescalar, onJogar, onTrocar,
  onAvancar, onComprarJogador, onComprarBoost, onVenderJogador,
  onReroll, onRefresh, onSairLoja, onEscolherPath, onDesistir,
}: Props) {
  const [trocaSelecionados, setTrocaSelecionados] = useState<Set<string>>(new Set())
  const [modoTroca, setModoTroca] = useState(false)
  const [showCombos, setShowCombos] = useState(true)
  const [showDesistir, setShowDesistir] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const previewScore = run.escalacao.length > 0
    ? calcularPontuacao(run.escalacao, run.boosts, run.era, run.meta, run.mao.length)
    : null
  const mobile = useIsMobile()
  const info = infoPartida(run)

  useEffect(() => {
    if (modoTroca && run.status !== 'escalando') {
      setModoTroca(false)
      setTrocaSelecionados(new Set())
    }
  }, [run.status, modoTroca])

  const [comboFlash, setComboFlash] = useState<string | null>(null)
  const prevCombosRef = useRef(0)

  // Clear selected card when escalacao changes
  useEffect(() => {
    setSelectedCardId(null)
  }, [run.escalacao.length])

  const escaladoIds = new Set(run.escalacao.map(c => c.id))

  const handleCardClick = (id: string) => {
    if (modoTroca) {
      const novo = new Set(trocaSelecionados)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      setTrocaSelecionados(novo)
    } else {
      // Toggle selection
      if (selectedCardId === id) {
        setSelectedCardId(null)
      } else {
        setSelectedCardId(id)
        sounds.select()
      }
    }
  }

  const handleSlotClick = (_slotIndex: number) => {
    if (selectedCardId && !escaladoIds.has(selectedCardId)) {
      onEscalar(selectedCardId)
      setSelectedCardId(null)
      sounds.escalar()
    }
  }

  const handleTrocar = () => {
    if (trocaSelecionados.size > 0) {
      onTrocar([...trocaSelecionados])
      setTrocaSelecionados(new Set())
      setModoTroca(false)
      sounds.trocar()
    }
  }

  const comboProgress = getComboProgress(run.escalacao, run.mao)
  const combosAtivos = comboProgress.filter(c => c.ativo).length

  // Detect new combo activation → flash + sound
  useEffect(() => {
    if (combosAtivos > prevCombosRef.current && prevCombosRef.current >= 0) {
      const newCombo = comboProgress.find(c => c.ativo)
      if (newCombo) {
        setComboFlash(newCombo.nome)
        sounds.combo()
        setTimeout(() => setComboFlash(null), 1500)
      }
    }
    prevCombosRef.current = combosAtivos
  }, [combosAtivos])

  // === ESCOLHA DE CAMINHO ===
  if (run.status === 'escolhendo_caminho' && run.pathChoices.length > 0) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 24,
      }}>
        <span className="val shadow-hard" style={{ fontSize: 32, color: 'var(--gold)' }}>
          ESCOLHA SEU CAMINHO
        </span>
        <span className="micro" style={{ fontSize: 12 }}>
          {info.fase} — Partida {info.partida}/{info.totalPartidas}
        </span>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {run.pathChoices.map(path => (
            <button
              key={path.id}
              onClick={() => onEscolherPath(path.id)}
              className="panel"
              style={{
                width: 220,
                padding: '20px 18px',
                cursor: 'pointer',
                border: path.id === 'lendario' ? '2px solid var(--gold)' : '2px solid var(--panel-line)',
                boxShadow: path.id === 'lendario'
                  ? '0 0 16px rgba(242,193,78,.3), inset 0 2px 0 var(--panel-top), 0 7px 0 rgba(0,0,0,.32)'
                  : undefined,
                textAlign: 'center',
                transition: 'transform .1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div className="val shadow-hard" style={{
                fontSize: 22,
                color: path.id === 'lendario' ? 'var(--gold)' : path.id === 'dificil' ? 'var(--pos-ata)' : 'var(--green)',
                marginBottom: 8,
              }}>
                {path.nome}
              </div>
              <div style={{ fontSize: 16, color: 'var(--ink-dim)', marginBottom: 12, lineHeight: 1.3 }}>
                {path.descricao}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <span className="micro" style={{ fontSize: 9 }}>
                  Meta ×{path.metaMultiplier}
                </span>
                {path.recompensaExtra > 0 && (
                  <span className="micro" style={{ fontSize: 9, color: 'var(--green)' }}>
                    +${path.recompensaExtra}
                  </span>
                )}
                {path.legendaGarantida && (
                  <span className="micro" style={{ fontSize: 9, color: 'var(--gold)' }}>
                    LENDA!
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // === LOJA ===
  if (run.status === 'loja') {
    return (
      <Shop
        jogadores={run.lojaJogadores}
        boosts={run.lojaBoosts}
        orcamento={run.orcamento}
        activeAttributes={run.era}
        baralhoJogadores={run.baralho}
        onComprarJogador={onComprarJogador}
        onComprarBoost={onComprarBoost}
        onVenderJogador={onVenderJogador}
        onReroll={onReroll}
        onRefresh={onRefresh}
        onSair={onSairLoja}
        custoReroll={config.economia.custoReroll}
      />
    )
  }

  // === RESULTADO ===
  if (run.status === 'resultado') {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        padding: 16,
      }}>
        <ScoreDisplay
          result={run.ultimaPontuacao}
          meta={run.meta}
          tentativas={run.tentativasRestantes}
          trocas={run.trocasRestantes}
          escalacao={run.escalacao}
          adversario={info.adversario}
        />
        <button onClick={onAvancar} className="btn-arcade btn-advance btn-lg">
          Avancar
        </button>
      </div>
    )
  }

  // === DERROTA ===
  if (run.status === 'derrota') {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        padding: 16,
      }}>
        <ScoreDisplay
          result={run.ultimaPontuacao}
          meta={run.meta}
          tentativas={run.tentativasRestantes}
          trocas={run.trocasRestantes}
          escalacao={run.escalacao}
          adversario={info.adversario}
        />
        <button onClick={onDesistir} className="btn-arcade btn-cancel btn-lg">
          Fim da Run
        </button>
      </div>
    )
  }

  // === ESCALANDO ===

  /* ---- Left column: Dossie + Combos ---- */
  const leftColumn = (
    <div style={{
      width: mobile ? '100%' : 376,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: mobile ? '8px 8px 0' : 12,
      overflowY: 'auto',
      maxHeight: mobile ? 'none' : '100vh',
    }}>
      {/* === DOSSIE DA PARTIDA (compact) === */}
      <div className="panel" style={{ padding: '14px 16px', display: 'grid', gap: 10 }}>
        {/* Fase + Partida */}
        <div>
          <div className="micro" style={{ fontSize: 10 }}>Fase</div>
          <div className="val shadow-hard" style={{ fontSize: 28, color: 'var(--ink)', marginTop: 1 }}>{info.fase}</div>
          <div className="val" style={{ fontSize: 16, color: 'var(--ink-dim)' }}>
            Partida {info.partida}/{info.totalPartidas}
            {info.isClassico && <span style={{ color: 'var(--orange)', marginLeft: 6 }}>CLÁSSICO</span>}
          </div>
          {run.coachId && (() => {
            const coach = COACHES.find(c => c.id === run.coachId)
            return coach ? (
              <div className="micro" style={{ fontSize: 9, marginTop: 4, color: 'var(--gold)' }}>
                Técnico: {coach.nome}
              </div>
            ) : null
          })()}
        </div>

        <div className="hr" />

        {/* Adversário com bandeira */}
        <div>
          <div className="micro" style={{ fontSize: 10 }}>Adversário</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <Flag country={info.adversario} />
            <span className="val shadow-hard" style={{ fontSize: 24, color: 'var(--ink)' }}>{info.adversario}</span>
          </div>
        </div>

        {/* Meta + Orçamento (compact boxes) */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Meta', value: run.meta.toLocaleString(), color: 'var(--gold)' },
            { label: 'Orçamento', value: `$${run.orcamento ?? 0}`, color: 'var(--green)' },
          ].map(b => (
            <div key={b.label} style={{
              flex: 1, borderRadius: 10, padding: '6px 10px 8px',
              background: 'linear-gradient(180deg,#1a241e,#141d17)',
              border: '2px solid #0c1510',
            }}>
              <div className="micro" style={{ fontSize: 9 }}>{b.label}</div>
              <div className="val shadow-hard" style={{ fontSize: 30, color: b.color, marginTop: 1 }}>{b.value}</div>
            </div>
          ))}
        </div>

        {/* Escalações + Trocas (compact boxes) */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Escalações', value: run.tentativasRestantes },
            { label: 'Trocas', value: run.trocasRestantes },
          ].map(b => (
            <div key={b.label} style={{
              flex: 1, borderRadius: 10, padding: '6px 10px 8px',
              background: 'linear-gradient(180deg,#1a241e,#141d17)',
              border: '2px solid #0c1510',
            }}>
              <div className="micro" style={{ fontSize: 9 }}>{b.label}</div>
              <div className="val shadow-hard" style={{ fontSize: 30, color: 'var(--ink)', marginTop: 1 }}>{b.value}</div>
            </div>
          ))}
        </div>

        <div className="hr" />

        {/* Era (compact — inline tags) */}
        <div>
          <div className="micro" style={{ fontSize: 9, marginBottom: 5 }}>Era</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {run.era.map((attr, i) => {
              const colors = ['var(--green)', 'var(--gold)', 'var(--pos-mei)']
              return (
                <span key={attr} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: '#141d17', border: '1px solid #0c1510', borderRadius: 7,
                  padding: '3px 8px',
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: colors[i % colors.length] }} />
                  <span className="val" style={{ fontSize: 16, color: 'var(--ink)' }}>{getAttributeLabel(attr)}</span>
                </span>
              )
            })}
          </div>
        </div>

        {/* Twist */}
        {run.twist && (
          <div style={{
            background: 'rgba(232,118,43,0.08)',
            border: '1px solid rgba(232,118,43,0.25)',
            borderRadius: 'var(--r-sm)',
            padding: '5px 8px',
          }}>
            <span className="micro" style={{ fontSize: 9, color: 'var(--orange)' }}>Clássico: </span>
            <span className="val" style={{ fontSize: 15, color: 'var(--orange-l)' }}>{run.twist.descricao}</span>
          </div>
        )}

        {/* Preview BASE × MULT */}
        {previewScore && (
          <div style={{ textAlign: 'center' }}>
            <div className="micro" style={{ fontSize: 9, marginBottom: 2 }}>Preview</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span className="val shadow-hard" style={{ fontSize: 26, color: 'var(--pos-mei)' }}>{previewScore.base}</span>
              <span className="val" style={{ fontSize: 16, color: 'var(--ink-dim)' }}>×</span>
              <span className="val shadow-hard" style={{ fontSize: 26, color: 'var(--pos-ata)' }}>{previewScore.mult.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Boosts */}
        {run.boosts.length > 0 && (
          <>
            <div className="hr" />
            <BoostBar boosts={run.boosts} />
          </>
        )}
      </div>

      {/* === COMBOS === */}
      <div className="panel" style={{ padding: '12px 14px 10px' }}>
        <button
          onClick={() => setShowCombos(!showCombos)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginBottom: showCombos ? 8 : 0,
          }}
        >
          <span className="micro">
            Combos ({combosAtivos}/{comboProgress.length})
          </span>
          <span className="val" style={{
            fontSize: 14,
            color: 'var(--label)',
            transform: showCombos ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease',
            display: 'inline-block',
          }}>
            ▼
          </span>
        </button>
        {showCombos && <ComboGuide combos={comboProgress} />}
      </div>

      {/* Deck Viewer */}
      <DeckViewer
        mao={run.mao}
        baralho={run.baralho}
        escalacao={run.escalacao}
        descarte={run.descarte}
        activeAttributes={run.era}
      />

      {/* Encerrar button */}
      <button
        onClick={() => setShowDesistir(true)}
        className="btn-arcade btn-cancel btn-sm"
        style={{ width: '100%', fontSize: 14, padding: '8px 12px 10px' }}
      >
        Encerrar
      </button>
    </div>
  )

  /* ---- Right column: Field + Actions + Hand ---- */
  const rightColumn = (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      overflow: 'hidden',
      padding: mobile ? '0 8px 8px' : '12px 12px 12px 0',
      gap: 8,
    }}>
      {/* Score (only shows if already attempted) */}
      {run.ultimaPontuacao && (
        <ScoreDisplay
          result={run.ultimaPontuacao}
          meta={run.meta}
          tentativas={run.tentativasRestantes}
          trocas={run.trocasRestantes}
          escalacao={run.escalacao}
          adversario={info.adversario}
        />
      )}

      {/* Combo flash toast */}
      {comboFlash && (
        <div style={{
          textAlign: 'center',
          padding: '6px 0',
          animation: 'fadeInUp 0.3s ease-out',
        }}>
          <span style={{
            fontFamily: '"Jersey 10", monospace',
            fontSize: 22,
            color: 'var(--gold)',
            background: 'rgba(242,193,78,.12)',
            border: '2px solid var(--gold)',
            borderRadius: 'var(--r-sm)',
            padding: '4px 16px 2px',
            boxShadow: '0 0 16px rgba(242,193,78,.3)',
            textShadow: '0 2px 0 rgba(0,0,0,.4)',
          }}>
            COMBO! {comboFlash}
          </span>
        </div>
      )}

      {/* Field */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <PlayArea
          escalacao={run.escalacao}
          activeAttributes={run.era}
          maxSlots={config.partida.maxEscalacao}
          onRemove={onDesescalar}
          onSlotClick={handleSlotClick}
          mobile={mobile}
        />
      </div>

      {/* Action bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: mobile ? 8 : 14,
        height: mobile ? 48 : 56,
        flexShrink: 0,
        padding: '0 12px',
      }}>
        <button
          onClick={onJogar}
          disabled={run.escalacao.length === 0 || run.tentativasRestantes <= 0}
          className="btn-arcade btn-play"
          style={{ fontSize: mobile ? 18 : 24, padding: mobile ? '8px 20px 10px' : '10px 28px 13px' }}
        >
          JOGAR!
        </button>
        {modoTroca ? (
          <>
            <button
              onClick={handleTrocar}
              disabled={trocaSelecionados.size === 0}
              className="btn-arcade btn-swap"
              style={{ fontSize: mobile ? 16 : 22, padding: mobile ? '7px 16px 9px' : '9px 22px 12px' }}
            >
              Trocar ({trocaSelecionados.size})
            </button>
            <button
              onClick={() => { setModoTroca(false); setTrocaSelecionados(new Set()) }}
              className="btn-arcade btn-cancel"
              style={{ fontSize: mobile ? 16 : 22, padding: mobile ? '7px 16px 9px' : '9px 22px 12px' }}
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            onClick={() => setModoTroca(true)}
            disabled={run.trocasRestantes <= 0}
            className="btn-arcade btn-swap"
            style={{ fontSize: mobile ? 16 : 22, padding: mobile ? '7px 16px 9px' : '9px 22px 12px' }}
          >
            TROCAR ({run.trocasRestantes})
          </button>
        )}
      </div>

      {/* Hand */}
      <div className="panel" style={{ padding: mobile ? '8px 8px 6px' : '12px 14px 10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <span className="micro" style={{ fontSize: 10 }}>
            Mao ({run.mao.length})
            {modoTroca && (
              <span style={{ color: 'var(--orange)', marginLeft: 8 }}>Selecione para trocar</span>
            )}
            {!modoTroca && selectedCardId && (
              <span style={{ color: 'var(--green)', marginLeft: 8 }}>Clique em um slot</span>
            )}
          </span>
        </div>
        <Hand
          cards={run.mao}
          activeAttributes={run.era}
          onSelect={handleCardClick}
          selectedIds={modoTroca ? trocaSelecionados : (selectedCardId ? new Set([selectedCardId]) : undefined)}
          escaladoIds={escaladoIds}
          mobile={mobile}
          deckSize={run.baralho.length}
        />
      </div>
    </div>
  )

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: mobile ? 'column' : 'row',
      overflow: 'hidden',
    }}>
      {/* Mobile: show a compact top bar instead of full left column */}
      {mobile ? (
        <>
          {/* Compact mobile top bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 10px',
            background: 'var(--panel)',
            borderBottom: '2px solid var(--panel-line)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="val" style={{ fontSize: 18, color: 'var(--ink)' }}>{info.fase}</span>
              <span className="micro" style={{ fontSize: 9 }}>
                {info.partida}/{info.totalPartidas}
                {info.isClassico && <span style={{ color: 'var(--orange)', marginLeft: 4 }}>CL</span>}
              </span>
            </div>
            <span className="val" style={{ fontSize: 16, color: 'var(--ink)' }}>
              vs {info.adversario}
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <span className="val" style={{ fontSize: 16, color: 'var(--gold)' }}>{run.meta}</span>
              <span className="val" style={{ fontSize: 16, color: 'var(--green)' }}>${run.orcamento}</span>
            </div>
          </div>

          {/* Twist warning mobile */}
          {run.twist && (
            <div style={{
              background: 'rgba(232,118,43,0.08)',
              border: '1px solid rgba(232,118,43,0.25)',
              padding: '4px 10px',
              textAlign: 'center',
            }}>
              <span className="micro" style={{ fontSize: 9, color: 'var(--orange)' }}>Classico: </span>
              <span className="val" style={{ fontSize: 14, color: 'var(--orange-l)' }}>{run.twist.descricao}</span>
            </div>
          )}

          {/* Mobile boosts */}
          {run.boosts.length > 0 && (
            <div style={{ padding: '4px 8px' }}>
              <BoostBar boosts={run.boosts} />
            </div>
          )}

          {/* Main content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
            {rightColumn}

            {/* Mobile combos toggle */}
            <div style={{ padding: '0 8px 4px' }}>
              <button
                onClick={() => setShowCombos(!showCombos)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'var(--panel)',
                  border: '2px solid var(--panel-line)',
                  borderRadius: 'var(--r-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span className="micro" style={{ fontSize: 10 }}>
                  Combos ({combosAtivos})
                </span>
                <span className="val" style={{
                  fontSize: 12,
                  color: 'var(--label)',
                  transform: showCombos ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                  display: 'inline-block',
                }}>▼</span>
              </button>
            </div>
            {showCombos && (
              <div style={{ padding: '0 8px 8px' }}>
                <ComboGuide combos={comboProgress} />
                <div style={{ marginTop: 6 }}>
                  <DeckViewer
                    mao={run.mao}
                    baralho={run.baralho}
                    escalacao={run.escalacao}
                    descarte={run.descarte}
                    activeAttributes={run.era}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {leftColumn}
          {rightColumn}
        </>
      )}

      {/* Confirm desistir modal */}
      {showDesistir && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div className="panel" style={{
            padding: 24,
            textAlign: 'center',
            maxWidth: 340,
            border: '2px solid var(--pos-ata)',
          }}>
            <div className="val shadow-hard" style={{ fontSize: 28, color: 'var(--pos-ata)', marginBottom: 12 }}>
              ENCERRAR RUN?
            </div>
            <p className="val" style={{ fontSize: 20, color: 'var(--ink-dim)', marginBottom: 16 }}>
              Voce vai perder todo o progresso desta run.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={onDesistir} className="btn-arcade btn-cancel btn-sm">
                Sim, encerrar
              </button>
              <button onClick={() => setShowDesistir(false)} className="btn-arcade btn-play btn-sm">
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
