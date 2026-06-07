import { useEffect, useState } from 'react'
import { useGameStore } from './state/store'
import { useCollection } from './state/collection'
import { checkAchievements, type Achievement } from './lib/achievements'
import { sounds } from './lib/sounds'
import { initBgm } from './lib/bgm'
import { TitleScreen } from './ui/TitleScreen'
import { GameScreen } from './ui/GameScreen'
import { RunEndScreen } from './ui/RunEndScreen'
import { CoachSelect } from './ui/CoachSelect'
import type { Coach } from './engine/coaches'

function App() {
  const {
    run, screen,
    novaRun, novaRunCoach, dailyRun, voltarTitulo,
    escalarJogador, desescalarJogador, jogarEscalacao,
    trocarJogadores, avancarPartida,
    comprarJogadorLoja, comprarBoostLoja, venderJogadorBaralho,
    reroll, refresh, sairLoja, escolherPath,
  } = useGameStore()

  const collection = useCollection()

  // Initialize auth + collection + bgm on mount
  useEffect(() => {
    collection.init()
    initBgm()
  }, [])

  // Nova Run → show coach selection first
  const handleNovaRun = (seed?: number) => {
    setPendingSeed(seed)
    setShowCoachSelect(true)
  }

  const handleCoachSelected = (coach: Coach) => {
    setShowCoachSelect(false)
    novaRunCoach(coach.id, pendingSeed)
    setPendingSeed(undefined)
    // Unlock initial deck
    const currentRun = useGameStore.getState().run
    if (currentRun) {
      const allIds = [...currentRun.mao, ...currentRun.baralho].map(p => p.id)
      collection.unlockPlayers(allIds)
    }
  }

  const handleDailyRun = () => {
    dailyRun()
    const currentRun = useGameStore.getState().run
    if (currentRun) {
      const allIds = [...currentRun.mao, ...currentRun.baralho].map(p => p.id)
      collection.unlockPlayers(allIds)
    }
  }

  // Wrap comprar to unlock
  const handleComprarJogador = (id: string) => {
    comprarJogadorLoja(id)
    collection.unlockPlayer(id)
  }

  const handleComprarBoost = (id: string, targetPlayerId?: string) => {
    comprarBoostLoja(id, targetPlayerId)
    collection.unlockBoost(id)
  }

  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null)
  const [showCoachSelect, setShowCoachSelect] = useState(false)
  const [pendingSeed, setPendingSeed] = useState<number | undefined>(undefined)

  // Check achievements after each play
  useEffect(() => {
    if (!run || !run.ultimaPontuacao) return
    const ctx = {
      escalacao: run.escalacao,
      result: run.ultimaPontuacao,
      combosAtivos: run.ultimaPontuacao.combos.length,
      fase: run.fase,
      won: run.status === 'vitoria',
      totalRuns: collection.stats.runs,
      totalWins: collection.stats.wins,
      unlockedPlayers: collection.unlockedPlayers.length,
      unlockedBoosts: collection.unlockedBoosts.length,
    }
    const newAchievements = checkAchievements(ctx, collection.earnedAchievements)
    if (newAchievements.length > 0) {
      collection.earnAchievements(newAchievements.map(a => a.id))
      setAchievementToast(newAchievements[0])
      sounds.legendary()
      setTimeout(() => setAchievementToast(null), 3500)
    }
  }, [run?.ultimaPontuacao, run?.status])

  // Wrap voltarTitulo to record run
  const handleVoltarTitulo = () => {
    if (run) {
      const won = run.status === 'vitoria'
      const score = run.ultimaPontuacao?.total ?? 0
      collection.recordRun(won, score)
    }
    voltarTitulo()
  }

  // Achievement toast overlay
  const toast = achievementToast ? (
    <div style={{
      position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 100, animation: 'fadeInUp 0.4s ease-out',
    }}>
      <div className="panel" style={{
        padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12,
        border: '2px solid var(--gold)',
        boxShadow: '0 0 20px rgba(242,193,78,.4), 0 8px 0 rgba(0,0,0,.3)',
      }}>
        <span style={{ fontSize: 32 }}>{achievementToast.icone}</span>
        <div>
          <div className="val" style={{ fontSize: 20, color: 'var(--gold)' }}>CONQUISTA!</div>
          <div className="val" style={{ fontSize: 16, color: 'var(--ink)' }}>{achievementToast.nome}</div>
          <div className="micro" style={{ fontSize: 9, marginTop: 2 }}>{achievementToast.descricao}</div>
        </div>
      </div>
    </div>
  ) : null

  if (showCoachSelect) {
    return (
      <>
        {toast}
        <CoachSelect onSelect={handleCoachSelected} />
      </>
    )
  }

  if (screen === 'title' || !run) {
    return (
      <>
        {toast}

        <TitleScreen onNovaRun={handleNovaRun} onDailyRun={handleDailyRun} />
      </>
    )
  }

  if (screen === 'runEnd') {
    return (
      <>
        {toast}

        <RunEndScreen run={run} onVoltarTitulo={handleVoltarTitulo} />
      </>
    )
  }

  return (
    <>
      {toast}
      <GameScreen
        run={run}
        onEscalar={escalarJogador}
        onDesescalar={desescalarJogador}
        onJogar={jogarEscalacao}
        onTrocar={trocarJogadores}
        onAvancar={avancarPartida}
        onComprarJogador={handleComprarJogador}
        onComprarBoost={handleComprarBoost}
        onVenderJogador={venderJogadorBaralho}
        onReroll={reroll}
        onRefresh={refresh}
        onSairLoja={sairLoja}
        onEscolherPath={escolherPath}
        onDesistir={handleVoltarTitulo}
      />
    </>
  )
}

export default App
