import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface LeaderboardEntry {
  score: number
  fase: number
  combos: number
  created_at: string
}

interface Props {
  seed: number
  onClose: () => void
}

export function Leaderboard({ seed, onClose }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [seed])

  async function loadLeaderboard() {
    setLoading(true)
    const { data } = await supabase
      .from('leaderboard')
      .select('score, fase, combos, created_at')
      .eq('seed', seed)
      .order('score', { ascending: false })
      .limit(20)

    setEntries(data ?? [])
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(5,8,10,.7)' }}>
      <div className="panel" style={{ width: 400, maxWidth: '90vw', maxHeight: '80vh', padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '2px solid var(--panel-line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="val shadow-hard" style={{ fontSize: 28, color: 'var(--gold)' }}>
              RANKING
            </span>
            <button onClick={onClose} className="btn-arcade btn-cancel" style={{ fontSize: 14, padding: '6px 12px 8px' }}>
              X
            </button>
          </div>
          <div className="micro" style={{ marginTop: 4 }}>
            Seed: {seed} · Daily Challenge
          </div>
        </div>

        {/* List */}
        <div className="scroll" style={{ overflowY: 'auto', maxHeight: 400, padding: '8px 12px' }}>
          {loading ? (
            <div className="val" style={{ textAlign: 'center', padding: 32, color: 'var(--ink-dim)', fontSize: 20 }}>
              Carregando...
            </div>
          ) : entries.length === 0 ? (
            <div className="val" style={{ textAlign: 'center', padding: 32, color: 'var(--ink-dim)', fontSize: 18 }}>
              Nenhum score registrado ainda.
              Jogue o Desafio Diario!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {entries.map((e, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: i === 0 ? 'linear-gradient(180deg,#2a2c18,#21230f)' : '#141d17',
                  border: i === 0 ? '2px solid var(--gold)' : '2px solid #0c1510',
                  borderRadius: 'var(--r-sm)',
                  padding: '8px 12px',
                  boxShadow: i === 0 ? '0 0 8px rgba(242,193,78,.2)' : 'none',
                }}>
                  {/* Rank */}
                  <span className="val shadow-hard" style={{
                    fontSize: 28, width: 36, textAlign: 'center',
                    color: i === 0 ? 'var(--gold)' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--ink-dim)',
                  }}>
                    {i + 1}
                  </span>

                  {/* Score */}
                  <span className="val" style={{ fontSize: 24, color: 'var(--ink)', flex: 1 }}>
                    {e.score.toLocaleString()}
                  </span>

                  {/* Phase */}
                  <span className="micro" style={{ fontSize: 9 }}>
                    F{e.fase + 1}
                  </span>

                  {/* Combos */}
                  <span className="micro" style={{ fontSize: 9 }}>
                    {e.combos}C
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Submit score to leaderboard */
export async function submitScore(seed: number, score: number, fase: number, combos: number) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) return

  await supabase.from('leaderboard').upsert({
    user_id: session.user.id,
    seed,
    score,
    fase,
    combos,
  }, { onConflict: 'user_id,seed' })
}
