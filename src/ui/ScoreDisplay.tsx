import { useEffect, useState, useRef } from 'react'
import type { PlayerCard, ScoreResult } from '../engine/types'
import { sounds } from '../lib/sounds'

interface Props {
  result: ScoreResult | null
  meta: number
  tentativas: number
  trocas: number
  escalacao?: PlayerCard[]
  adversario?: string
}

// Jogadores adversários por seleção (para gols contra)
const JOGADORES_ADV: Record<string, string[]> = {
  'México': ['Lozano', 'Jiménez', 'Álvarez', 'Corona'],
  'Canadá': ['David', 'Davies', 'Buchanan', 'Larin'],
  'Austrália': ['Hrustic', 'Duke', 'Irvine', 'McGree'],
  'Japão': ['Mitoma', 'Kubo', 'Kamada', 'Doan'],
  'Coreia do Sul': ['Son', 'Hwang', 'Lee Kang-in', 'Cho'],
  'EUA': ['Pulisic', 'McKennie', 'Reyna', 'Weah'],
  'Alemanha': ['Gnabry', 'Havertz', 'Sané', 'Füllkrug'],
  'Espanha': ['Morata', 'Torres', 'Olmo', 'Williams'],
  'Holanda': ['Gakpo', 'Depay', 'Malen', 'Simons'],
  'Inglaterra': ['Rice', 'Palmer', 'Watkins', 'Gordon'],
  'França': ['Griezmann', 'Giroud', 'Thuram', 'Coman'],
  'Itália': ['Chiesa', 'Raspadori', 'Retegui', 'Zaniolo'],
  'Argentina': ['Álvarez', 'Di María', 'Lo Celso', 'Mac Allister'],
  'Brasil': ['Richarlison', 'Rodrygo', 'Paquetá', 'Martinelli'],
  'Portugal': ['B. Silva', 'Félix', 'Jota', 'Leão'],
}

interface MatchEvent {
  minuto: number
  equipe: 'nos' | 'adv'
  jogador: string
}

function gerarPlacar(passou: boolean, seed: number, escalacao: PlayerCard[], adversario: string) {
  const s = Math.abs(seed) % 1000

  // Placar
  let gols: number, golsAdv: number
  if (passou) {
    const opcoes = [[1,0],[2,0],[2,1],[3,1],[3,0],[3,2],[4,1],[1,0],[2,0]]
    const pick = opcoes[s % opcoes.length]
    gols = pick[0]; golsAdv = pick[1]
  } else {
    const opcoes = [[0,1],[0,2],[1,2],[1,3],[0,1],[0,3]]
    const pick = opcoes[s % opcoes.length]
    gols = pick[0]; golsAdv = pick[1]
  }

  // Nomes dos nossos jogadores (prioriza atacantes/meias)
  const nossosNomes = [
    ...escalacao.filter(p => p.posicao === 'ATA'),
    ...escalacao.filter(p => p.posicao === 'MEI'),
    ...escalacao.filter(p => p.posicao !== 'ATA' && p.posicao !== 'MEI'),
  ].map(p => p.apelido || p.nome)

  // Nomes adversários
  const advNomes = JOGADORES_ADV[adversario] ?? ['Jogador Adv.', 'Atacante Adv.', 'Meia Adv.']

  // Minutos
  const totalGols = gols + golsAdv
  const minutos = Array.from({ length: totalGols }, (_, i) =>
    5 + Math.floor(((s * (i + 1) * 7) % 85))
  ).sort((a, b) => a - b)

  // Eventos
  const eventos: MatchEvent[] = []
  let nossos = gols, deles = golsAdv
  for (let i = 0; i < totalGols; i++) {
    const isNosso = nossos > 0 && (deles === 0 || (s * (i + 3)) % (nossos + deles) < nossos)
    if (isNosso) {
      const nome = nossosNomes[(s + i) % nossosNomes.length] ?? 'Craque'
      eventos.push({ minuto: minutos[i], equipe: 'nos', jogador: nome })
      nossos--
    } else {
      const nome = advNomes[(s + i) % advNomes.length]
      eventos.push({ minuto: minutos[i], equipe: 'adv', jogador: nome })
      deles--
    }
  }

  return { gols, golsAdv, eventos }
}

type Phase = 'idle' | 'narrating' | 'scoreboard' | 'points' | 'done'

export function ScoreDisplay({ result, meta, tentativas, trocas, escalacao, adversario }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [placarNos, setPlacarNos] = useState(0)
  const [placarAdv, setPlacarAdv] = useState(0)
  const [animatedTotal, setAnimatedTotal] = useState(0)
  const [currentEvent, setCurrentEvent] = useState<MatchEvent | null>(null)
  const [pastEvents, setPastEvents] = useState<MatchEvent[]>([])
  const prevResult = useRef<ScoreResult | null>(null)

  const passou = result ? result.total >= meta : false

  useEffect(() => {
    if (!result || result === prevResult.current) return
    prevResult.current = result

    const { eventos } = gerarPlacar(passou, result.total + meta, escalacao ?? [], adversario ?? '')

    setPlacarNos(0)
    setPlacarAdv(0)
    setAnimatedTotal(0)
    setCurrentEvent(null)
    setPastEvents([])

    if (eventos.length === 0) {
      setPhase('scoreboard')
      setTimeout(() => { setPhase('points'); animatePoints(result.total) }, 1500)
      return
    }

    setPhase('narrating')
    let nos = 0, adv = 0

    eventos.forEach((ev, i) => {
      setTimeout(() => {
        if (ev.equipe === 'nos') nos++; else adv++
        setPlacarNos(nos)
        setPlacarAdv(adv)
        setCurrentEvent(ev)
        setPastEvents(prev => [...prev, ev])

        // Play goal sound
        if (ev.equipe === 'nos') sounds.gol()
        else sounds.golAdv()

        setTimeout(() => setCurrentEvent(null), 700)

        if (i === eventos.length - 1) {
          setTimeout(() => {
            setPhase('scoreboard')
            // Play victory/defeat sound
            if (passou) sounds.vitoria()
            else sounds.derrota()
            setTimeout(() => { setPhase('points'); animatePoints(result.total) }, 1800)
          }, 1200)
        }
      }, 1000 * (i + 1))
    })
  }, [result])

  function animatePoints(target: number) {
    const duration = 1200
    const start = performance.now()
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      setAnimatedTotal(Math.round((1 - Math.pow(1 - progress, 3)) * target))
      if (progress < 1) requestAnimationFrame(tick)
      else setPhase('done')
    }
    requestAnimationFrame(tick)
  }

  // === IDLE ===
  if (!result || phase === 'idle') {
    return (
      <div className="text-center py-2 md:py-3">
        <div className="text-gray-500" style={{ fontFamily: "'VT323',monospace", fontSize: 16 }}>META</div>
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

  // === NARRATING ===
  if (phase === 'narrating') {
    return (
      <div className="text-center py-3 md:py-4">
        <div className="inline-block bg-gray-900/90 border-2 border-gray-600 rounded-lg px-8 py-4 relative overflow-hidden"
          style={{ minWidth: 320, minHeight: 200 }}>
          {currentEvent && (
            <div className={`absolute inset-0 ${currentEvent.equipe === 'nos' ? 'bg-green-500/15' : 'bg-red-500/15'}`} />
          )}
          <div className="text-gray-500 text-xs mb-3" style={{ fontFamily: "'VT323',monospace" }}>AO VIVO</div>

          {/* Placar */}
          <div className="flex items-center justify-center gap-6 mb-3">
            <div className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: "'Press Start 2P',monospace" }}>
              {placarNos}
            </div>
            <div className="text-xl text-gray-600 font-black" style={{ fontFamily: "'Press Start 2P',monospace" }}>×</div>
            <div className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: "'Press Start 2P',monospace" }}>
              {placarAdv}
            </div>
          </div>

          {/* Evento atual */}
          <div className="h-10 flex items-center justify-center">
            {currentEvent && (
              <div className={`font-black ${currentEvent.equipe === 'nos' ? 'text-green-400' : 'text-red-400'}`}>
                <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: currentEvent.equipe === 'nos' ? 14 : 11 }}>
                  {currentEvent.equipe === 'nos' ? 'GOOOL!!!' : 'Gol adversario'}
                </span>
                <div className="text-xs mt-1" style={{ fontFamily: "'VT323',monospace", fontSize: 16 }}>
                  {currentEvent.minuto}' — {currentEvent.jogador}
                </div>
              </div>
            )}
          </div>

          {/* Lista de gols passados */}
          {pastEvents.length > 0 && !currentEvent && (
            <div className="mt-1 space-y-0.5">
              {pastEvents.map((ev, i) => (
                <div key={i} className={`text-xs ${ev.equipe === 'nos' ? 'text-green-400/60' : 'text-red-400/60'}`}
                  style={{ fontFamily: "'VT323',monospace", fontSize: 14 }}>
                  {ev.minuto}' {ev.jogador} {ev.equipe === 'nos' ? '⚽' : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // === SCOREBOARD ===
  if (phase === 'scoreboard') {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div className="panel" style={{ display: 'inline-block', padding: '24px 40px', minWidth: 360, border: '2px solid var(--gold)' }}>
          <div className="micro" style={{ fontSize: 14, color: 'var(--gold)', marginBottom: 16 }}>FIM DE JOGO</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <span className="val shadow-hard" style={{ fontSize: 72, color: 'var(--ink)' }}>{placarNos}</span>
            <span className="val" style={{ fontSize: 32, color: 'var(--ink-dim)' }}>×</span>
            <span className="val shadow-hard" style={{ fontSize: 72, color: 'var(--ink)' }}>{placarAdv}</span>
          </div>
          <div className="val shadow-hard" style={{
            fontSize: 28, marginTop: 12,
            color: passou ? 'var(--green)' : 'var(--pos-ata)',
          }}>
            {passou ? 'VITORIA!' : 'DERROTA'}
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {pastEvents.map((ev, i) => (
              <span key={i} className="val" style={{
                fontSize: 20, color: ev.equipe === 'nos' ? 'var(--green)' : 'var(--pos-ata)', opacity: 0.7,
              }}>
                {ev.minuto}' {ev.jogador}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // === POINTS / DONE ===
  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div className="panel" style={{ display: 'inline-block', padding: '20px 32px', minWidth: 340 }}>
        {/* Placar pequeno */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
          <span className="val shadow-hard" style={{ fontSize: 36, color: 'var(--ink)' }}>{placarNos}</span>
          <span className="val" style={{ fontSize: 20, color: 'var(--ink-dim)' }}>×</span>
          <span className="val shadow-hard" style={{ fontSize: 36, color: 'var(--ink)' }}>{placarAdv}</span>
          <span className="val" style={{
            fontSize: 22, marginLeft: 8,
            color: passou ? 'var(--green)' : 'var(--pos-ata)',
          }}>
            {passou ? 'VITORIA' : 'DERROTA'}
          </span>
        </div>

        {/* Meta */}
        <div style={{ marginBottom: 4 }}>
          <span className="micro" style={{ fontSize: 11 }}>META: </span>
          <span className="val" style={{ fontSize: 24, color: 'var(--ink-dim)' }}>{meta.toLocaleString()}</span>
        </div>

        {/* Score animado */}
        <div className="val shadow-hard" style={{
          fontSize: 56,
          color: passou ? 'var(--green)' : 'var(--pos-ata)',
        }}>
          {animatedTotal.toLocaleString()}
        </div>

        {phase === 'done' && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span className="val" style={{ fontSize: 24, color: 'var(--pos-mei)' }}>{result.base}</span>
              <span className="val" style={{ fontSize: 18, color: 'var(--ink-dim)' }}>×</span>
              <span className="val" style={{ fontSize: 24, color: 'var(--pos-ata)' }}>{result.mult.toFixed(1)}</span>
            </div>
            {result.combos.length > 0 && (
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 6 }}>
                {result.combos.map(c => (
                  <span key={c.id} className="postag" style={{ background: 'var(--panel-3)', fontSize: 10 }}>{c.nome}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
        <span className="micro" style={{ fontSize: 11 }}>Escalacoes: <span className="val" style={{ fontSize: 20, color: 'var(--ink)' }}>{tentativas}</span></span>
        <span className="micro" style={{ fontSize: 11 }}>Trocas: <span className="val" style={{ fontSize: 20, color: 'var(--ink)' }}>{trocas}</span></span>
      </div>
    </div>
  )
}
