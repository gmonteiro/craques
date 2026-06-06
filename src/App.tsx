import { useState } from 'react'
import { useGameStore } from './state/store'
import { TitleScreen } from './ui/TitleScreen'
import { GameScreen } from './ui/GameScreen'
import { RunEndScreen } from './ui/RunEndScreen'
import { Tutorial } from './ui/Tutorial'

function App() {
  const {
    run, screen,
    novaRun, dailyRun, voltarTitulo,
    escalarJogador, desescalarJogador, jogarEscalacao,
    trocarJogadores, avancarPartida,
    comprarJogadorLoja, comprarBoostLoja, venderJogadorBaralho,
    reroll, sairLoja,
  } = useGameStore()

  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem('craques-tutorial-done')
  })

  const completeTutorial = () => {
    localStorage.setItem('craques-tutorial-done', '1')
    setShowTutorial(false)
  }

  if (screen === 'title' || !run) {
    return (
      <>
        {showTutorial && <Tutorial onComplete={completeTutorial} />}
        <TitleScreen onNovaRun={novaRun} onDailyRun={dailyRun} />
      </>
    )
  }

  if (screen === 'runEnd') {
    return <RunEndScreen run={run} onVoltarTitulo={voltarTitulo} />
  }

  return (
    <GameScreen
      run={run}
      onEscalar={escalarJogador}
      onDesescalar={desescalarJogador}
      onJogar={jogarEscalacao}
      onTrocar={trocarJogadores}
      onAvancar={avancarPartida}
      onComprarJogador={comprarJogadorLoja}
      onComprarBoost={comprarBoostLoja}
      onVenderJogador={venderJogadorBaralho}
      onReroll={reroll}
      onSairLoja={sairLoja}
    />
  )
}

export default App
