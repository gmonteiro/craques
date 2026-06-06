import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RunState } from '../engine/types'
import {
  iniciarRun,
  escalar,
  desescalar,
  jogar,
  trocar,
  avancar,
  comprarJogador,
  comprarBoost,
  venderJogador,
  rerollLoja,
  sairDaLoja,
} from '../engine/run'

interface GameStore {
  run: RunState | null
  screen: 'title' | 'game' | 'runEnd'

  // Actions
  novaRun: (seed?: number) => void
  dailyRun: () => void
  escalarJogador: (id: string) => void
  desescalarJogador: (id: string) => void
  jogarEscalacao: () => void
  trocarJogadores: (ids: string[]) => void
  avancarPartida: () => void
  comprarJogadorLoja: (id: string) => void
  comprarBoostLoja: (id: string) => void
  venderJogadorBaralho: (id: string) => void
  reroll: () => void
  sairLoja: () => void
  voltarTitulo: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      run: null,
      screen: 'title',

      novaRun: (seed) => set({
        run: iniciarRun(seed),
        screen: 'game',
      }),

      dailyRun: () => {
        const d = new Date()
        const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
        set({
          run: iniciarRun(seed),
          screen: 'game',
        })
      },

      escalarJogador: (id) => set((s) => {
        if (!s.run) return s
        return { run: escalar(s.run, [id]) }
      }),

      desescalarJogador: (id) => set((s) => {
        if (!s.run) return s
        return { run: desescalar(s.run, id) }
      }),

      jogarEscalacao: () => set((s) => {
        if (!s.run) return s
        const novoRun = jogar(s.run)
        if (novoRun.status === 'vitoria' || novoRun.status === 'derrota') {
          return { run: novoRun, screen: 'runEnd' }
        }
        return { run: novoRun }
      }),

      trocarJogadores: (ids) => set((s) => {
        if (!s.run) return s
        return { run: trocar(s.run, ids) }
      }),

      avancarPartida: () => set((s) => {
        if (!s.run) return s
        const novoRun = avancar(s.run)
        if (novoRun.status === 'vitoria') {
          return { run: novoRun, screen: 'runEnd' }
        }
        return { run: novoRun }
      }),

      comprarJogadorLoja: (id) => set((s) => {
        if (!s.run) return s
        return { run: comprarJogador(s.run, id) }
      }),

      comprarBoostLoja: (id) => set((s) => {
        if (!s.run) return s
        return { run: comprarBoost(s.run, id) }
      }),

      venderJogadorBaralho: (id) => set((s) => {
        if (!s.run) return s
        return { run: venderJogador(s.run, id) }
      }),

      reroll: () => set((s) => {
        if (!s.run) return s
        return { run: rerollLoja(s.run) }
      }),

      sairLoja: () => set((s) => {
        if (!s.run) return s
        return { run: sairDaLoja(s.run) }
      }),

      voltarTitulo: () => set({
        run: null,
        screen: 'title',
      }),
    }),
    {
      name: 'craques-save',
      partialize: (state) => ({ run: state.run, screen: state.screen }),
    }
  )
)
