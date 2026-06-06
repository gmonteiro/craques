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

// Formações válidas: { posições necessárias }
const FORMACOES: Record<string, Record<string, number>> = {
  '4-3-3': { GOL: 0, ZAG: 2, LAT: 0, MEI: 1, ATA: 2 },
  '4-4-2': { GOL: 0, ZAG: 2, LAT: 0, MEI: 2, ATA: 1 },
  '3-5-2': { GOL: 0, ZAG: 1, LAT: 1, MEI: 1, ATA: 2 },
  '5-3-2': { GOL: 0, ZAG: 2, LAT: 1, MEI: 1, ATA: 1 },
}

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

  // Formação Válida: verifica se escalação encaixa num esquema tático
  for (const [formacao, reqs] of Object.entries(FORMACOES)) {
    let valida = true
    for (const [pos, min] of Object.entries(reqs)) {
      if ((posCounts.get(pos) ?? 0) < min) {
        valida = false
        break
      }
    }
    if (valida) {
      combos.push({
        id: `formacao_${formacao}`,
        nome: `Formação ${formacao}`,
        tipo: 'mult',
        valor: 1.5,
        descricao: `Escalação válida no ${formacao}`,
      })
      break // Só conta a primeira formação válida
    }
  }

  return combos
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

  // --- Formações ---
  for (const [formacao, reqs] of Object.entries(FORMACOES)) {
    let totalReq = 0
    let totalMet = 0
    for (const [pos, min] of Object.entries(reqs)) {
      if (min === 0) continue
      totalReq += min
      totalMet += Math.min(posCountsEsc.get(pos) ?? 0, min)
    }
    if (totalReq > 0) {
      progress.push({
        id: `formacao_${formacao}`,
        nome: `Formação ${formacao}`,
        tipo: 'mult',
        descricao: Object.entries(reqs).filter(([, v]) => v > 0).map(([k, v]) => `${v}${k}`).join(' '),
        bonusLabel: totalMet >= totalReq ? `×1.5 MULT` : `×MULT`,
        progresso: totalMet / totalReq,
        atual: totalMet,
        necessario: totalReq,
        ativo: totalMet >= totalReq,
      })
    }
  }

  // Ordenar: ativos primeiro, depois por progresso
  progress.sort((a, b) => {
    if (a.ativo !== b.ativo) return a.ativo ? -1 : 1
    return b.progresso - a.progresso
  })

  return progress
}
