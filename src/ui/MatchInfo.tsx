import type { RunState } from '../engine/types'
import { infoPartida } from '../engine/run'
import { getAttributeLabel } from '../engine/attributes'

// Bandeiras como 3 faixas (h=horizontal, v=vertical)
interface FlagDef { c1: string; c2: string; c3: string; dir: 'h' | 'v' }
const FLAGS: Record<string, FlagDef> = {
  'MÉXICO':        { c1: '#006341', c2: '#FFFFFF', c3: '#CE1126', dir: 'v' },
  'CANADÁ':        { c1: '#FF0000', c2: '#FFFFFF', c3: '#FF0000', dir: 'v' },
  'AUSTRÁLIA':     { c1: '#002868', c2: '#002868', c3: '#002868', dir: 'h' }, // azul sólido
  'JAPÃO':         { c1: '#FFFFFF', c2: '#BC002D', c3: '#FFFFFF', dir: 'h' }, // branco/vermelho/branco
  'COREIA DO SUL': { c1: '#FFFFFF', c2: '#CD2E3A', c3: '#003478', dir: 'h' },
  'EUA':           { c1: '#002868', c2: '#FFFFFF', c3: '#BF0A30', dir: 'h' },
  'ALEMANHA':      { c1: '#000000', c2: '#DD0000', c3: '#FFCC00', dir: 'h' },
  'ESPANHA':       { c1: '#AA151B', c2: '#F1BF00', c3: '#AA151B', dir: 'h' },
  'HOLANDA':       { c1: '#AE1C28', c2: '#FFFFFF', c3: '#21468B', dir: 'h' },
  'INGLATERRA':    { c1: '#FFFFFF', c2: '#CE1124', c3: '#FFFFFF', dir: 'h' }, // cruz em fundo branco
  'FRANÇA':        { c1: '#002395', c2: '#FFFFFF', c3: '#ED2939', dir: 'v' },
  'ITÁLIA':        { c1: '#008C45', c2: '#FFFFFF', c3: '#CD212A', dir: 'v' },
  'ARGENTINA':     { c1: '#75AADB', c2: '#FFFFFF', c3: '#75AADB', dir: 'h' },
  'BRASIL':        { c1: '#009739', c2: '#FFDF00', c3: '#009739', dir: 'h' },
  'PORTUGAL':      { c1: '#006600', c2: '#006600', c3: '#FF0000', dir: 'v' }, // 1/3 verde, 2/3 vermelho
}

function Flag({ country }: { country: string }) {
  const f = FLAGS[country.toUpperCase()]
  if (!f) {
    return (
      <div className="w-8 h-6 rounded bg-gray-600 flex items-center justify-center border border-white/20">
        <span className="text-[7px] text-white font-bold">{country.slice(0, 3)}</span>
      </div>
    )
  }
  return (
    <div className={`w-8 h-6 rounded overflow-hidden border border-white/20 flex-shrink-0 flex ${f.dir === 'v' ? 'flex-row' : 'flex-col'}`}>
      <div className="flex-1" style={{ backgroundColor: f.c1 }} />
      <div className="flex-1" style={{ backgroundColor: f.c2 }} />
      <div className="flex-1" style={{ backgroundColor: f.c3 }} />
    </div>
  )
}

interface Props {
  run: RunState
}

export function MatchInfo({ run }: Props) {
  const info = infoPartida(run)

  return (
    <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-3 space-y-3 w-full md:w-52 flex-shrink-0">
      {/* Fase */}
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Fase</div>
        <div className="text-sm font-black text-white" style={{ fontFamily: "'VT323',monospace", fontSize: 18 }}>
          {info.fase}
        </div>
        <div className="text-[11px] text-gray-400">
          Partida {info.partida}/{info.totalPartidas}
          {info.isClassico && (
            <span className="ml-1 text-orange-400 font-bold">CLÁSSICO</span>
          )}
        </div>
      </div>

      {/* Adversário */}
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Adversário</div>
        <div className="flex items-center gap-2 mt-1">
          <Flag country={info.adversario} />
          <span className="text-white font-bold text-sm">{info.adversario}</span>
        </div>
      </div>

      {/* Meta */}
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Meta</div>
        <div className="text-xl font-black text-yellow-400" style={{ fontFamily: "'VT323',monospace" }}>
          {run.meta.toLocaleString()}
        </div>
      </div>

      {/* Orçamento */}
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Orçamento</div>
        <div className="text-lg font-black text-green-400" style={{ fontFamily: "'VT323',monospace" }}>
          ${run.orcamento}
        </div>
      </div>

      {/* Era */}
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Era</div>
        <div className="flex flex-col gap-1">
          {run.era.map(attr => (
            <span key={attr} className="text-[11px] bg-white/5 px-2 py-0.5 rounded text-gray-300 border border-white/5">
              {getAttributeLabel(attr)}
            </span>
          ))}
        </div>
      </div>

      {/* Twist */}
      {run.twist && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded p-2">
          <div className="text-[10px] text-orange-400 font-bold uppercase">Clássico</div>
          <div className="text-[11px] text-orange-300 mt-0.5">{run.twist.descricao}</div>
        </div>
      )}

      {/* Escalações e Trocas */}
      <div className="flex gap-3">
        <div>
          <div className="text-[10px] text-gray-500">Escalações</div>
          <div className="text-lg font-bold text-white">{run.tentativasRestantes}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500">Trocas</div>
          <div className="text-lg font-bold text-white">{run.trocasRestantes}</div>
        </div>
      </div>
    </div>
  )
}
