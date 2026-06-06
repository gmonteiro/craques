import { useState, useEffect } from 'react'
import type { RunState } from '../engine/types'
import { nomeFase, infoPartida } from '../engine/run'
import { getAttributeLabel } from '../engine/attributes'
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
  const info = infoPartida(run)

  // Reset troca mode when not escalando
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

  // === RESULTADO (bateu meta) ===
  if (run.status === 'resultado') {
    return (
      <div className="p-4 text-center space-y-6 bg-black/40 min-h-screen">
        <Header info={info} run={run} />
        <ScoreDisplay
          result={run.ultimaPontuacao}
          meta={run.meta}
          tentativas={run.tentativasRestantes}
          trocas={run.trocasRestantes}
        />
        <button
          onClick={onAvancar}
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-lg"
        >
          Avancar →
        </button>
      </div>
    )
  }

  // === ESCALANDO ===
  return (
    <div className="flex flex-col h-screen bg-black/40">
      {/* Header */}
      <Header info={info} run={run} />

      {/* Twist warning */}
      {run.twist && (
        <div className="mx-4 mb-2 bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 text-center">
          <span className="text-xs text-orange-400 font-bold">CLASSICO: </span>
          <span className="text-xs text-orange-300">{run.twist.descricao}</span>
        </div>
      )}

      {/* Score Display (mostra última tentativa se houver) */}
      <ScoreDisplay
        result={run.ultimaPontuacao}
        meta={run.meta}
        tentativas={run.tentativasRestantes}
        trocas={run.trocasRestantes}
      />

      {/* Boosts */}
      <BoostBar boosts={run.boosts} />

      {/* Área de escalação + Painel de combos */}
      <div className="flex-1 overflow-auto p-4 flex gap-4">
        <div className="flex-1">
          <PlayArea
            escalacao={run.escalacao}
            activeAttributes={run.era}
            maxSlots={config.partida.maxEscalacao}
            onRemove={onDesescalar}
          />
        </div>
        <div className="w-64 flex-shrink-0">
          <ComboGuide combos={getComboProgress(run.escalacao, run.mao)} />
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-center gap-3 py-3">
        <button
          onClick={onJogar}
          disabled={run.escalacao.length === 0 || run.tentativasRestantes <= 0}
          className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-30 rounded-lg font-bold transition"
        >
          Jogar!
        </button>
        {modoTroca ? (
          <>
            <button
              onClick={handleTrocar}
              disabled={trocaSelecionados.size === 0}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-30 rounded-lg font-bold text-sm transition"
            >
              Trocar ({trocaSelecionados.size})
            </button>
            <button
              onClick={() => { setModoTroca(false); setTrocaSelecionados(new Set()) }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            onClick={() => setModoTroca(true)}
            disabled={run.trocasRestantes <= 0}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded-lg text-sm transition"
          >
            Trocar ({run.trocasRestantes})
          </button>
        )}
      </div>

      {/* Mão */}
      <div className="border-t border-gray-800 bg-gray-900/50 p-3">
        <span className="text-xs text-gray-500 mb-1 block">
          Mao ({run.mao.length} cartas)
          {modoTroca && <span className="text-orange-400 ml-2">Selecione cartas para trocar</span>}
        </span>
        <Hand
          cards={run.mao}
          activeAttributes={run.era}
          onSelect={handleCardClick}
          selectedIds={modoTroca ? trocaSelecionados : undefined}
        />
      </div>
    </div>
  )
}

// Header component
function Header({ info, run }: { info: ReturnType<typeof infoPartida>; run: RunState }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/80">
      <div>
        <span className="text-sm font-bold text-white">{info.fase}</span>
        <span className="text-xs text-gray-500 ml-2">
          Partida {info.partida}/{info.totalPartidas}
          {info.isClassico && <span className="text-orange-400 ml-1">CLASSICO</span>}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs text-gray-400">
          vs <span className="text-white font-bold">{info.adversario}</span>
        </div>
        <div className="text-xs">
          <span className="text-gray-500">$</span>
          <span className="text-yellow-400 font-bold">{run.orcamento}</span>
        </div>
      </div>
      <div className="flex gap-1">
        {run.era.map(attr => (
          <span key={attr} className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-400">
            {getAttributeLabel(attr)}
          </span>
        ))}
      </div>
    </div>
  )
}
