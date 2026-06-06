import type { PlayerCard, Twist, RngFn } from './types'
import { pickN } from './rng'

// Pool de twists disponíveis para partidas Clássico
const TWISTS: Twist[] = [
  {
    id: 'sem_seguidores',
    nome: 'Sem Hype',
    descricao: 'Seguidores não pontuam nesta partida',
  },
  {
    id: 'so_atacantes',
    nome: 'Só Atacantes',
    descricao: 'Apenas atacantes pontuam',
  },
  {
    id: 'so_meias',
    nome: 'Maestros',
    descricao: 'Apenas meias pontuam',
  },
  {
    id: 'inversao',
    nome: 'Inversão',
    descricao: 'Pontos dos tiers são invertidos (Fraco→100, Lendário→10)',
  },
  {
    id: 'sem_combos',
    nome: 'Solo',
    descricao: 'Combos não são ativados nesta partida',
  },
  {
    id: 'sem_boosts',
    nome: 'Fair Play',
    descricao: 'Boosts não funcionam nesta partida',
  },
]

/** Sorteia um twist para partida Clássico */
export function sortearTwist(rng: RngFn): Twist {
  return pickN(rng, TWISTS, 1)[0]
}

/**
 * Aplica o twist aos jogadores (modifica pontosNormalizados em cópia).
 * Retorna a escalação modificada.
 */
export function aplicarTwist(twist: Twist, escalacao: PlayerCard[], atributosAtivos: string[]): PlayerCard[] {
  switch (twist.id) {
    case 'sem_seguidores':
      return escalacao.map(p => ({
        ...p,
        pontosNormalizados: {
          ...p.pontosNormalizados,
          seguidores: 0,
        },
      }))

    case 'so_atacantes':
      return escalacao.map(p => {
        if (p.posicao !== 'ATA') {
          const zerado: Record<string, number> = {}
          for (const attr of atributosAtivos) zerado[attr] = 0
          return { ...p, pontosNormalizados: zerado }
        }
        return p
      })

    case 'so_meias':
      return escalacao.map(p => {
        if (p.posicao !== 'MEI') {
          const zerado: Record<string, number> = {}
          for (const attr of atributosAtivos) zerado[attr] = 0
          return { ...p, pontosNormalizados: zerado }
        }
        return p
      })

    case 'inversao':
      return escalacao.map(p => {
        const invertido: Record<string, number> = {}
        for (const attr of atributosAtivos) {
          const pts = p.pontosNormalizados?.[attr] ?? 0
          // 10↔100, 25↔75, 50 fica 50
          const inversaoMap: Record<number, number> = { 100: 10, 75: 25, 50: 50, 25: 75, 10: 100 }
          invertido[attr] = inversaoMap[pts] ?? pts
        }
        return { ...p, pontosNormalizados: invertido }
      })

    default:
      // sem_combos e sem_boosts são tratados no scoring
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
