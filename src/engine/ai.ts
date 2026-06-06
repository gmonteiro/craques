import type { RngFn } from './types'
import config from '../../data/config.json'

const { metaBase, metaCrescimento, metaVariacao, classicoMetaBonus } = config.run

// Times adversários por fase (flavor text)
const ADVERSARIOS = [
  ['México', 'Canadá', 'Austrália'],
  ['Japão', 'Coreia do Sul', 'EUA'],
  ['Alemanha', 'Espanha', 'Holanda'],
  ['Inglaterra', 'França', 'Itália'],
  ['Argentina', 'Brasil', 'Portugal'],
]

export interface MetaInfo {
  valor: number
  adversario: string
  isClassico: boolean
}

/**
 * Gera a meta (score a bater) para uma partida.
 * fase: 0-4, partida: 0-2, a 3ª partida (idx 2) é o Clássico.
 */
export function gerarMeta(fase: number, partida: number, rng: RngFn): MetaInfo {
  const isClassico = partida === 2

  // Meta base × crescimento exponencial por fase
  let valor = metaBase * Math.pow(metaCrescimento, fase)

  // Clássico: meta +30%
  if (isClassico) {
    valor *= (1 + classicoMetaBonus)
  }

  // Variação aleatória ±10%
  const variacao = 1 + (rng() * 2 - 1) * metaVariacao
  valor = Math.round(valor * variacao)

  // Adversário
  const faseAdversarios = ADVERSARIOS[Math.min(fase, ADVERSARIOS.length - 1)]
  const adversario = faseAdversarios[Math.min(partida, faseAdversarios.length - 1)]

  return { valor, adversario, isClassico }
}
