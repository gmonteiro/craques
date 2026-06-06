import type { PlayerCard, Twist, RngFn } from './types'
import { randomInt } from './rng'
import { getAttributeLabel } from './attributes'

/**
 * Sorteia um twist para partida Clássico.
 * Recebe os atributos ativos para gerar twists Era-aware.
 */
export function sortearTwist(rng: RngFn, atributosAtivos: string[]): Twist {
  // Pool de twists possíveis
  const pool: Twist[] = []

  // 1. Zera 1 atributo ativo (aleatório)
  if (atributosAtivos.length >= 2) {
    const idx = randomInt(rng, 0, atributosAtivos.length - 1)
    const attr = atributosAtivos[idx]
    pool.push({
      id: 'sem_atributo',
      nome: 'Bloqueio',
      descricao: `${getAttributeLabel(attr)} não pontua nesta partida`,
      dados: { atributo: attr },
    })
  }

  // 2. Inversão de tiers
  pool.push({
    id: 'inversao',
    nome: 'Inversão',
    descricao: 'Tiers invertidos — Fraco vira 100, Lendário vira 10',
  })

  // 3. Sem combos
  pool.push({
    id: 'sem_combos',
    nome: 'Solo',
    descricao: 'Combos não ativam nesta partida',
  })

  // 4. Sem boosts
  pool.push({
    id: 'sem_boosts',
    nome: 'Fair Play',
    descricao: 'Boosts não funcionam nesta partida',
  })

  // 5. Meta blindada (+50%)
  pool.push({
    id: 'meta_blindada',
    nome: 'Meta Blindada',
    descricao: 'Meta do adversário +50% nesta partida',
  })

  // 6. Mão curta (menos cartas)
  pool.push({
    id: 'mao_curta',
    nome: 'Mão Curta',
    descricao: 'Você começa com apenas 5 cartas na mão',
  })

  // 7. Apenas 1 posição pontua com bonus, resto pontua metade
  const posicoes = ['ATA', 'MEI', 'ZAG']
  const posIdx = randomInt(rng, 0, posicoes.length - 1)
  const posDestaque = posicoes[posIdx]
  const posNomes: Record<string, string> = { ATA: 'Atacantes', MEI: 'Meias', ZAG: 'Defensores' }
  pool.push({
    id: 'destaque_posicao',
    nome: `Brilho ${posNomes[posDestaque]}`,
    descricao: `${posNomes[posDestaque]} pontuam dobrado, demais pontuam metade`,
    dados: { posicao: posDestaque },
  })

  // Sortear 1 do pool
  const chosen = randomInt(rng, 0, pool.length - 1)
  return pool[chosen]
}

/**
 * Aplica o twist aos jogadores (modifica pontosNormalizados em cópia).
 */
export function aplicarTwist(twist: Twist, escalacao: PlayerCard[], atributosAtivos: string[]): PlayerCard[] {
  switch (twist.id) {
    case 'sem_atributo': {
      const attr = twist.dados?.atributo
      if (!attr) return escalacao
      return escalacao.map(p => ({
        ...p,
        pontosNormalizados: { ...p.pontosNormalizados, [attr]: 0 },
      }))
    }

    case 'inversao':
      return escalacao.map(p => {
        const invertido: Record<string, number> = {}
        const inversaoMap: Record<number, number> = { 100: 10, 75: 25, 50: 50, 25: 75, 10: 100 }
        for (const attr of atributosAtivos) {
          const pts = p.pontosNormalizados?.[attr] ?? 0
          invertido[attr] = inversaoMap[pts] ?? pts
        }
        return { ...p, pontosNormalizados: invertido }
      })

    case 'destaque_posicao': {
      const pos = twist.dados?.posicao
      if (!pos) return escalacao
      return escalacao.map(p => {
        const multiplicador = p.posicao === pos ? 2 : 0.5
        const ajustado: Record<string, number> = {}
        for (const attr of atributosAtivos) {
          ajustado[attr] = Math.round((p.pontosNormalizados?.[attr] ?? 0) * multiplicador)
        }
        return { ...p, pontosNormalizados: ajustado }
      })
    }

    default:
      // sem_combos, sem_boosts, meta_blindada, mao_curta → tratados no run.ts
      return escalacao
  }
}

/** Checa se combos devem ser desativados pelo twist */
export function twistDesativaCombos(twist: Twist | null): boolean {
  return twist?.id === 'sem_combos'
}

/** Checa se boosts devem ser desativados pelo twist */
export function twistDesativaBoosts(twist: Twist | null): boolean {
  return twist?.id === 'sem_boosts'
}
