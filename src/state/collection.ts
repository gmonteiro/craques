import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface CollectionStats {
  runs: number
  wins: number
  bestScore: number
}

interface CollectionState {
  unlockedPlayers: string[]
  unlockedBoosts: string[]
  stats: CollectionStats
  loaded: boolean
  userId: string | null

  // Actions
  init: () => Promise<void>
  unlockPlayer: (id: string) => void
  unlockBoost: (id: string) => void
  unlockPlayers: (ids: string[]) => void
  recordRun: (won: boolean, score: number) => void
}

const LOCAL_KEY = 'craques-collection'

function saveLocal(state: { unlockedPlayers: string[]; unlockedBoosts: string[]; stats: CollectionStats }) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state))
}

function loadLocal(): { unlockedPlayers: string[]; unlockedBoosts: string[]; stats: CollectionStats } | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export const useCollection = create<CollectionState>((set, get) => ({
  unlockedPlayers: [],
  unlockedBoosts: [],
  stats: { runs: 0, wins: 0, bestScore: 0 },
  loaded: false,
  userId: null,

  init: async () => {
    // 1. Auth — sign in anonymously if no session
    let { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      const { data } = await supabase.auth.signInAnonymously()
      session = data.session
    }
    const userId = session?.user?.id ?? null

    // 2. Try load from Supabase
    if (userId) {
      const { data } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (data) {
        set({
          unlockedPlayers: data.unlocked_players ?? [],
          unlockedBoosts: data.unlocked_boosts ?? [],
          stats: (data.stats as CollectionStats) ?? { runs: 0, wins: 0, bestScore: 0 },
          loaded: true,
          userId,
        })
        // Sync to localStorage as backup
        saveLocal({
          unlockedPlayers: data.unlocked_players ?? [],
          unlockedBoosts: data.unlocked_boosts ?? [],
          stats: (data.stats as CollectionStats) ?? { runs: 0, wins: 0, bestScore: 0 },
        })
        return
      }

      // No data in Supabase — check localStorage
      const local = loadLocal()
      if (local) {
        // Upload local data to Supabase
        await supabase.from('collections').upsert({
          user_id: userId,
          unlocked_players: local.unlockedPlayers,
          unlocked_boosts: local.unlockedBoosts,
          stats: local.stats,
        })
        set({ ...local, loaded: true, userId })
        return
      }

      // First time — create empty row
      await supabase.from('collections').upsert({
        user_id: userId,
        unlocked_players: [],
        unlocked_boosts: [],
        stats: { runs: 0, wins: 0, bestScore: 0 },
      })
    }

    // Fallback to localStorage only
    const local = loadLocal()
    if (local) {
      set({ ...local, loaded: true, userId })
    } else {
      set({ loaded: true, userId })
    }
  },

  unlockPlayer: (id) => {
    const { unlockedPlayers } = get()
    if (unlockedPlayers.includes(id)) return
    const updated = [...unlockedPlayers, id]
    set({ unlockedPlayers: updated })
    syncToBackend(get)
  },

  unlockPlayers: (ids) => {
    const { unlockedPlayers } = get()
    const newIds = ids.filter(id => !unlockedPlayers.includes(id))
    if (newIds.length === 0) return
    const updated = [...unlockedPlayers, ...newIds]
    set({ unlockedPlayers: updated })
    syncToBackend(get)
  },

  unlockBoost: (id) => {
    const { unlockedBoosts } = get()
    if (unlockedBoosts.includes(id)) return
    const updated = [...unlockedBoosts, id]
    set({ unlockedBoosts: updated })
    syncToBackend(get)
  },

  recordRun: (won, score) => {
    const { stats } = get()
    const updated = {
      runs: stats.runs + 1,
      wins: stats.wins + (won ? 1 : 0),
      bestScore: Math.max(stats.bestScore, score),
    }
    set({ stats: updated })
    syncToBackend(get)
  },
}))

// Debounced sync to Supabase + localStorage
let syncTimeout: ReturnType<typeof setTimeout> | null = null
function syncToBackend(get: () => CollectionState) {
  const { unlockedPlayers, unlockedBoosts, stats, userId } = get()

  // Always save locally
  saveLocal({ unlockedPlayers, unlockedBoosts, stats })

  // Debounce Supabase sync
  if (syncTimeout) clearTimeout(syncTimeout)
  syncTimeout = setTimeout(async () => {
    if (!userId) return
    await supabase.from('collections').upsert({
      user_id: userId,
      unlocked_players: unlockedPlayers,
      unlocked_boosts: unlockedBoosts,
      stats,
      updated_at: new Date().toISOString(),
    })
  }, 1000)
}
