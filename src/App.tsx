import { useEffect } from 'react'
import { useGameStore } from './state/store'
import { useCollection } from './state/collection'
import { TitleScreen } from './ui/TitleScreen'
import { GameScreen } from './ui/GameScreen'
import { RunEndScreen } from './ui/RunEndScreen'

function App() {
  const {
    run, screen,
    novaRun, dailyRun, voltarTitulo,
    escalarJogador, desescalarJogador, jogarEscalacao,
    trocarJogadores, avancarPartida,
    comprarJogadorLoja, comprarBoostLoja, venderJogadorBaralho,
    reroll, refresh, sairLoja, escolherPath,
  } = useGameStore()

  const collection = useCollection()

  // Initialize auth + collection on mount
  useEffect(() => {
    collection.init()
  }, [])

  // Wrap novaRun to pass collection and unlock initial deck
  const handleNovaRun = (seed?: number) => {
    novaRun(seed)
    // After run starts, unlock all initial deck players
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

  // Wrap voltarTitulo to record run
  const handleVoltarTitulo = () => {
    if (run) {
      const won = run.status === 'vitoria'
      const score = run.ultimaPontuacao?.total ?? 0
      collection.recordRun(won, score)
    }
    voltarTitulo()
  }

  if (screen === 'title' || !run) {
    return <TitleScreen onNovaRun={handleNovaRun} onDailyRun={handleDailyRun} />
  }

  if (screen === 'runEnd') {
    return <RunEndScreen run={run} onVoltarTitulo={handleVoltarTitulo} />
  }

  return (
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
  )
}

export default App
