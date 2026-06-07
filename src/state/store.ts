import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RunState } from '../engine/types'
import {
  iniciarRun,
  iniciarRunComCoach,
  escalar,
  desescalar,
  jogar,
  trocar,
  avancar,
  comprarJogador,
  comprarBoost,
  venderJogador,
  rerollLoja,
  refreshLoja,
  sairDaLoja,
  escolherCaminho,
} from '../engine/run'

interface GameStore {
  run: RunState | null
  screen: 'title' | 'game' | 'runEnd'

  // Actions
  novaRun: (seed?: number) => void
  novaRunCoach: (coachId: string, seed?: number) => void
  dailyRun: () => void
  escalarJogador: (id: string) => void
  desescalarJogador: (id: string) => void
  jogarEscalacao: () => void
  trocarJogadores: (ids: string[]) => void
  avancarPartida: () => void
  comprarJogadorLoja: (id: string) => void
  comprarBoostLoja: (id: string, targetPlayerId?: string) => void
  venderJogadorBaralho: (id: string) => void
  reroll: () => void
  refresh: () => void
  sairLoja: () => void
  escolherPath: (pathId: string) => void
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

      novaRunCoach: (coachId, seed) => set({
        run: iniciarRunComCoach(coachId, seed),
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

      comprarBoostLoja: (id, targetPlayerId) => set((s) => {
        if (!s.run) return s
        const novoRun = comprarBoost(s.run, id)
        // Se boost targeted, setar o targetPlayerId
        if (targetPlayerId && novoRun !== s.run) {
          const boostIdx = novoRun.boosts.findIndex(b => b.id === id && !b.targetPlayerId)
          if (boostIdx !== -1) {
            const novosBoosts = [...novoRun.boosts]
            novosBoosts[boostIdx] = { ...novosBoosts[boostIdx], targetPlayerId }
            return { run: { ...novoRun, boosts: novosBoosts } }
          }
        }
        return { run: novoRun }
      }),

      venderJogadorBaralho: (id) => set((s) => {
        if (!s.run) return s
        return { run: venderJogador(s.run, id) }
      }),

      reroll: () => set((s) => {
        if (!s.run) return s
        return { run: rerollLoja(s.run) }
      }),

      refresh: () => set((s) => {
        if (!s.run) return s
        return { run: refreshLoja(s.run) }
      }),

      sairLoja: () => set((s) => {
        if (!s.run) return s
        return { run: sairDaLoja(s.run) }
      }),

      escolherPath: (pathId) => set((s) => {
        if (!s.run) return s
        return { run: escolherCaminho(s.run, pathId) }
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
