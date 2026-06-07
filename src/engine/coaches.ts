/**
 * CRAQUES — Sistema de Técnicos
 * 10 treinadores com buff + debuff únicos que modificam a run
 */

export interface Coach {
  id: string
  nome: string
  pais: string
  estilo: string
  suit: string
  buff: { descricao: string; tipo: string; valor: number }
  debuff: { descricao: string; tipo: string; valor: number }
}

export const COACHES: Coach[] = [
  {
    id: 'guardiola',
    nome: 'GUARDIOLA',
    pais: 'ESPANHA',
    estilo: 'Posse de bola',
    suit: '#1d2733',
    buff: { descricao: '+0.5 MULT por meia escalado', tipo: 'mult_per_pos', valor: 0.5 },
    debuff: { descricao: '-1 troca por partida', tipo: 'trocas', valor: -1 },
  },
  {
    id: 'mourinho',
    nome: 'MOURINHO',
    pais: 'PORTUGAL',
    estilo: 'Contra-ataque',
    suit: '#23262b',
    buff: { descricao: 'Meta do adversário -15%', tipo: 'meta_reduce', valor: 0.15 },
    debuff: { descricao: '-1 escalação por partida', tipo: 'tentativas', valor: -1 },
  },
  {
    id: 'ancelotti',
    nome: 'ANCELOTTI',
    pais: 'ITÁLIA',
    estilo: 'Equilíbrio tático',
    suit: '#2a2f25',
    buff: { descricao: '+$3 orçamento inicial', tipo: 'orcamento', valor: 3 },
    debuff: { descricao: 'Sem lendas na loja', tipo: 'sem_lendas', valor: 1 },
  },
  {
    id: 'klopp',
    nome: 'KLOPP',
    pais: 'ALEMANHA',
    estilo: 'Pressing total',
    suit: '#2b2320',
    buff: { descricao: '+50 BASE por atacante escalado', tipo: 'base_per_pos', valor: 50 },
    debuff: { descricao: 'Zagueiros pontuam metade', tipo: 'pos_half', valor: 0.5 },
  },
  {
    id: 'bielsa',
    nome: 'BIELSA',
    pais: 'ARGENTINA',
    estilo: 'Intensidade máxima',
    suit: '#26303a',
    buff: { descricao: 'MULT base começa em 1.5', tipo: 'mult_base', valor: 1.5 },
    debuff: { descricao: 'Apenas 3 escalações (não 4)', tipo: 'tentativas', valor: -1 },
  },
  {
    id: 'tite',
    nome: 'TITE',
    pais: 'BRASIL',
    estilo: 'Organização',
    suit: '#1f2a33',
    buff: { descricao: '+30 BASE por brasileiro escalado', tipo: 'base_per_nac', valor: 30 },
    debuff: { descricao: 'Combo de clube não ativa', tipo: 'sem_combo_clube', valor: 1 },
  },
  {
    id: 'zidane_coach',
    nome: 'ZIDANE',
    pais: 'FRANÇA',
    estilo: 'Galácticos',
    suit: '#22242a',
    buff: { descricao: 'Lenda garantida na 1ª loja', tipo: 'lenda_garantida', valor: 1 },
    debuff: { descricao: 'Orçamento inicial $2 (não $4)', tipo: 'orcamento', valor: -2 },
  },
  {
    id: 'simeone',
    nome: 'SIMEONE',
    pais: 'ARGENTINA',
    estilo: 'Raça e garra',
    suit: '#202428',
    buff: { descricao: '+1 troca extra por partida', tipo: 'trocas', valor: 1 },
    debuff: { descricao: 'MULT máximo limitado a 3.0', tipo: 'mult_cap', valor: 3 },
  },
  {
    id: 'flick',
    nome: 'FLICK',
    pais: 'ALEMANHA',
    estilo: 'Linha alta',
    suit: '#2a2d33',
    buff: { descricao: '+2 cartas na mão inicial', tipo: 'mao_extra', valor: 2 },
    debuff: { descricao: 'Meta +10% em todas partidas', tipo: 'meta_increase', valor: 0.1 },
  },
  {
    id: 'scaloni',
    nome: 'SCALONI',
    pais: 'ARGENTINA',
    estilo: 'União do grupo',
    suit: '#1d2a36',
    buff: { descricao: 'Combo de seleção ativa com 2 (não 3)', tipo: 'combo_selecao_2', valor: 2 },
    debuff: { descricao: 'Baralho inicial com 10 cartas (não 12)', tipo: 'baralho', valor: -2 },
  },
]

/** Aplica buffs/debuffs do técnico nos parâmetros iniciais da run */
export function applyCoachBuffs(coach: Coach, params: {
  orcamento: number
  tentativas: number
  trocas: number
  tamanhoMao: number
  tamanhoBaralho: number
  metaMultiplier: number
}): typeof params {
  const p = { ...params }

  // Buff
  switch (coach.buff.tipo) {
    case 'orcamento': p.orcamento += coach.buff.valor; break
    case 'mao_extra': p.tamanhoMao += coach.buff.valor; break
  }

  // Debuff
  switch (coach.debuff.tipo) {
    case 'trocas': p.trocas += coach.debuff.valor; break
    case 'tentativas': p.tentativas += coach.debuff.valor; break
    case 'orcamento': p.orcamento += coach.debuff.valor; break
    case 'baralho': p.tamanhoBaralho += coach.debuff.valor; break
    case 'meta_increase': p.metaMultiplier += coach.debuff.valor; break
  }

  // Buff trocas
  if (coach.buff.tipo === 'trocas') p.trocas += coach.buff.valor

  // Clamp minimums
  p.orcamento = Math.max(1, p.orcamento)
  p.tentativas = Math.max(2, p.tentativas)
  p.trocas = Math.max(1, p.trocas)
  p.tamanhoMao = Math.max(5, p.tamanhoMao)
  p.tamanhoBaralho = Math.max(8, p.tamanhoBaralho)

  return p
}
