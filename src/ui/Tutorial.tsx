import { useState } from 'react'

interface Props {
  onComplete: () => void
}

interface TutorialStep {
  titulo: string
  texto: string
  icone: string
  destaque?: string
}

const STEPS: TutorialStep[] = [
  {
    titulo: 'BEM-VINDO, TÉCNICO!',
    texto: 'Você é o técnico que vai montar o time dos sonhos e conquistar a Copa. Monte escalações, combine craques e bata a meta do adversário para avançar!',
    icone: '⚽',
  },
  {
    titulo: 'A ERA',
    texto: 'Cada run sorteia 3 ATRIBUTOS ATIVOS — a "Era". Numa Era de "Gols + Drible + Seguidores", jogadores artilheiros e famosos valem mais. Na próxima run, a Era muda e o jogo fica completamente diferente!',
    icone: '🎲',
    destaque: 'Os mesmos atributos valem para TODAS as cartas da run.',
  },
  {
    titulo: 'ESCALAÇÃO',
    texto: 'Você tem 8 cartas na mão. Escolha até 5 para escalar. Cada jogador pontua baseado nos atributos da Era — quanto melhor o tier (Lendário > Elite > Bom > Regular > Fraco), mais pontos.',
    icone: '🃏',
    destaque: 'Clique numa carta para escalar. Clique de novo para remover.',
  },
  {
    titulo: 'BASE × MULT',
    texto: 'Sua pontuação = BASE × MULTIPLICADOR. BASE é a soma dos pontos dos jogadores + combos + boosts aditivos. MULT começa em 1.0 e cresce com combos e boosts multiplicativos. A graça é equilibrar os dois!',
    icone: '💥',
    destaque: 'Um craque mediano com o boost certo pode explodir o MULT.',
  },
  {
    titulo: 'COMBOS',
    texto: 'Combine jogadores estrategicamente! 2+ do mesmo CLUBE = Conexão (+BASE). 3+ da mesma SELEÇÃO = Trinca (×MULT). Duplas históricas como Messi+Neymar dão bônus enormes. O painel de combos mostra o progresso em tempo real.',
    icone: '🔗',
  },
  {
    titulo: 'TROCAR',
    texto: 'Não gostou da mão? Use suas 3 TROCAS por partida: selecione cartas ruins, descarte e compre novas do baralho. Trocas não usadas dão bônus de orçamento!',
    icone: '🔄',
  },
  {
    titulo: 'A COPA',
    texto: 'A run é uma Copa com 5 fases: Grupos → Oitavas → Quartas → Semi → Final. Cada fase tem 3 partidas (2 normais + 1 CLÁSSICO com regra especial). A meta sobe a cada fase!',
    icone: '🏆',
    destaque: 'Clássicos têm twists como "Tiers Invertidos" ou "Sem Combos".',
  },
  {
    titulo: 'JANELA DE TRANSFERÊNCIAS',
    texto: 'Entre fases, abra PACOTINHOS DE FIGURINHA para adicionar craques e boosts ao elenco! Escolha entre pacotes de jogadores ou boosts. Cada pacote revela 3 cartas — escolha sua favorita.',
    icone: '📦',
    destaque: 'Lendas como Pelé e Maradona têm 20% de chance de aparecer!',
  },
  {
    titulo: 'BOOSTS',
    texto: 'Boosts são cartas permanentes que turbina sua escalação. Aditivos somam à BASE, multiplicativos aumentam o MULT. Você pode ter até 5 boosts ativos. Combine boosts com a Era e os combos para builds poderosas!',
    icone: '⚡',
  },
  {
    titulo: 'VAMOS JOGAR!',
    texto: 'Monte sua escalação, ative combos, bata a meta e conquiste a Copa. Cada run é diferente — nenhuma partida é igual. Boa sorte, técnico!',
    icone: '🎮',
  },
]

export function Tutorial({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="max-w-lg w-full bg-[#211d3d] border-2 border-[#ffd84d] rounded-lg overflow-hidden"
        style={{ boxShadow: '0 0 30px rgba(255,216,77,0.2)' }}>

        {/* Progress bar */}
        <div className="h-1 bg-[#3a3460]">
          <div className="h-full bg-[#ffd84d] transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 text-center">
          {/* Icon */}
          <div className="text-4xl md:text-6xl mb-3 md:mb-4">{current.icone}</div>

          {/* Title */}
          <h2 className="text-xl md:text-2xl font-black text-[#ffd84d] mb-3 md:mb-4"
            style={{ fontFamily: "'VT323',monospace", letterSpacing: 3 }}>
            {current.titulo}
          </h2>

          {/* Text */}
          <p className="text-[#e8e4f5] mb-4 leading-relaxed"
            style={{ fontFamily: "'VT323',monospace", fontSize: 20 }}>
            {current.texto}
          </p>

          {/* Highlight */}
          {current.destaque && (
            <div className="bg-[#ffd84d]/10 border border-[#ffd84d]/30 rounded-lg p-3 mb-4">
              <p className="text-[#ffd84d] text-sm"
                style={{ fontFamily: "'VT323',monospace", fontSize: 17 }}>
                {current.destaque}
              </p>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex justify-center gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === step ? 'bg-[#ffd84d] scale-125' : i < step ? 'bg-[#ffd84d]/40' : 'bg-[#3a3460]'
              }`} />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-4 py-2 text-[#b9b2e0] hover:text-white disabled:opacity-20 transition"
              style={{ fontFamily: "'VT323',monospace", fontSize: 18 }}
            >
              ← Anterior
            </button>

            {isLast ? (
              <button
                onClick={onComplete}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-lg"
                style={{ fontFamily: "'VT323',monospace", fontSize: 22 }}
              >
                COMEÇAR! →
              </button>
            ) : (
              <button
                onClick={() => setStep(s => s + 1)}
                className="px-6 py-2 bg-[#ffd84d] text-[#0d0b1f] rounded-lg font-bold transition-all hover:scale-105"
                style={{ fontFamily: "'VT323',monospace", fontSize: 20 }}
              >
                Próximo →
              </button>
            )}
          </div>

          {/* Skip */}
          {!isLast && (
            <button
              onClick={onComplete}
              className="mt-4 text-[#6b7280] text-sm hover:text-[#9ca3af] transition"
              style={{ fontFamily: "'VT323',monospace" }}
            >
              Pular tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
