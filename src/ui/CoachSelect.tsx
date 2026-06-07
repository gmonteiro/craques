import { useState } from 'react'
import { COACHES, type Coach } from '../engine/coaches'
import { PixelFace } from './PixelFace'

interface Props {
  onSelect: (coach: Coach) => void
}

/* ---- flag data (simple colored stripes, no emblems) ---- */
const FLAGS: Record<string, { o: 'h' | 'v'; c: string[] }> = {
  ESPANHA:   { o: 'h', c: ['#c60b1e', '#ffc400', '#c60b1e'] },
  PORTUGAL:  { o: 'v', c: ['#1c7a3f', '#d52b1e'] },
  'ITÁLIA':  { o: 'v', c: ['#1c8a4a', '#f2f2ee', '#c0392b'] },
  ALEMANHA:  { o: 'h', c: ['#161616', '#d8232a', '#ffce00'] },
  ARGENTINA: { o: 'h', c: ['#74acdf', '#ffffff', '#74acdf'] },
  BRASIL:    { o: 'h', c: ['#1c8a4a', '#ffd23f', '#1c8a4a'] },
  'FRANÇA':  { o: 'v', c: ['#2452a0', '#f2f2ee', '#c0392b'] },
}

function Flag({ pais }: { pais: string }) {
  const f = FLAGS[pais]
  if (!f) return null
  return (
    <span className={'flag ' + (f.o === 'h' ? 'h' : '')}>
      {f.c.map((c, i) => <i key={i} style={{ background: c }} />)}
    </span>
  )
}

function CoachCard({ coach, selected, onPick }: { coach: Coach; selected: boolean; onPick: () => void }) {
  return (
    <div className={'panel coach' + (selected ? ' sel' : '')} onClick={onPick}>
      <div className="check">&#x2713;</div>
      <div className="c-top">
        <div className="portrait">
          <PixelFace playerId={coach.id} shirt={coach.suit} numc="#fff" size={54} />
        </div>
        <div className="c-meta">
          <h3 className="cname">{coach.nome}</h3>
          <div className="c-country"><Flag pais={coach.pais} /><span>{coach.pais}</span></div>
          <div className="c-style">{coach.estilo}</div>
        </div>
      </div>
      <div className="perk buff"><span className="ar">&#x25B2;</span><span>{coach.buff.descricao}</span></div>
      <div className="perk debuff"><span className="ar">&#x25BC;</span><span>{coach.debuff.descricao}</span></div>
    </div>
  )
}

export function CoachSelect({ onSelect }: Props) {
  const [sel, setSel] = useState<string | null>(null)
  const chosen = COACHES.find(c => c.id === sel) ?? null

  return (
    <div id="stage-c">
      <div className="stripes" />
      <div className="c-head">
        <h1>Escolha seu t&eacute;cnico</h1>
        <p>Cada t&eacute;cnico tem um buff e um debuff que mudam sua run</p>
      </div>
      <div className="grid">
        {COACHES.map(c => (
          <CoachCard key={c.id} coach={c} selected={sel === c.id} onPick={() => setSel(c.id)} />
        ))}
      </div>
      <div className={'confirm-bar' + (chosen ? ' show' : '')}>
        <span className="pick">T&eacute;cnico: <b>{chosen ? chosen.nome : ''}</b></span>
        <button className="btn-arcade btn-play btn-md" onClick={() => { if (chosen) onSelect(chosen) }}>
          Confirmar t&eacute;cnico &rarr;
        </button>
      </div>
    </div>
  )
}
