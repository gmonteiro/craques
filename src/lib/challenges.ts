/**
 * Desafios semanais temáticos — muda o meta-game toda semana
 */

export interface WeeklyChallenge {
  id: string
  nome: string
  descricao: string
  seed: number
  restricao?: {
    tipo: 'nacionalidade' | 'posicao' | 'clube'
    valores: string[]
    label: string
  }
}

/** Gera o desafio da semana atual baseado na data */
export function getWeeklyChallenge(): WeeklyChallenge {
  const now = new Date()
  const weekNum = Math.floor((now.getTime() - new Date(2026, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
  const seed = 2026000 + weekNum

  const challenges: Omit<WeeklyChallenge, 'seed'>[] = [
    {
      id: 'europeu',
      nome: 'Liga Europeia',
      descricao: 'Apenas jogadores de selecoes europeias',
      restricao: {
        tipo: 'nacionalidade',
        valores: ['FRANCA', 'ALEMANHA', 'ESPANHA', 'INGLATERRA', 'PORTUGAL', 'HOLANDA', 'BELGICA', 'CROACIA', 'POLONIA', 'NORUEGA', 'ITALIA'],
        label: 'Europeus',
      },
    },
    {
      id: 'sulamericano',
      nome: 'Copa America',
      descricao: 'Apenas jogadores sul-americanos',
      restricao: {
        tipo: 'nacionalidade',
        valores: ['BRASIL', 'ARGENTINA', 'URUGUAI', 'COLOMBIA'],
        label: 'Sul-americanos',
      },
    },
    {
      id: 'atacantes',
      nome: 'Festival de Gols',
      descricao: 'Apenas atacantes no baralho',
      restricao: { tipo: 'posicao', valores: ['ATA'], label: 'Atacantes' },
    },
    {
      id: 'defesa',
      nome: 'Fortaleza',
      descricao: 'Apenas defensores e goleiros',
      restricao: { tipo: 'posicao', valores: ['ZAG', 'LAT', 'GOL'], label: 'Defensores' },
    },
    {
      id: 'laliga',
      nome: 'La Liga',
      descricao: 'Apenas jogadores de Barcelona e Real Madrid',
      restricao: {
        tipo: 'clube',
        valores: ['BARCELONA', 'REAL MADRID'],
        label: 'La Liga',
      },
    },
    {
      id: 'premier',
      nome: 'Premier League',
      descricao: 'Apenas jogadores de clubes ingleses',
      restricao: {
        tipo: 'clube',
        valores: ['LIVERPOOL', 'MAN CITY', 'MAN UTD', 'ARSENAL', 'TOTTENHAM', 'CHELSEA'],
        label: 'Premier League',
      },
    },
    {
      id: 'livre',
      nome: 'Semana Livre',
      descricao: 'Sem restricoes — vale tudo!',
    },
  ]

  const pick = challenges[weekNum % challenges.length]
  return { ...pick, seed }
}
