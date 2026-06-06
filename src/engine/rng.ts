import type { RngFn } from './types'

/**
 * Mulberry32 — PRNG determinístico com seed.
 * Retorna uma função que gera floats em [0, 1).
 */
export function createRng(seed: number): RngFn {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Inteiro aleatório em [min, max] (inclusive) */
export function randomInt(rng: RngFn, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

/** Shuffle in-place (Fisher-Yates) — retorna o mesmo array */
export function shuffle<T>(rng: RngFn, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(rng, 0, i)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Pega N elementos aleatórios (sem repetição) */
export function pickN<T>(rng: RngFn, arr: T[], n: number): T[] {
  const copy = [...arr]
  shuffle(rng, copy)
  return copy.slice(0, n)
}

/** Gera seed do dia: YYYYMMDD como inteiro */
export function dailySeed(): number {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

/** Seed aleatória (não-determinística) */
export function randomSeed(): number {
  return Math.floor(Math.random() * 2147483647)
}
