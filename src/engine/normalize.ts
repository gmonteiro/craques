import type { PlayerCard, TierName } from './types'
import attributesData from '../../data/attributes.json'

const tiers = attributesData.tiers as Record<string, { percentil: number; pontos: number }>

// Tiers ordenados do maior percentil pro menor
const tierOrder: { name: TierName; percentil: number; pontos: number }[] = [
  { name: 'lendario', ...tiers.lendario },
  { name: 'elite', ...tiers.elite },
  { name: 'bom', ...tiers.bom },
  { name: 'regular', ...tiers.regular },
  { name: 'fraco', ...tiers.fraco },
]

/**
 * Calcula os thresholds (valores mínimos) para cada tier de um atributo,
 * baseado nos percentis sobre os valores reais do baralho.
 */
function calcThresholds(values: number[]): { tier: TierName; minValue: number; pontos: number }[] {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length

  return tierOrder.map(t => {
    const idx = Math.floor((t.percentil / 100) * n)
    const minValue = sorted[Math.min(idx, n - 1)]
    return { tier: t.name, minValue, pontos: t.pontos }
  })
}

/**
 * Determina o tier de um valor dado os thresholds.
 * Percorre do maior (lendario) pro menor (fraco).
 */
function getTier(value: number, thresholds: { tier: TierName; minValue: number; pontos: number }[]): { tier: TierName; pontos: number } {
  for (const t of thresholds) {
    if (value >= t.minValue) {
      return { tier: t.tier, pontos: t.pontos }
    }
  }
  return { tier: 'fraco', pontos: 10 }
}

/**
 * Normaliza todos os jogadores para os atributos ativos da run.
 * Calcula thresholds dinamicamente baseado no baralho inteiro.
 * Retorna os jogadores com `pontosNormalizados` e `tiersPorAtributo` preenchidos.
 */
export function normalizePlayers(players: PlayerCard[], activeAttributes: string[]): PlayerCard[] {
  // Calcular thresholds por atributo
  const thresholdsMap: Record<string, { tier: TierName; minValue: number; pontos: number }[]> = {}

  for (const attrId of activeAttributes) {
    const values = players.map(p => p.atributos[attrId] ?? 0)
    thresholdsMap[attrId] = calcThresholds(values)
  }

  // Normalizar cada jogador
  return players.map(player => {
    const pontosNormalizados: Record<string, number> = {}
    const tiersPorAtributo: Record<string, TierName> = {}

    for (const attrId of activeAttributes) {
      const rawValue = player.atributos[attrId] ?? 0
      const { tier, pontos } = getTier(rawValue, thresholdsMap[attrId])
      pontosNormalizados[attrId] = pontos
      tiersPorAtributo[attrId] = tier
    }

    return {
      ...player,
      pontosNormalizados,
      tiersPorAtributo,
    }
  })
}

/** Soma dos pontos normalizados de um jogador */
export function playerScore(player: PlayerCard): number {
  if (!player.pontosNormalizados) return 0
  return Object.values(player.pontosNormalizados).reduce((s, v) => s + v, 0)
}
