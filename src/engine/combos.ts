import type { PlayerCard, Combo } from './types'

export interface ComboProgress {
  id: string
  nome: string
  tipo: 'base' | 'mult'
  descricao: string
  bonusLabel: string
  progresso: number // 0-1
  atual: number
  necessario: number
  ativo: boolean
}

// Pares históricos famosos
export const DUPLAS_HISTORICAS: Record<string, { par: [string, string]; nome: string; valor: number }> = {
  'messi_neymar': { par: ['messi', 'neymar'], nome: 'MSN', valor: 3 },
  'cr7_benzema': { par: ['cr7', 'benzema'], nome: 'BBC', valor: 3 },
  'messi_suarez': { par: ['messi', 'suarez'], nome: 'Tridente', valor: 2.5 },
  'vinicius_mbappe': { par: ['vinicius', 'mbappe'], nome: 'Velocidade Pura', valor: 2 },
  'vinicius_bellingham': { par: ['vinicius', 'bellingham'], nome: 'Nova Era Madrid', valor: 2 },
  'modric_kroos': { par: ['modric', 'kroos'], nome: 'Meio Galáctico', valor: 2.5 },
  'debruyne_haaland': { par: ['debruyne', 'haaland'], nome: 'Conexão City', valor: 2 },
  'neymar_vinicius': { par: ['neymar', 'vinicius'], nome: 'Joga Bonito', valor: 2 },
}

// Combos posicionais para 5 jogadores
const COMBOS_POSICAO = [
  { id: 'equilibrio', nome: 'Equilíbrio Tático', tipo: 'mult' as const, valor: 1.5,
    descricao: 'ATA + MEI + defensor', check: (pos: Map<string, number>) => {
      const temAta = (pos.get('ATA') ?? 0) >= 1
      const temMei = (pos.get('MEI') ?? 0) >= 1
      const temDef = ((pos.get('ZAG') ?? 0) + (pos.get('LAT') ?? 0) + (pos.get('GOL') ?? 0)) >= 1
      return temAta && temMei && temDef
    }},
  { id: 'ataque_total', nome: 'Ataque Total', tipo: 'mult' as const, valor: 2,
    descricao: '4+ atacantes', check: (pos: Map<string, number>) => (pos.get('ATA') ?? 0) >= 4 },
  { id: 'paredao', nome: 'Paredão', tipo: 'base' as const, valor: 100,
    descricao: 'GOL + 2 ZAG/LAT', check: (pos: Map<string, number>) => {
      const temGol = (pos.get('GOL') ?? 0) >= 1
      const temDef = ((pos.get('ZAG') ?? 0) + (pos.get('LAT') ?? 0)) >= 2
      return temGol && temDef
    }},
  { id: 'misto', nome: 'Elenco Misto', tipo: 'mult' as const, valor: 1.3,
    descricao: '4+ posições diferentes', check: (_pos: Map<string, number>, escalacao: PlayerCard[]) => {
      const posicoes = new Set(escalacao.map(p => p.posicao))
      return posicoes.size >= 4
    }},
  { id: 'goleiros', nome: 'Parede de Luvas', tipo: 'mult' as const, valor: 5,
    descricao: '5 goleiros escalados', check: (pos: Map<string, number>) => (pos.get('GOL') ?? 0) >= 5 },
]

/** Conta ocorrências de um campo nos jogadores */
function countBy<K extends keyof PlayerCard>(players: PlayerCard[], key: K): Map<string, number> {
  const counts = new Map<string, number>()
  for (const p of players) {
    const val = String(p[key])
    counts.set(val, (counts.get(val) ?? 0) + 1)
  }
  return counts
}

/**
 * Detecta todos os combos ativos numa escalação.
 */
export function detectCombos(escalacao: PlayerCard[]): Combo[] {
  const combos: Combo[] = []

  if (escalacao.length === 0) return combos

  // Conexão de Clube: 2+ do mesmo clube
  const clubeCounts = countBy(escalacao, 'clube')
  for (const [clube, count] of clubeCounts) {
    if (count >= 2) {
      combos.push({
        id: `clube_${clube}`,
        nome: `Conexão ${clube}`,
        tipo: 'base',
        valor: 25 * count,
        descricao: `${count} jogadores do ${clube}`,
      })
    }
  }

  // Trinca de Seleção: 3+ da mesma nacionalidade
  const nacCounts = countBy(escalacao, 'nacionalidade')
  for (const [nac, count] of nacCounts) {
    if (count >= 3) {
      combos.push({
        id: `selecao_${nac}`,
        nome: `Seleção ${nac}`,
        tipo: 'mult',
        valor: 1.5 + (count - 3) * 0.5,
        descricao: `${count} jogadores da ${nac}`,
      })
    }
  }

  // Setor Forte: 3+ da mesma posição
  const posCounts = countBy(escalacao, 'posicao')
  for (const [pos, count] of posCounts) {
    if (count >= 3) {
      combos.push({
        id: `setor_${pos}`,
        nome: `Setor ${pos} Forte`,
        tipo: 'base',
        valor: 30 * count,
        descricao: `${count} jogadores na posição ${pos}`,
      })
    }
  }

  // Dupla Histórica
  const ids = new Set(escalacao.map(p => p.id))
  for (const [key, dupla] of Object.entries(DUPLAS_HISTORICAS)) {
    if (ids.has(dupla.par[0]) && ids.has(dupla.par[1])) {
      combos.push({
        id: `dupla_${key}`,
        nome: dupla.nome,
        tipo: 'mult',
        valor: dupla.valor,
        descricao: `Dupla histórica ativada!`,
      })
    }
  }

  // Combos posicionais (substituem formações)
  for (const combo of COMBOS_POSICAO) {
    if (combo.check(posCounts, escalacao)) {
      combos.push({
        id: combo.id,
        nome: combo.nome,
        tipo: combo.tipo,
        valor: combo.valor,
        descricao: combo.descricao,
      })
    }
  }

  return combos
}

/**
 * Para cada carta na mão, calcula quantos combos NOVOS ela ativaria se escalada.
 * Retorna um Map<playerId, number> com a contagem.
 */
export function getComboHighlights(escalacao: PlayerCard[], mao: PlayerCard[]): Map<string, number> {
  const currentCombos = detectCombos(escalacao)
  const currentIds = new Set(currentCombos.map(c => c.id))
  const highlights = new Map<string, number>()

  for (const card of mao) {
    if (escalacao.some(e => e.id === card.id)) continue
    const simulated = [...escalacao, card]
    const newCombos = detectCombos(simulated)
    const newCount = newCombos.filter(c => !currentIds.has(c.id)).length
    if (newCount > 0) {
      highlights.set(card.id, newCount)
    }
  }

  return highlights
}

/**
 * Retorna o progresso de todos os combos possíveis dada a escalação + mão.
 * Mostra quais estão ativos, quais estão perto, e quais são possíveis.
 */
export function getComboProgress(escalacao: PlayerCard[], mao: PlayerCard[]): ComboProgress[] {
  const todos = [...escalacao, ...mao]
  const progress: ComboProgress[] = []

  // --- Conexão de Clube ---
  // Mostrar clubes que têm 2+ jogadores no total (escalação + mão)
  const clubeCountsTodos = countBy(todos, 'clube')
  const clubeCountsEsc = countBy(escalacao, 'clube')
  for (const [clube, totalCount] of clubeCountsTodos) {
    if (totalCount >= 2) {
      const escCount = clubeCountsEsc.get(clube) ?? 0
      const necessario = 2
      const ativo = escCount >= necessario
      progress.push({
        id: `clube_${clube}`,
        nome: `Conexão ${clube}`,
        tipo: 'base',
        descricao: `2+ do ${clube}`,
        bonusLabel: ativo ? `+${25 * escCount} BASE` : `+BASE`,
        progresso: Math.min(escCount / necessario, 1),
        atual: escCount,
        necessario,
        ativo,
      })
    }
  }

  // --- Trinca de Seleção ---
  const nacCountsTodos = countBy(todos, 'nacionalidade')
  const nacCountsEsc = countBy(escalacao, 'nacionalidade')
  for (const [nac, totalCount] of nacCountsTodos) {
    if (totalCount >= 2) {
      const escCount = nacCountsEsc.get(nac) ?? 0
      const necessario = 3
      const ativo = escCount >= necessario
      progress.push({
        id: `selecao_${nac}`,
        nome: `Seleção ${nac}`,
        tipo: 'mult',
        descricao: `3+ da ${nac}`,
        bonusLabel: ativo ? `×${(1.5 + (escCount - 3) * 0.5).toFixed(1)} MULT` : `×MULT`,
        progresso: Math.min(escCount / necessario, 1),
        atual: escCount,
        necessario,
        ativo,
      })
    }
  }

  // --- Setor Forte ---
  const posCountsTodos = countBy(todos, 'posicao')
  const posCountsEsc = countBy(escalacao, 'posicao')
  for (const [pos, totalCount] of posCountsTodos) {
    if (totalCount >= 2) {
      const escCount = posCountsEsc.get(pos) ?? 0
      const necessario = 3
      const ativo = escCount >= necessario
      progress.push({
        id: `setor_${pos}`,
        nome: `Setor ${pos} Forte`,
        tipo: 'base',
        descricao: `3+ na posição ${pos}`,
        bonusLabel: ativo ? `+${30 * escCount} BASE` : `+BASE`,
        progresso: Math.min(escCount / necessario, 1),
        atual: escCount,
        necessario,
        ativo,
      })
    }
  }

  // --- Duplas Históricas ---
  const idsEsc = new Set(escalacao.map(p => p.id))
  const idsTodos = new Set(todos.map(p => p.id))
  for (const [key, dupla] of Object.entries(DUPLAS_HISTORICAS)) {
    const temAmbos = idsTodos.has(dupla.par[0]) && idsTodos.has(dupla.par[1])
    const temUm = idsTodos.has(dupla.par[0]) || idsTodos.has(dupla.par[1])
    if (!temUm) continue

    const escAmbos = idsEsc.has(dupla.par[0]) && idsEsc.has(dupla.par[1])
    const escCount = (idsEsc.has(dupla.par[0]) ? 1 : 0) + (idsEsc.has(dupla.par[1]) ? 1 : 0)

    if (temAmbos || escCount > 0) {
      progress.push({
        id: `dupla_${key}`,
        nome: dupla.nome,
        tipo: 'mult',
        descricao: `${dupla.par[0]} + ${dupla.par[1]}`,
        bonusLabel: escAmbos ? `×${dupla.valor} MULT` : `×MULT`,
        progresso: escCount / 2,
        atual: escCount,
        necessario: 2,
        ativo: escAmbos,
      })
    }
  }

  // --- Combos posicionais ---
  const posCountsEscMap = countBy(escalacao, 'posicao')
  for (const combo of COMBOS_POSICAO) {
    const ativo = escalacao.length > 0 && combo.check(posCountsEscMap, escalacao)

    // Estimar progresso
    let progresso = 0
    let atual = 0
    let necessario = 1

    if (combo.id === 'equilibrio') {
      const temAta = (posCountsEscMap.get('ATA') ?? 0) >= 1 ? 1 : 0
      const temMei = (posCountsEscMap.get('MEI') ?? 0) >= 1 ? 1 : 0
      const temDef = ((posCountsEscMap.get('ZAG') ?? 0) + (posCountsEscMap.get('LAT') ?? 0) + (posCountsEscMap.get('GOL') ?? 0)) >= 1 ? 1 : 0
      atual = temAta + temMei + temDef
      necessario = 3
    } else if (combo.id === 'ataque_total') {
      atual = posCountsEscMap.get('ATA') ?? 0
      necessario = 4
    } else if (combo.id === 'paredao') {
      const temGol = Math.min(posCountsEscMap.get('GOL') ?? 0, 1)
      const temDef = Math.min((posCountsEscMap.get('ZAG') ?? 0) + (posCountsEscMap.get('LAT') ?? 0), 2)
      atual = temGol + temDef
      necessario = 3
    } else if (combo.id === 'misto') {
      const posicoes = new Set(escalacao.map(p => p.posicao))
      atual = posicoes.size
      necessario = 4
    }

    progresso = necessario > 0 ? Math.min(atual / necessario, 1) : 0

    progress.push({
      id: combo.id,
      nome: combo.nome,
      tipo: combo.tipo,
      descricao: combo.descricao,
      bonusLabel: ativo
        ? combo.tipo === 'mult' ? `×${combo.valor} MULT` : `+${combo.valor} BASE`
        : combo.tipo === 'mult' ? `×MULT` : `+BASE`,
      progresso,
      atual,
      necessario,
      ativo,
    })
  }

  // Ordenar: ativos primeiro, depois por progresso
  progress.sort((a, b) => {
    if (a.ativo !== b.ativo) return a.ativo ? -1 : 1
    return b.progresso - a.progresso
  })

  return progress
}
