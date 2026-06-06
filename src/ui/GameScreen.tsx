import { useState, useEffect } from 'react'
import type { RunState } from '../engine/types'
import { infoPartida } from '../engine/run'
import { getAttributeLabel } from '../engine/attributes'
import { useIsMobile } from '../hooks/useIsMobile'
import { Hand } from './Hand'
import { PlayArea } from './PlayArea'
import { BoostBar } from './BoostBar'
import { ScoreDisplay } from './ScoreDisplay'
import { Shop } from './Shop'
import { ComboGuide } from './ComboGuide'
import { getComboProgress } from '../engine/combos'
import config from '../../data/config.json'

interface Props {
  run: RunState
  onEscalar: (id: string) => void
  onDesescalar: (id: string) => void
  onJogar: () => void
  onTrocar: (ids: string[]) => void
  onAvancar: () => void
  onComprarJogador: (id: string) => void
  onComprarBoost: (id: string) => void
  onVenderJogador: (id: string) => void
  onReroll: () => void
  onSairLoja: () => void
}

export function GameScreen({
  run, onEscalar, onDesescalar, onJogar, onTrocar,
  onAvancar, onComprarJogador, onComprarBoost, onVenderJogador,
  onReroll, onSairLoja,
}: Props) {
  const [trocaSelecionados, setTrocaSelecionados] = useState<Set<string>>(new Set())
  const [modoTroca, setModoTroca] = useState(false)
  const [showCombos, setShowCombos] = useState(false)
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
        onSair={onSairLoja}
        custoReroll={config.economia.custoReroll}
      />
    )
  }

  // === RESULTADO ===
  if (run.status === 'resultado') {
    return (
      <div className="p-2 md:p-4 text-center space-y-4 md:space-y-6 bg-black/40 min-h-screen">
        <Header info={info} run={run} />
        <ScoreDisplay
          result={run.ultimaPontuacao}
          meta={run.meta}
          tentativas={run.tentativasRestantes}
          trocas={run.trocasRestantes}
        />
        <button
          onClick={onAvancar}
          className="px-8 py-3 min-h-[44px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-lg"
        >
          Avancar →
        </button>
      </div>
    )
  }

  // === ESCALANDO ===
  return (
    <div className="flex flex-col h-screen bg-black/40">
      <Header info={info} run={run} />

      {/* Twist warning */}
      {run.twist && (
        <div className="mx-2 md:mx-4 mb-1 md:mb-2 bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 text-center">
          <span className="text-xs text-orange-400 font-bold">CLASSICO: </span>
          <span className="text-xs text-orange-300">{run.twist.descricao}</span>
        </div>
      )}

      {/* Score Display */}
      <ScoreDisplay
        result={run.ultimaPontuacao}
        meta={run.meta}
        tentativas={run.tentativasRestantes}
        trocas={run.trocasRestantes}
      />

      {/* Boosts */}
      <BoostBar boosts={run.boosts} />

      {/* Área de escalação + Combos */}
      <div className="flex-1 overflow-auto p-2 md:p-4 flex flex-col md:flex-row gap-2 md:gap-4">
        <div className="flex-1">
          <PlayArea
            escalacao={run.escalacao}
            activeAttributes={run.era}
            maxSlots={config.partida.maxEscalacao}
            onRemove={onDesescalar}
            mobile={mobile}
          />
        </div>

        {/* Combos: toggle no mobile, sempre visível no desktop */}
        <div className="md:w-64 md:flex-shrink-0">
          <button
            onClick={() => setShowCombos(!showCombos)}
            className="md:hidden w-full py-2 bg-gray-800/80 rounded-lg text-sm text-gray-300 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>Combos ({combosAtivos}/{comboProgress.length})</span>
            <span className={`transition-transform ${showCombos ? 'rotate-180' : ''}`}>▼</span>
          </button>
          <div className={`${showCombos ? '' : 'hidden'} md:block mt-1 md:mt-0`}>
            <ComboGuide combos={comboProgress} />
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-center gap-2 md:gap-3 py-2 md:py-3">
        <button
          onClick={onJogar}
          disabled={run.escalacao.length === 0 || run.tentativasRestantes <= 0}
          className="px-4 md:px-6 py-2 min-h-[44px] bg-green-600 hover:bg-green-500 disabled:opacity-30 rounded-lg font-bold transition"
        >
          Jogar!
        </button>
        {modoTroca ? (
          <>
            <button
              onClick={handleTrocar}
              disabled={trocaSelecionados.size === 0}
              className="px-3 md:px-4 py-2 min-h-[44px] bg-orange-600 hover:bg-orange-500 disabled:opacity-30 rounded-lg font-bold text-sm transition"
            >
              Trocar ({trocaSelecionados.size})
            </button>
            <button
              onClick={() => { setModoTroca(false); setTrocaSelecionados(new Set()) }}
              className="px-3 md:px-4 py-2 min-h-[44px] bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            onClick={() => setModoTroca(true)}
            disabled={run.trocasRestantes <= 0}
            className="px-3 md:px-4 py-2 min-h-[44px] bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded-lg text-sm transition"
          >
            Trocar ({run.trocasRestantes})
          </button>
        )}
      </div>

      {/* Mão */}
      <div className="border-t border-gray-800 bg-gray-900/50 p-2 md:p-3">
        <span className="text-xs text-gray-500 mb-1 block">
          Mao ({run.mao.length} cartas)
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
  )
}

function Header({ info, run }: { info: ReturnType<typeof infoPartida>; run: RunState }) {
  return (
    <div className="flex flex-wrap items-center justify-between px-2 md:px-4 py-2 md:py-3 border-b border-gray-800 bg-gray-900/80 gap-1">
      <div>
        <span className="text-xs md:text-sm font-bold text-white">{info.fase}</span>
        <span className="text-[10px] md:text-xs text-gray-500 ml-1 md:ml-2">
          {info.partida}/{info.totalPartidas}
          {info.isClassico && <span className="text-orange-400 ml-1">CLASSICO</span>}
        </span>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <span className="text-[10px] md:text-xs text-gray-400">
          vs <span className="text-white font-bold">{info.adversario}</span>
        </span>
        <span className="text-[10px] md:text-xs text-yellow-400 font-bold">${run.orcamento}</span>
      </div>
      <div className="flex gap-1 w-full md:w-auto justify-center md:justify-end mt-1 md:mt-0">
        {run.era.map(attr => (
          <span key={attr} className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-400">
            {getAttributeLabel(attr)}
          </span>
        ))}
      </div>
    </div>
  )
}
