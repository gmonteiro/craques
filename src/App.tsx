import { useGameStore } from './state/store'
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
    reroll, sairLoja,
  } = useGameStore()

  if (screen === 'title' || !run) {
    return <TitleScreen onNovaRun={novaRun} onDailyRun={dailyRun} />
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
