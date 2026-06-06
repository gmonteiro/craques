import type { ComboProgress } from '../engine/combos'

interface Props {
  combos: ComboProgress[]
}

export function ComboGuide({ combos }: Props) {
  if (combos.length === 0) return null

  return (
    <div className="scroll" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      overflowY: 'auto',
      maxHeight: 320,
      paddingRight: 4,
    }}>
      {combos.map(combo => {
        const isGold = combo.ativo
        const barColor = combo.ativo
          ? combo.tipo === 'mult' ? '#df524d' : '#5cd089'
          : combo.progresso > 0 ? '#6f8a78' : '#2e3e34'

        return (
          <div
            key={combo.id}
            style={{
              background: '#141d17',
              border: isGold ? '2px solid var(--gold)' : '2px solid #0c1510',
              borderRadius: 'var(--r-sm)',
              padding: '8px 10px 6px',
              boxShadow: isGold
                ? '0 0 12px rgba(242,193,78,0.25), inset 0 1px 0 rgba(255,255,255,0.08)'
                : 'inset 0 1px 0 rgba(255,255,255,0.04)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            {/* Top row: name + progress count */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 4,
              marginBottom: 4,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, flex: 1 }}>
                <span style={{
                  width: 7, height: 7,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: combo.ativo
                    ? combo.tipo === 'mult' ? 'var(--pos-ata)' : 'var(--green)'
                    : 'var(--panel-3)',
                }} />
                <span className="micro" style={{
                  fontSize: 10,
                  color: combo.ativo ? 'var(--ink)' : 'var(--ink-dim)',
                  letterSpacing: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {combo.nome}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span className="val" style={{
                  fontSize: 16,
                  color: combo.ativo ? 'var(--ink)' : 'var(--ink-dim)',
                }}>
                  {combo.atual}/{combo.necessario}
                </span>
                {combo.ativo && (
                  <span className="micro" style={{
                    fontSize: 9,
                    color: combo.tipo === 'mult' ? 'var(--pos-ata)' : 'var(--green)',
                    letterSpacing: 0.5,
                  }}>
                    {combo.bonusLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{
              height: 4,
              background: '#0c1510',
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                borderRadius: 2,
                width: `${combo.progresso * 100}%`,
                background: barColor,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
