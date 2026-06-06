import type { PlayerCard, BoostCard, ScoreResult, ScoreDetalhe } from './types'
import { detectCombos } from './combos'
import { playerScore } from './normalize'

/**
 * Aplica boosts aditivos e retorna o total de BASE extra.
 */
function aplicarBoostsBase(boosts: BoostCard[], escalacao: PlayerCard[], atributosAtivos: string[], maoSize: number): number {
  let extra = 0

  for (const boost of boosts) {
    const ef = boost.efeito
    switch (ef.tipo) {
      case 'base_per_any_legendary': {
        // +valor por jogador com QUALQUER atributo ativo em Lendário
        for (const p of escalacao) {
          const temLendario = atributosAtivos.some(attr => p.tiersPorAtributo?.[attr] === 'lendario')
          if (temLendario) extra += ef.valor as number
        }
        break
      }
      case 'base_triple_best': {
        // Triplica o melhor atributo ativo do jogador com maior pontuação
        if (escalacao.length === 0) break
        const melhor = escalacao.reduce((best, p) => playerScore(p) > playerScore(best) ? p : best, escalacao[0])
        if (melhor?.pontosNormalizados) {
          let maxPts = 0
          for (const attr of atributosAtivos) {
            maxPts = Math.max(maxPts, melhor.pontosNormalizados[attr] ?? 0)
          }
          extra += maxPts * ((ef.valor as number) - 1)
        }
        break
      }
      case 'base_flat_posicao': {
        // +valor se houver jogador da posição
        const pos = ef.posicao as string
        if (escalacao.some(p => p.posicao === pos)) {
          extra += ef.valor as number
        }
        break
      }
      case 'base_per_nacionalidade': {
        const nac = ef.nacionalidade as string
        const count = escalacao.filter(p => p.nacionalidade === nac).length
        extra += count * (ef.valor as number)
        break
      }
      case 'base_if_raridade': {
        const rar = ef.raridade as string
        if (escalacao.some(p => p.raridade === rar)) {
          extra += ef.valor as number
        }
        break
      }
      case 'base_per_bench': {
        // +valor por carta na mão (não escalada)
        extra += maoSize * (ef.valor as number)
        break
      }
      case 'base_per_unique_position': {
        const posicoes = new Set(escalacao.map(p => p.posicao))
        extra += posicoes.size * (ef.valor as number)
        break
      }
      case 'base_per_high_market': {
        const threshold = ef.threshold as number
        for (const p of escalacao) {
          if ((p.atributos.valorMercado ?? 0) >= threshold) {
            extra += ef.valor as number
          }
        }
        break
      }
      // === TARGETED boosts ===
      case 'flat_bonus_player': {
        // +valor fixo ao jogador alvo
        if (boost.targetPlayerId && escalacao.some(p => p.id === boost.targetPlayerId)) {
          extra += ef.valor as number
        }
        break
      }
      case 'tier_up_all': {
        // Sobe tiers do jogador alvo (simulado como +25 por atributo)
        if (boost.targetPlayerId && escalacao.some(p => p.id === boost.targetPlayerId)) {
          extra += atributosAtivos.length * 25
        }
        break
      }
      case 'double_player': {
        // Dobra pontos do jogador alvo
        if (boost.targetPlayerId) {
          const target = escalacao.find(p => p.id === boost.targetPlayerId)
          if (target) {
            extra += playerScore(target) // adiciona o score dele de novo = dobra
          }
        }
        break
      }
    }
  }

  return extra
}

/**
 * Aplica boosts multiplicativos e retorna o MULT total.
 */
function aplicarBoostsMult(boosts: BoostCard[], escalacao: PlayerCard[], atributosAtivos: string[], baseFinal: number, meta: number): number {
  let mult = 1

  for (const boost of boosts) {
    const ef = boost.efeito
    switch (ef.tipo) {
      case 'mult_multiply': {
        const cond = ef.condicao as string
        const min = ef.min as number
        let atende = false

        if (cond === 'mesmoClube') {
          const clubes = new Map<string, number>()
          for (const p of escalacao) clubes.set(p.clube, (clubes.get(p.clube) ?? 0) + 1)
          atende = [...clubes.values()].some(c => c >= min)
        } else if (cond === 'mesmaSelecao') {
          const nacs = new Map<string, number>()
          for (const p of escalacao) nacs.set(p.nacionalidade, (nacs.get(p.nacionalidade) ?? 0) + 1)
          atende = [...nacs.values()].some(c => c >= min)
        } else if (cond === 'mesmaPosicao') {
          const pos = ef.posicao as string
          const count = escalacao.filter(p => p.posicao === pos).length
          atende = count >= min
        }

        if (atende) {
          mult *= ef.valor as number
        }
        break
      }
      case 'mult_capitao': {
        if (escalacao.length > 0) {
          mult *= ef.valor as number
        }
        break
      }
      case 'mult_per_decade': {
        const decades = new Map<number, number>()
        for (const p of escalacao) {
          const decade = Math.floor((2026 - p.atributos.idade) / 10) * 10
          decades.set(decade, (decades.get(decade) ?? 0) + 1)
        }
        const maxCount = Math.max(...decades.values(), 0)
        if (maxCount >= 2) {
          mult += (maxCount - 1) * (ef.valor as number)
        }
        break
      }
      case 'mult_underdog': {
        if (baseFinal < meta) {
          mult *= ef.valor as number
        }
        break
      }
      case 'mult_per_all_elite': {
        for (const p of escalacao) {
          const allElite = atributosAtivos.every(attr => {
            const tier = p.tiersPorAtributo?.[attr]
            return tier === 'lendario' || tier === 'elite'
          })
          if (allElite) mult += ef.valor as number
        }
        break
      }
      case 'player_mult': {
        // Jogador alvo vira multiplicador
        if (boost.targetPlayerId && escalacao.some(p => p.id === boost.targetPlayerId)) {
          mult *= ef.valor as number
        }
        break
      }
    }
  }

  return mult
}

/**
 * Calcula a pontuação completa de uma escalação.
 */
export function calcularPontuacao(
  escalacao: PlayerCard[],
  boosts: BoostCard[],
  atributosAtivos: string[],
  meta: number,
  maoSize: number = 0
): ScoreResult {
  // 1. Calcular detalhes por jogador
  const detalhes: ScoreDetalhe[] = escalacao.map(p => ({
    jogadorId: p.id,
    pontosPorAtributo: { ...p.pontosNormalizados } as Record<string, number>,
    subtotal: playerScore(p),
  }))

  // 2. Base bruta = soma dos subtotais
  let base = detalhes.reduce((s, d) => s + d.subtotal, 0)

  // 3. Detectar combos
  const combos = detectCombos(escalacao)

  // 4. Aplicar combos de base
  for (const combo of combos) {
    if (combo.tipo === 'base') {
      base += combo.valor
    }
  }

  // 5. Aplicar boosts aditivos
  const boostsBase = boosts.filter(b => b.tipo === 'aditivo' || b.tipo === 'condicional')
  base += aplicarBoostsBase(boostsBase, escalacao, atributosAtivos, maoSize)

  // 6. Calcular MULT
  let mult = 1

  // Combos multiplicativos
  for (const combo of combos) {
    if (combo.tipo === 'mult') {
      mult *= combo.valor
    }
  }

  // Boosts multiplicativos
  const boostsMult = boosts.filter(b => b.tipo === 'multiplicativo' || b.tipo === 'condicional')
  mult *= aplicarBoostsMult(boostsMult, escalacao, atributosAtivos, base, meta)

  // 7. Total
  const total = Math.round(base * mult)

  return { base, mult, total, combos, detalhes }
}

/**
 * Aplica boosts de evento que modificam a meta.
 */
export function aplicarBoostsEvento(boosts: BoostCard[], meta: number): number {
  let metaFinal = meta
  for (const boost of boosts) {
    if (boost.efeito.tipo === 'meta_reduce') {
      metaFinal *= (1 - (boost.efeito.valor as number))
    }
  }
  return Math.round(metaFinal)
}
