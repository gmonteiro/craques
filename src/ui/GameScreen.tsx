import { useState, useEffect } from 'react'
import type { RunState } from '../engine/types'
import { infoPartida } from '../engine/run'
import { useIsMobile } from '../hooks/useIsMobile'
import { Hand } from './Hand'
import { PlayArea } from './PlayArea'
import { BoostBar } from './BoostBar'
import { ScoreDisplay } from './ScoreDisplay'
import { Shop } from './Shop'
import { ComboGuide } from './ComboGuide'
import { MatchInfo } from './MatchInfo'
import { DeckViewer } from './DeckViewer'
import { getComboProgress } from '../engine/combos'
import { calcularPontuacao } from '../engine/scoring'
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
  onDesistir: () => void
}

export function GameScreen({
  run, onEscalar, onDesescalar, onJogar, onTrocar,
  onAvancar, onComprarJogador, onComprarBoost, onVenderJogador,
  onReroll, onRefresh, onSairLoja, onDesistir,
}: Props) {
  const [trocaSelecionados, setTrocaSelecionados] = useState<Set<string>>(new Set())
  const [modoTroca, setModoTroca] = useState(false)
  const [showCombos, setShowCombos] = useState(false) // colapsado por padrão
  const [showDesistir, setShowDesistir] = useState(false)

  // Preview score em tempo real (como Balatro)
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

  const handleCardClick = (id: string) => {
    if (modoTroca) {
      const novo = new Set(trocaSelecionados)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      setTrocaSelecionados(novo)
    } else {
      onEscalar(id)
    }
  }

  const handleTrocar = () => {
    if (trocaSelecionados.size > 0) {
      onTrocar([...trocaSelecionados])
      setTrocaSelecionados(new Set())
      setModoTroca(false)
    }
  }

  const comboProgress = getComboProgress(run.escalacao, run.mao)
  const combosAtivos = comboProgress.filter(c => c.ativo).length

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
      <div className="h-screen bg-black/40 flex">
        {/* Left panel */}
        <div className="hidden md:block p-3">
          <MatchInfo run={run} />
        </div>
        {/* Center */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
          <ScoreDisplay
            result={run.ultimaPontuacao}
            meta={run.meta}
            tentativas={run.tentativasRestantes}
            trocas={run.trocasRestantes}
            escalacao={run.escalacao}
            adversario={info.adversario}
          />
          <button onClick={onAvancar} className="btn-arcade btn-advance">
            Avancar →
          </button>
        </div>
      </div>
    )
  }

  // === ESCALANDO — Layout estilo Balatro ===
  return (
    <div className="h-screen bg-black/40 flex flex-col md:flex-row overflow-hidden">

      {/* === LEFT PANEL (Balatro-style stacked info) === */}
      <div className="hidden md:flex flex-col gap-2 p-3 w-52 flex-shrink-0 overflow-y-auto">
        <MatchInfo run={run} />

        {/* Live score preview */}
        {previewScore && (
          <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Preview</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-blue-400 font-bold text-lg" style={{ fontFamily: "'VT323',monospace" }}>
                {previewScore.base}
              </span>
              <span className="text-gray-500 text-xs">×</span>
              <span className="text-red-400 font-bold text-lg" style={{ fontFamily: "'VT323',monospace" }}>
                {previewScore.mult.toFixed(1)}
              </span>
            </div>
            <div className={`text-xl font-black ${previewScore.total >= run.meta ? 'text-green-400' : 'text-yellow-400'}`}
              style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14 }}>
              {previewScore.total.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              Meta: {run.meta.toLocaleString()}
            </div>
          </div>
        )}

        {run.boosts.length > 0 && <BoostBar boosts={run.boosts} />}

        {/* Combos — colapsável */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg overflow-hidden">
          <button onClick={() => setShowCombos(!showCombos)}
            className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-white/5 transition">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Combos ({combosAtivos}/{comboProgress.length})
            </span>
            <span className={`text-gray-500 text-xs transition-transform ${showCombos ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {showCombos && <div className="px-2 pb-2"><ComboGuide combos={comboProgress} /></div>}
        </div>
        <DeckViewer
          mao={run.mao}
          baralho={run.baralho}
          escalacao={run.escalacao}
          descarte={run.descarte}
          activeAttributes={run.era}
        />
        {/* Desistir */}
        <button
          onClick={() => setShowDesistir(true)}
          className="text-[10px] text-gray-600 hover:text-red-400 transition mt-1 text-center"
          style={{ fontFamily: "'VT323',monospace" }}
        >
          Encerrar Run
        </button>
      </div>

      {/* Confirm desistir modal */}
      {showDesistir && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-900 border-2 border-red-500/50 rounded-lg p-6 text-center max-w-sm">
            <div className="text-red-400 font-black mb-3"
              style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14 }}>
              ENCERRAR RUN?
            </div>
            <p className="text-gray-400 text-sm mb-4" style={{ fontFamily: "'VT323',monospace", fontSize: 18 }}>
              Voce vai perder todo o progresso desta run.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={onDesistir} className="btn-arcade btn-cancel" style={{ fontSize: 10 }}>
                Sim, encerrar
              </button>
              <button onClick={() => setShowDesistir(false)} className="btn-arcade btn-play" style={{ fontSize: 10 }}>
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === CENTER (main game area) === */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile: compact top bar */}
        <div className="md:hidden flex items-center justify-between bg-gray-900/80 px-3 py-2 border-b border-gray-700 gap-2">
          <div className="text-[11px]">
            <span className="text-white font-bold">{info.fase}</span>
            <span className="text-gray-500 ml-1">{info.partida}/{info.totalPartidas}</span>
            {info.isClassico && <span className="text-orange-400 ml-1">CL</span>}
          </div>
          <div className="text-[11px]">
            vs <span className="text-white font-bold">{info.adversario}</span>
          </div>
          <div className="text-[11px] flex gap-2">
            <span className="text-yellow-400 font-bold">{run.meta}</span>
            <span className="text-green-400 font-bold">${run.orcamento}</span>
          </div>
        </div>

        {/* Twist warning */}
        {run.twist && (
          <div className="mx-2 my-1 bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 text-center">
            <span className="text-xs text-orange-400 font-bold">CLÁSSICO: </span>
            <span className="text-xs text-orange-300">{run.twist.descricao}</span>
          </div>
        )}

        {/* Boosts row on top (like Balatro jokers) */}
        <div className="md:hidden px-2 py-1">
          {run.boosts.length > 0 && <BoostBar boosts={run.boosts} />}
        </div>

        {/* Score (só mostra se já tentou) */}
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

        {/* Escalação (centro) */}
        <div className="flex-1 overflow-auto px-2 py-1 md:px-4 md:py-2">
          <PlayArea
            escalacao={run.escalacao}
            activeAttributes={run.era}
            maxSlots={config.partida.maxEscalacao}
            onRemove={onDesescalar}
            mobile={mobile}
          />
        </div>

        {/* Ações — arcade buttons */}
        <div className="flex justify-center gap-3 md:gap-4 py-2 md:py-3">
          <button
            onClick={onJogar}
            disabled={run.escalacao.length === 0 || run.tentativasRestantes <= 0}
            className="btn-arcade btn-play"
          >
            Jogar!
          </button>
          {modoTroca ? (
            <>
              <button
                onClick={handleTrocar}
                disabled={trocaSelecionados.size === 0}
                className="btn-arcade btn-swap"
              >
                Trocar ({trocaSelecionados.size})
              </button>
              <button
                onClick={() => { setModoTroca(false); setTrocaSelecionados(new Set()) }}
                className="btn-arcade btn-cancel"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setModoTroca(true)}
              disabled={run.trocasRestantes <= 0}
              className="btn-arcade btn-swap"
            >
              Trocar ({run.trocasRestantes})
            </button>
          )}
        </div>

        {/* Mobile: combos + deck toggle */}
        <div className="md:hidden px-2 pb-1 flex gap-2">
          <button
            onClick={() => setShowCombos(!showCombos)}
            className="flex-1 py-1.5 bg-gray-800/80 rounded-lg text-xs text-gray-300 flex items-center justify-center gap-1 min-h-[36px]"
          >
            <span>Combos ({combosAtivos})</span>
            <span className={`transition-transform ${showCombos ? 'rotate-180' : ''}`}>▼</span>
          </button>
        </div>
        {showCombos && (
          <div className="md:hidden px-2 pb-1 space-y-1">
            <ComboGuide combos={comboProgress} />
            <DeckViewer
              mao={run.mao}
              baralho={run.baralho}
              escalacao={run.escalacao}
              descarte={run.descarte}
              activeAttributes={run.era}
            />
          </div>
        )}

        {/* Mão (embaixo, como no Balatro) */}
        <div className="border-t border-gray-800 bg-gray-900/50 p-2 md:p-3">
          <span className="text-[10px] md:text-xs text-gray-500 mb-1 block">
            Mao ({run.mao.length})
            {modoTroca && <span className="text-orange-400 ml-2">Selecione para trocar</span>}
          </span>
          <Hand
            cards={run.mao}
            activeAttributes={run.era}
            onSelect={handleCardClick}
            selectedIds={modoTroca ? trocaSelecionados : undefined}
            mobile={mobile}
          />
        </div>
      </div>
    </div>
  )
}
