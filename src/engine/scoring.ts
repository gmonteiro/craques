import type { PlayerCard, BoostCard, Combo, ScoreResult, ScoreDetalhe } from './types'
import { detectCombos } from './combos'
import { playerScore } from './normalize'

/**
 * Aplica boosts aditivos e retorna o total de BASE extra.
 */
function aplicarBoostsBase(boosts: BoostCard[], escalacao: PlayerCard[], meta: number): number {
  let extra = 0

  for (const boost of boosts) {
    const ef = boost.efeito
    switch (ef.tipo) {
      case 'base_per_tier': {
        // +valor por jogador com atributo X em tier Y
        for (const p of escalacao) {
          if (p.tiersPorAtributo?.[ef.atributo as string] === ef.tier) {
            extra += ef.valor as number
          }
        }
        break
      }
      case 'base_multiply_attr': {
        // Multiplica o atributo de um jogador (o melhor nesse atributo)
        const attr = ef.atributo as string
        const melhor = escalacao.reduce((best, p) =>
          (p.pontosNormalizados?.[attr] ?? 0) > (best.pontosNormalizados?.[attr] ?? 0) ? p : best
        , escalacao[0])
        if (melhor?.pontosNormalizados?.[attr]) {
          extra += melhor.pontosNormalizados[attr] * ((ef.valor as number) - 1)
        }
        break
      }
      case 'base_flat_posicao': {
        // +valor ao melhor jogador de uma posição
        const pos = ef.posicao as string
        const meias = escalacao.filter(p => p.posicao === pos)
        if (meias.length > 0) {
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
      case 'base_per_attr_threshold': {
        const attr = ef.atributo as string
        const threshold = ef.threshold as number
        const pos = ef.posicao as string | undefined
        for (const p of escalacao) {
          if (pos && p.posicao !== pos) continue
          if ((p.atributos[attr] ?? 0) >= threshold) {
            extra += ef.valor as number
          }
        }
        break
      }
      case 'base_if_raridade': {
        const rar = ef.raridade as string
        if (escalacao.some(p => p.raridade === rar)) {
          extra += ef.valor as number
        }
        break
      }
    }
    // Suppress unused meta warning for underdog check below
    void meta
  }

  return extra
}

/**
 * Aplica boosts multiplicativos e retorna o MULT total.
 */
function aplicarBoostsMult(boosts: BoostCard[], escalacao: PlayerCard[], baseFinal: number, meta: number): number {
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
        // Aplica ao jogador com maior pontuação total
        const melhor = escalacao.reduce((best, p) =>
          playerScore(p) > playerScore(best) ? p : best
        , escalacao[0])
        if (melhor) {
          mult *= ef.valor as number
        }
        break
      }
      case 'mult_per_decade': {
        // +valor por jogador da década mais frequente
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
  _atributosAtivos: string[],
  meta: number
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
  base += aplicarBoostsBase(boostsBase, escalacao, meta)

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
  mult *= aplicarBoostsMult(boostsMult, escalacao, base, meta)

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
