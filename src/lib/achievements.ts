import type { PlayerCard, ScoreResult } from '../engine/types'

export interface Achievement {
  id: string
  nome: string
  descricao: string
  icone: string
  check: (ctx: AchievementContext) => boolean
}

export interface AchievementContext {
  escalacao: PlayerCard[]
  result: ScoreResult | null
  combosAtivos: number
  fase: number
  won: boolean
  totalRuns: number
  totalWins: number
  unlockedPlayers: number
  unlockedBoosts: number
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win', nome: 'Primeira Vitória', descricao: 'Vença sua primeira partida',
    icone: '⚽', check: (c) => c.won,
  },
  {
    id: 'brasileiro', nome: 'Seleção Brasileira', descricao: 'Escale 5 brasileiros',
    icone: '🇧🇷', check: (c) => c.escalacao.filter(p => p.nacionalidade === 'BRASIL').length >= 5,
  },
  {
    id: 'combo_3', nome: 'Combo Master', descricao: 'Ative 3+ combos na mesma escalação',
    icone: '🔗', check: (c) => c.combosAtivos >= 3,
  },
  {
    id: 'score_3k', nome: 'Artilheiro', descricao: 'Faça 3.000+ pontos numa partida',
    icone: '🎯', check: (c) => (c.result?.total ?? 0) >= 3000,
  },
  {
    id: 'score_5k', nome: 'Goleada', descricao: 'Faça 5.000+ pontos numa partida',
    icone: '💥', check: (c) => (c.result?.total ?? 0) >= 5000,
  },
  {
    id: 'score_10k', nome: 'Lendário', descricao: 'Faça 10.000+ pontos numa partida',
    icone: '👑', check: (c) => (c.result?.total ?? 0) >= 10000,
  },
  {
    id: 'mult_5', nome: 'Multiplicador', descricao: 'Alcance multiplicador ×5 ou mais',
    icone: '✖️', check: (c) => (c.result?.mult ?? 0) >= 5,
  },
  {
    id: 'final', nome: 'Finalista', descricao: 'Chegue à Final',
    icone: '🏟️', check: (c) => c.fase >= 4,
  },
  {
    id: 'campeao', nome: 'Campeão!', descricao: 'Vença a Copa inteira',
    icone: '🏆', check: (c) => c.won && c.fase >= 4,
  },
  {
    id: 'colecionador_25', nome: 'Colecionador', descricao: 'Desbloqueie 25 jogadores',
    icone: '📦', check: (c) => c.unlockedPlayers >= 25,
  },
  {
    id: 'colecionador_50', nome: 'Mega Colecionador', descricao: 'Desbloqueie 50 jogadores',
    icone: '🌟', check: (c) => c.unlockedPlayers >= 50,
  },
  {
    id: 'all_boosts', nome: 'Arsenal Completo', descricao: 'Desbloqueie todos os 27 boosts',
    icone: '⚡', check: (c) => c.unlockedBoosts >= 27,
  },
  {
    id: 'veterano_10', nome: 'Veterano', descricao: 'Jogue 10 runs',
    icone: '🎮', check: (c) => c.totalRuns >= 10,
  },
  {
    id: 'vencedor_5', nome: 'Pentacampeão', descricao: 'Vença 5 runs',
    icone: '⭐', check: (c) => c.totalWins >= 5,
  },
  {
    id: 'europeu', nome: 'Liga dos Campeões', descricao: 'Escale 5 europeus (diferentes países)',
    icone: '🌍', check: (c) => {
      const europeus = ['FRANCA', 'ALEMANHA', 'ESPANHA', 'INGLATERRA', 'PORTUGAL', 'HOLANDA', 'BELGICA', 'CROACIA', 'POLONIA', 'NORUEGA', 'ITALIA']
      const paises = new Set(c.escalacao.filter(p => europeus.includes(p.nacionalidade)).map(p => p.nacionalidade))
      return paises.size >= 5
    },
  },
]

/** Check which achievements were just earned */
export function checkAchievements(ctx: AchievementContext, alreadyEarned: string[]): Achievement[] {
  const earned = new Set(alreadyEarned)
  return ACHIEVEMENTS.filter(a => !earned.has(a.id) && a.check(ctx))
}
