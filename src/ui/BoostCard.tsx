import { memo } from 'react'
import type { BoostCard as BoostCardType } from '../engine/types'

// Pixel art icons as SVG paths (each is a small pixel drawing)
const BOOST_ICONS: Record<string, { path: string; color: string }> = {
  // Football/soccer ball
  craque_era:     { path: 'M8,2h4v1h-4zM6,3h2v1h-2zM12,3h2v1h-2zM5,4h1v2h-1zM14,4h1v2h-1zM4,6h1v1h-1zM8,6h4v1h-4zM15,6h1v1h-1zM4,7h1v1h-1zM7,7h1v2h-1zM12,7h1v2h-1zM15,7h1v1h-1zM4,8h1v1h-1zM15,8h1v1h-1zM5,9h1v2h-1zM8,9h4v1h-4zM14,9h1v2h-1zM6,11h2v1h-2zM12,11h2v1h-2zM8,12h4v1h-4z', color: '#FFFFFF' },
  // Star/explosion
  especialista:   { path: 'M9,1h2v2h-2zM7,3h1v1h-1zM12,3h1v1h-1zM3,5h4v1h-4zM13,5h4v1h-4zM5,6h1v1h-1zM14,6h1v1h-1zM7,7h1v1h-1zM12,7h1v1h-1zM8,8h4v2h-4zM7,10h1v1h-1zM12,10h1v1h-1zM6,11h1v1h-1zM13,11h1v1h-1zM5,12h2v1h-2zM13,12h2v1h-2z', color: '#FFD700' },
  // Whistle
  camisa10:       { path: 'M12,3h3v1h-3zM11,4h1v1h-1zM15,4h2v2h-2zM10,5h1v1h-1zM9,6h1v1h-1zM8,7h1v1h-1zM7,8h1v1h-1zM6,9h1v1h-1zM4,10h3v2h-3zM3,11h1v1h-1z', color: '#FFD700' },
  // Trophy
  galacticos:     { path: 'M4,2h1v3h-1zM5,2h6v1h-6zM11,2h1v3h-1zM5,5h6v1h-6zM6,6h4v1h-4zM7,7h2v2h-2zM5,9h6v1h-6zM5,10h6v1h-6z', color: '#FFD700' },
  // Flag
  torcida:        { path: 'M3,2h1v10h-1zM4,2h8v1h-8zM4,3h7v1h-7zM4,4h6v1h-6zM4,5h5v1h-5zM4,6h4v1h-4z', color: '#FFFFFF' },
  // Crown
  capitao:        { path: 'M3,4h1v1h-1zM7,4h2v1h-2zM12,4h1v1h-1zM3,5h1v1h-1zM5,5h1v1h-1zM7,5h2v1h-2zM10,5h1v1h-1zM12,5h1v1h-1zM3,6h10v1h-10zM3,7h10v1h-10zM4,8h8v1h-8z', color: '#FFD700' },
  // Clock
  geracao_ouro:   { path: 'M6,2h4v1h-4zM5,3h1v1h-1zM10,3h1v1h-1zM4,4h1v4h-1zM11,4h1v4h-1zM7,4h2v1h-2zM8,5h1v2h-1zM8,7h2v1h-2zM5,8h1v1h-1zM10,8h1v1h-1zM6,9h4v1h-4z', color: '#FFD700' },
  // Brazil flag
  amarelinha:     { path: 'M3,3h10v2h-10zM3,5h10v2h-10zM3,7h10v2h-10zM6,4h4v4h-4z', color: '#FFDF00' },
  // Shield
  davi_golias:    { path: 'M5,2h6v1h-6zM4,3h8v1h-8zM4,4h8v1h-8zM4,5h8v1h-8zM5,6h6v1h-6zM5,7h6v1h-6zM6,8h4v1h-4zM7,9h2v1h-2zM7,10h2v1h-2z', color: '#60A5FA' },
  // TV/Monitor (VAR)
  var:            { path: 'M3,3h10v7h-10zM4,4h8v5h-8zM6,10h4v1h-4zM5,11h6v1h-6z', color: '#FFD700' },
  // Dice
  penalti:        { path: 'M4,3h8v8h-8zM6,5h2v2h-2zM8,7h2v2h-2zM6,7h1v1h-1z', color: '#FF6B6B' },
  // Red card
  cartao_vermelho:{ path: 'M5,2h6v9h-6zM6,4h1v1h-1zM9,4h1v1h-1zM7,6h2v1h-2zM6,8h4v1h-4z', color: '#DC2626' },
  // Bench
  banco_forte:    { path: 'M3,5h10v2h-10zM4,3h1v2h-1zM7,3h2v2h-2zM11,3h1v2h-1zM4,7h1v3h-1zM11,7h1v3h-1z', color: '#60A5FA' },
  // Wall
  muralha:        { path: 'M3,4h3v2h-3zM7,4h3v2h-3zM11,4h3v2h-3zM4,6h3v2h-3zM8,6h3v2h-3zM12,6h2v2h-2zM3,8h3v2h-3zM7,8h3v2h-3zM11,8h3v2h-3z', color: '#3B82F6' },
  // Medal
  craque_mundial: { path: 'M6,2h1v3h-1zM9,2h1v3h-1zM5,5h6v1h-6zM5,6h1v4h-1zM10,6h1v4h-1zM6,10h4v1h-4zM7,7h2v2h-2z', color: '#FFD700' },
  // Diamond
  elite_squad:    { path: 'M7,2h2v1h-2zM6,3h1v1h-1zM9,3h1v1h-1zM5,4h1v1h-1zM10,4h1v1h-1zM4,5h1v1h-1zM11,5h1v1h-1zM5,6h1v1h-1zM10,6h1v1h-1zM6,7h1v1h-1zM9,7h1v1h-1zM7,8h2v1h-2z', color: '#C084FC' },
  // Arrows (versatility)
  versatilidade:  { path: 'M7,2h2v2h-2zM5,4h6v1h-6zM7,5h2v2h-2zM3,7h2v1h-2zM11,7h2v1h-2zM7,7h2v2h-2zM5,9h6v1h-6zM7,10h2v1h-2z', color: '#34D399' },
}

const TIPO_BG: Record<string, string> = {
  aditivo: '#1a3a1a',
  multiplicativo: '#3a1a1a',
  condicional: '#1a1a3a',
  evento: '#3a3a1a',
}

const TIPO_BORDER: Record<string, string> = {
  aditivo: '#3fa95b',
  multiplicativo: '#dc2626',
  condicional: '#3b82f6',
  evento: '#ffd84d',
}

const TIPO_LABEL: Record<string, string> = {
  aditivo: 'BASE',
  multiplicativo: 'MULT',
  condicional: 'COND',
  evento: 'EVENTO',
}

interface Props {
  boost: BoostCardType
  onClick?: () => void
  showPrice?: boolean
  compact?: boolean
}

export const BoostCardComponent = memo(function BoostCardComponent({ boost, onClick, showPrice }: Props) {
  const bg = TIPO_BG[boost.tipo] ?? '#1a1a2e'
  const border = TIPO_BORDER[boost.tipo] ?? '#ffd84d'
  const label = TIPO_LABEL[boost.tipo] ?? boost.tipo
  const icon = BOOST_ICONS[boost.id] ?? BOOST_ICONS['craque_era']

  const scale = 0.85
  const w = 180 * scale
  const h = 220 * scale

  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-all duration-200 inline-block hover:scale-105"
      style={{ width: w, height: h }}
    >
      <svg viewBox="0 0 180 220" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
        {/* Card frame */}
        <rect x={2} y={2} width={176} height={216} rx={6} fill={border} />
        <rect x={5} y={5} width={170} height={210} rx={4} fill={bg} />

        {/* Type badge */}
        <rect x={10} y={10} width={50} height={18} rx={3} fill={border} />
        <text x={35} y={24} textAnchor="middle" fill="#FFFFFF"
          style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7 }}>
          {label}
        </text>

        {/* Raridade indicator */}
        {boost.raridade === 'lendario' && <rect x={160} y={10} width={10} height={10} fill="#FFD700" rx={5} />}
        {boost.raridade === 'raro' && <rect x={160} y={10} width={10} height={10} fill="#C084FC" rx={5} />}

        {/* Pixel art icon - centered, scaled up */}
        <g transform="translate(50, 38) scale(5)">
          <path d={icon.path} fill={icon.color} opacity={0.9} />
        </g>

        {/* Name */}
        <text x={90} y={135} textAnchor="middle" fill="#ffd84d"
          style={{ fontFamily: "'VT323',monospace", fontSize: 20, fontWeight: 'bold' }}>
          {boost.nome}
        </text>

        {/* Description */}
        <foreignObject x={10} y={140} width={160} height={50}>
          <div style={{ fontFamily: "'VT323',monospace", fontSize: 13, color: '#b9b2e0', lineHeight: '1.2', textAlign: 'center' }}>
            {boost.descricao}
          </div>
        </foreignObject>

        {/* Price */}
        {showPrice && (
          <>
            <rect x={65} y={195} width={50} height={18} rx={3} fill="#ffd84d" />
            <text x={90} y={209} textAnchor="middle" fill="#0d0b1f"
              style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8 }}>
              ${boost.preco}
            </text>
          </>
        )}
      </svg>
    </div>
  )
})
