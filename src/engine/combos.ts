import type { PlayerCard, Combo } from './types'

// Pares históricos famosos
const DUPLAS_HISTORICAS: Record<string, { par: [string, string]; nome: string; valor: number }> = {
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
