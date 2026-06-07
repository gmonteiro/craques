import { memo } from 'react'
import type { BoostCard as BoostCardType } from '../engine/types'

const TIPO_BG: Record<string, string> = {
  aditivo: '#1a3a1a',
  multiplicativo: '#3a1a1a',
  condicional: '#1a1a3a',
  evento: '#3a3a1a',
  targeted: '#3a1a2a',
}

const TIPO_BORDER: Record<string, string> = {
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

const TIPO_ICON: Record<string, string> = {
  aditivo: '+',
  multiplicativo: '×',
  condicional: '?',
  evento: '!',
  targeted: '⊕',
}

interface Props {
  boost: BoostCardType
  onClick?: () => void
  showPrice?: boolean
  compact?: boolean
}

export const BoostCardComponent = memo(function BoostCardComponent({ boost, onClick, showPrice }: Props) {
  const bg = TIPO_BG[boost.tipo] ?? '#1a1a2e'
  const border = TIPO_BORDER[boost.tipo] ?? 'var(--gold)'
  const label = TIPO_LABEL[boost.tipo] ?? boost.tipo
  const icon = TIPO_ICON[boost.tipo] ?? '?'

  return (
    <div
      onClick={onClick}
      style={{
        width: 170,
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'transform .1s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        borderRadius: 14,
        overflow: 'hidden',
        background: bg,
        border: `2px solid ${border}`,
        boxShadow: `0 5px 0 rgba(0,0,0,.3), 0 8px 16px rgba(0,0,0,.35)`,
        padding: '12px 14px 14px',
      }}>
        {/* Type badge + raridade */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="postag" style={{ background: border, fontSize: 10 }}>{label}</span>
          {boost.raridade === 'lendario' && (
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 6px rgba(242,193,78,.5)' }} />
          )}
          {boost.raridade === 'raro' && (
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#c084fc' }} />
          )}
        </div>

        {/* Icon */}
        <div style={{
          textAlign: 'center',
          marginBottom: 8,
        }}>
          <span className="val shadow-hard" style={{
            fontSize: 48,
            color: border,
            opacity: 0.7,
          }}>
            {icon}
          </span>
        </div>

        {/* Name */}
        <div className="val shadow-hard" style={{
          fontSize: 20,
          color: 'var(--gold)',
          textAlign: 'center',
          marginBottom: 6,
          lineHeight: 1,
        }}>
          {boost.nome}
        </div>

        {/* Description */}
        <div className="val" style={{
          fontSize: 15,
          color: 'var(--ink-dim)',
          textAlign: 'center',
          lineHeight: 1.2,
          minHeight: 36,
        }}>
          {boost.descricao}
        </div>

        {/* Price */}
        {showPrice && (
          <div style={{
            marginTop: 8,
            textAlign: 'center',
            background: 'var(--gold)',
            borderRadius: 8,
            padding: '4px 0 6px',
          }}>
            <span className="val" style={{ fontSize: 22, color: '#1a1000' }}>
              ${boost.preco}
            </span>
          </div>
        )}
      </div>
    </div>
  )
})
