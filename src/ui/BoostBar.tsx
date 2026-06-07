import { useState } from 'react'
import type { BoostCard } from '../engine/types'

const TIPO_COLOR: Record<string, string> = {
  aditivo: 'var(--green)',
  multiplicativo: 'var(--pos-ata)',
  condicional: 'var(--pos-mei)',
  evento: 'var(--gold)',
  targeted: '#e879f9',
}

const TIPO_LABEL: Record<string, string> = {
  aditivo: 'BASE',
  multiplicativo: 'MULT',
  condicional: 'COND',
  evento: 'EVENTO',
  targeted: 'ALVO',
}

interface Props {
  boosts: BoostCard[]
}

export function BoostBar({ boosts }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (boosts.length === 0) return null

  return (
    <div>
      <div className="micro" style={{ fontSize: 10, marginBottom: 6 }}>
        Boosts ({boosts.length})
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        {boosts.map(boost => {
          const color = TIPO_COLOR[boost.tipo] ?? 'var(--ink-dim)'
          const isExpanded = expandedId === boost.id
          return (
            <button
              key={boost.id}
              onClick={() => setExpandedId(isExpanded ? null : boost.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#141d17',
                border: `2px solid ${isExpanded ? color : '#0c1510'}`,
                borderRadius: 'var(--r-sm)',
                padding: '6px 10px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color .15s',
                boxShadow: isExpanded ? `0 0 8px ${color}40` : 'inset 0 1px 0 rgba(255,255,255,.04)',
              }}
            >
              {/* Type indicator */}
              <span className="postag" style={{
                background: color,
                fontSize: 9,
                flexShrink: 0,
              }}>
                {TIPO_LABEL[boost.tipo]}
              </span>

              {/* Name + description */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="val" style={{
                  fontSize: 17,
                  color: 'var(--ink)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {boost.nome}
                </div>
                {isExpanded && (
                  <div className="val" style={{
                    fontSize: 14,
                    color: 'var(--ink-dim)',
                    marginTop: 2,
                    lineHeight: 1.2,
                  }}>
                    {boost.descricao}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
