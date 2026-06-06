import type { AttributeConfig, RngFn } from './types'
import { pickN } from './rng'
import attributesData from '../../data/attributes.json'

const pool = attributesData.pool as AttributeConfig[]

/** Sorteia N atributos ativos para a Era da run */
export function selectActiveAttributes(rng: RngFn, count: number): string[] {
  return pickN(rng, pool, count).map(a => a.id)
}

/** Retorna config de um atributo por ID */
export function getAttributeConfig(id: string): AttributeConfig | undefined {
  return pool.find(a => a.id === id)
}

/** Nome display do atributo */
export function getAttributeLabel(id: string): string {
  return getAttributeConfig(id)?.nome ?? id
}

/** Retorna todos os atributos do pool */
export function getAllAttributes(): AttributeConfig[] {
  return pool
}
