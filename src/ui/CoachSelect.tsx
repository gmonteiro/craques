import { COACHES, type Coach } from '../engine/coaches'

interface Props {
  onSelect: (coach: Coach) => void
}

export function CoachSelect({ onSelect }: Props) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 16px',
      background: 'rgba(7,18,12,.7)',
    }}>
      <span className="val shadow-hard" style={{ fontSize: 36, color: 'var(--gold)', marginBottom: 4 }}>
        ESCOLHA SEU TÉCNICO
      </span>
      <span className="micro" style={{ fontSize: 11, marginBottom: 24 }}>
        Cada técnico tem um buff e um debuff que muda sua run
      </span>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
        width: '100%',
        maxWidth: 900,
      }}>
        {COACHES.map(coach => (
          <button
            key={coach.id}
            onClick={() => onSelect(coach)}
            className="panel"
            style={{
              padding: '14px 16px',
              cursor: 'pointer',
              textAlign: 'left',
              border: '2px solid var(--panel-line)',
              transition: 'transform .1s, border-color .15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.borderColor = 'var(--gold)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'var(--panel-line)'
            }}
          >
            {/* Name + country */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="val shadow-hard" style={{ fontSize: 22, color: 'var(--ink)' }}>
                {coach.nome}
              </span>
              <span className="micro" style={{ fontSize: 9 }}>{coach.pais}</span>
            </div>

            {/* Style */}
            <div className="val" style={{ fontSize: 15, color: 'var(--ink-dim)', marginBottom: 10 }}>
              {coach.estilo}
            </div>

            {/* Buff */}
            <div style={{
              background: 'rgba(92,208,137,.08)',
              border: '1px solid rgba(92,208,137,.25)',
              borderRadius: 7,
              padding: '5px 8px',
              marginBottom: 6,
            }}>
              <span className="val" style={{ fontSize: 14, color: 'var(--green)' }}>
                ▲ {coach.buff.descricao}
              </span>
            </div>

            {/* Debuff */}
            <div style={{
              background: 'rgba(223,82,77,.08)',
              border: '1px solid rgba(223,82,77,.25)',
              borderRadius: 7,
              padding: '5px 8px',
            }}>
              <span className="val" style={{ fontSize: 14, color: 'var(--pos-ata)' }}>
                ▼ {coach.debuff.descricao}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
