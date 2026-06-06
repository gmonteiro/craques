import { useEffect, useState, useRef } from 'react'
import type { ScoreResult } from '../engine/types'

interface Props {
  result: ScoreResult | null
  meta: number
  tentativas: number
  trocas: number
}

// Gera um placar de jogo baseado no resultado
function gerarPlacar(passou: boolean, rng: number): { gols: number; golsAdv: number; eventos: MatchEvent[] } {
  const seed = Math.abs(rng) % 1000
  let gols: number, golsAdv: number

  if (passou) {
    // Vitória: 1-0 a 4-1
    const opcoes = [[1,0],[2,0],[2,1],[3,1],[3,0],[3,2],[4,1],[1,0],[2,0]]
    const pick = opcoes[seed % opcoes.length]
    gols = pick[0]; golsAdv = pick[1]
  } else {
    // Derrota: 0-1 a 1-3
    const opcoes = [[0,1],[0,2],[1,2],[1,3],[0,1],[0,3]]
    const pick = opcoes[seed % opcoes.length]
    gols = pick[0]; golsAdv = pick[1]
  }

  // Gerar eventos (minutos dos gols)
  const eventos: MatchEvent[] = []
  const totalGols = gols + golsAdv
  const minutos = Array.from({ length: totalGols }, (_, i) =>
    10 + Math.floor(((seed * (i + 1) * 7) % 80))
  ).sort((a, b) => a - b)

  // Distribuir gols entre time e adversário
  let nossos = gols, deles = golsAdv
  for (let i = 0; i < totalGols; i++) {
    const isNosso = (seed * (i + 3)) % (nossos + deles) < nossos
    if (isNosso && nossos > 0) {
      eventos.push({ minuto: minutos[i], tipo: 'gol', equipe: 'nos' })
      nossos--
    } else if (deles > 0) {
      eventos.push({ minuto: minutos[i], tipo: 'gol', equipe: 'adv' })
      deles--
    } else {
      eventos.push({ minuto: minutos[i], tipo: 'gol', equipe: 'nos' })
      nossos--
    }
  }

  return { gols, golsAdv, eventos }
}

interface MatchEvent {
  minuto: number
  tipo: 'gol'
  equipe: 'nos' | 'adv'
}

type Phase = 'idle' | 'narrating' | 'scoreboard' | 'points' | 'done'

export function ScoreDisplay({ result, meta, tentativas, trocas }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [eventIdx, setEventIdx] = useState(0)
  const [placarNos, setPlacarNos] = useState(0)
  const [placarAdv, setPlacarAdv] = useState(0)
  const [animatedTotal, setAnimatedTotal] = useState(0)
  const [flashGol, setFlashGol] = useState<'nos' | 'adv' | null>(null)
  const prevResult = useRef<ScoreResult | null>(null)

  const passou = result ? result.total >= meta : false

  useEffect(() => {
    if (!result || result === prevResult.current) return
    prevResult.current = result

    const { eventos } = gerarPlacar(passou, result.total + meta)

    // Reset
    setPlacarNos(0)
    setPlacarAdv(0)
    setEventIdx(0)
    setAnimatedTotal(0)
    setFlashGol(null)

    if (eventos.length === 0) {
      // 0-0 direto pro scoreboard
      setPhase('scoreboard')
      setTimeout(() => {
        setPhase('points')
        animatePoints(result.total)
      }, 1500)
      return
    }

    // Fase 1: narração dos gols
    setPhase('narrating')
    let nos = 0, adv = 0

    eventos.forEach((ev, i) => {
      setTimeout(() => {
        if (ev.equipe === 'nos') nos++; else adv++
        setPlacarNos(nos)
        setPlacarAdv(adv)
        setEventIdx(i + 1)
        setFlashGol(ev.equipe)
        setTimeout(() => setFlashGol(null), 600)

        // Último gol → ir pro scoreboard
        if (i === eventos.length - 1) {
          setTimeout(() => {
            setPhase('scoreboard')
            setTimeout(() => {
              setPhase('points')
              animatePoints(result.total)
            }, 1500)
          }, 1000)
        }
      }, 800 * (i + 1))
    })
  }, [result])

  function animatePoints(target: number) {
    const duration = 1200
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedTotal(Math.round(eased * target))
      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        setPhase('done')
      }
    }
    requestAnimationFrame(tick)
  }

  // === IDLE: sem resultado ===
  if (!result || phase === 'idle') {
    return (
      <div className="text-center py-2 md:py-3">
        <div className="mb-1">
          <span className="text-gray-500" style={{ fontFamily: "'VT323',monospace", fontSize: 16 }}>META</span>
        </div>
        <div className="text-2xl md:text-3xl font-black text-yellow-400" style={{ fontFamily: "'Press Start 2P',monospace" }}>
          {meta.toLocaleString()}
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <span className="text-xs text-gray-500">Escalacoes: <span className="text-white font-bold">{tentativas}</span></span>
          <span className="text-xs text-gray-500">Trocas: <span className="text-white font-bold">{trocas}</span></span>
        </div>
      </div>
    )
  }

  // === NARRATING: gols sendo marcados ===
  if (phase === 'narrating') {
    return (
      <div className="text-center py-3 md:py-4">
        {/* Mini campo com placar */}
        <div className="inline-block bg-gray-900/90 border-2 border-gray-600 rounded-lg px-8 py-4 relative overflow-hidden">
          {/* Flash de gol */}
          {flashGol && (
            <div className={`absolute inset-0 ${flashGol === 'nos' ? 'bg-green-500/20' : 'bg-red-500/20'} animate-pulse`} />
          )}
          <div className="text-gray-500 text-xs mb-2" style={{ fontFamily: "'VT323',monospace" }}>
            AO VIVO
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1" style={{ fontFamily: "'VT323',monospace" }}>SEU TIME</div>
              <div className={`text-4xl md:text-5xl font-black ${flashGol === 'nos' ? 'text-green-400 scale-125' : 'text-white'} transition-all`}
                style={{ fontFamily: "'Press Start 2P',monospace" }}>
                {placarNos}
              </div>
            </div>
            <div className="text-2xl text-gray-600 font-black" style={{ fontFamily: "'Press Start 2P',monospace" }}>×</div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1" style={{ fontFamily: "'VT323',monospace" }}>ADVERSARIO</div>
              <div className={`text-4xl md:text-5xl font-black ${flashGol === 'adv' ? 'text-red-400 scale-125' : 'text-white'} transition-all`}
                style={{ fontFamily: "'Press Start 2P',monospace" }}>
                {placarAdv}
              </div>
            </div>
          </div>
          {flashGol === 'nos' && (
            <div className="mt-2 text-green-400 font-black animate-bounce"
              style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 16 }}>
              GOOOL!!!
            </div>
          )}
          {flashGol === 'adv' && (
            <div className="mt-2 text-red-400 font-black"
              style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 12 }}>
              Gol do adversario...
            </div>
          )}
        </div>
      </div>
    )
  }

  // === SCOREBOARD: placar final revelado ===
  if (phase === 'scoreboard') {
    return (
      <div className="text-center py-3 md:py-4">
        <div className="inline-block bg-gray-900/90 border-2 border-yellow-500/50 rounded-lg px-10 py-5">
          <div className="text-yellow-400 text-xs mb-3" style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10 }}>
            FIM DE JOGO
          </div>
          <div className="flex items-center justify-center gap-8">
            <div className="text-5xl md:text-6xl font-black text-white" style={{ fontFamily: "'Press Start 2P',monospace" }}>
              {placarNos}
            </div>
            <div className="text-2xl text-gray-500" style={{ fontFamily: "'Press Start 2P',monospace" }}>×</div>
            <div className="text-5xl md:text-6xl font-black text-white" style={{ fontFamily: "'Press Start 2P',monospace" }}>
              {placarAdv}
            </div>
          </div>
          <div className={`mt-3 text-lg font-black ${passou ? 'text-green-400' : 'text-red-400'}`}
            style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14 }}>
            {passou ? 'VITORIA!' : 'DERROTA'}
          </div>
        </div>
      </div>
    )
  }

  // === POINTS / DONE: pontuação final ===
  return (
    <div className="text-center py-3 md:py-4">
      <div className="inline-block bg-gray-900/90 border-2 border-gray-600 rounded-lg px-8 py-4">
        {/* Placar pequeno */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-lg text-white font-black" style={{ fontFamily: "'Press Start 2P',monospace" }}>
            {placarNos}
          </span>
          <span className="text-xs text-gray-500">×</span>
          <span className="text-lg text-white font-black" style={{ fontFamily: "'Press Start 2P',monospace" }}>
            {placarAdv}
          </span>
          <span className={`text-xs font-bold ml-2 ${passou ? 'text-green-400' : 'text-red-400'}`}>
            {passou ? 'VITORIA' : 'DERROTA'}
          </span>
        </div>

        {/* Meta vs Score */}
        <div className="mb-1">
          <span className="text-gray-500 text-xs">META: </span>
          <span className="text-gray-300 font-bold">{meta.toLocaleString()}</span>
        </div>
        <div className={`text-3xl md:text-4xl font-black tabular-nums ${passou ? 'text-green-400' : 'text-red-400'}`}
          style={{ fontFamily: "'Press Start 2P',monospace" }}>
          {animatedTotal.toLocaleString()}
        </div>

        {/* Breakdown */}
        {phase === 'done' && (
          <div className="mt-2 space-y-1">
            <div className="text-xs text-gray-400">
              <span className="text-blue-400 font-bold">{result.base}</span>
              <span className="mx-1">×</span>
              <span className="text-red-400 font-bold">{result.mult.toFixed(1)}</span>
            </div>
            {result.combos.length > 0 && (
              <div className="flex gap-1 justify-center flex-wrap">
                {result.combos.map(c => (
                  <span key={c.id} className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded-full text-gray-400">
                    {c.nome}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tentativas restantes */}
      <div className="flex justify-center gap-4 mt-2">
        <span className="text-xs text-gray-500">Escalacoes: <span className="text-white font-bold">{tentativas}</span></span>
        <span className="text-xs text-gray-500">Trocas: <span className="text-white font-bold">{trocas}</span></span>
      </div>
    </div>
  )
}
