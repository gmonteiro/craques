import { useRef, useEffect, memo } from 'react'

/**
 * Avatar pixel-art genérico (16×17 grid, desenhado via canvas).
 * Determinístico: mesmo id → mesmo rosto.
 * NÃO representa pessoas reais — personagens originais estilizados.
 */

const SKINS: [string, string][] = [
  ['#f3cda8', '#e0b189'], ['#eab98c', '#d49f6f'], ['#d2a173', '#b9874f'],
  ['#b67e4f', '#9c6539'], ['#8a5836', '#6f4226'], ['#6b4327', '#52311b'],
]
const HAIRS = ['#1d150e', '#2e2014', '#4a3320', '#5b3a1e', '#0c0c0c', '#caa14a', '#7a4a22', '#141a20']
const BANDS = ['#ffd23f', '#eef1f5', '#d8504b', '#2452a0', '#1c8a4a']
const STYLES = ['short', 'curly', 'headband', 'buzz', 'volume', 'long'] as const

type HairStyle = typeof STYLES[number]

// Fixed looks per player id — based on real appearance
// SKINS: [0]=very light [1]=light [2]=medium [3]=tan [4]=dark [5]=very dark
const OVR: Record<string, Partial<{ skin: [string, string]; hair: string; style: HairStyle; beard: boolean; band: string }>> = {
  // === Lendários ativos ===
  messi:       { skin: SKINS[1], hair: '#2e2014', style: 'short', beard: true },
  cr7:         { skin: SKINS[2], hair: '#1d150e', style: 'short', beard: true },
  mbappe:      { skin: SKINS[4], hair: '#0c0c0c', style: 'buzz', beard: false },
  haaland:     { skin: SKINS[0], hair: '#caa14a', style: 'buzz', beard: false },
  vinicius:    { skin: SKINS[4], hair: '#0c0c0c', style: 'headband', band: '#ffd23f', beard: false },
  neymar:      { skin: SKINS[3], hair: '#0c0c0c', style: 'curly', beard: true },
  modric:      { skin: SKINS[0], hair: '#caa14a', style: 'long', beard: false },
  lewandowski: { skin: SKINS[0], hair: '#2e2014', style: 'short', beard: true },
  suarez:      { skin: SKINS[1], hair: '#1d150e', style: 'short', beard: true },
  benzema:     { skin: SKINS[2], hair: '#1d150e', style: 'buzz', beard: true },
  // === Elite ===
  bellingham:  { skin: SKINS[1], hair: '#5b3a1e', style: 'short', beard: false },
  debruyne:    { skin: SKINS[0], hair: '#caa14a', style: 'short', beard: false },
  salah:       { skin: SKINS[3], hair: '#1d150e', style: 'curly', beard: true },
  rodri:       { skin: SKINS[1], hair: '#2e2014', style: 'short', beard: true },
  pedri:       { skin: SKINS[1], hair: '#1d150e', style: 'volume', beard: false },
  saka:        { skin: SKINS[4], hair: '#0c0c0c', style: 'short', beard: false },
  virgil:      { skin: SKINS[5], hair: '#0c0c0c', style: 'buzz', beard: true },
  courtois:    { skin: SKINS[0], hair: '#5b3a1e', style: 'short', beard: true },
  alisson:     { skin: SKINS[1], hair: '#5b3a1e', style: 'short', beard: true },
  yamal:       { skin: SKINS[3], hair: '#1d150e', style: 'curly', beard: false },
  kane:        { skin: SKINS[0], hair: '#caa14a', style: 'buzz', beard: true },
  foden:       { skin: SKINS[0], hair: '#caa14a', style: 'buzz', beard: false },
  wirtz:       { skin: SKINS[0], hair: '#5b3a1e', style: 'short', beard: false },
  valverde:    { skin: SKINS[1], hair: '#2e2014', style: 'short', beard: false },
  brunofernandes: { skin: SKINS[1], hair: '#2e2014', style: 'short', beard: true },
  osimhen:     { skin: SKINS[5], hair: '#0c0c0c', style: 'buzz', beard: false },
  lautaro:     { skin: SKINS[2], hair: '#1d150e', style: 'short', beard: true },
  kimmich:     { skin: SKINS[0], hair: '#caa14a', style: 'short', beard: true },
  dembele:     { skin: SKINS[5], hair: '#0c0c0c', style: 'buzz', beard: false },
  'alexander-arnold': { skin: SKINS[4], hair: '#0c0c0c', style: 'curly', beard: false },
  // === Bom ===
  Son:         { skin: SKINS[1], hair: '#141a20', style: 'short', beard: false },
  dias:        { skin: SKINS[2], hair: '#1d150e', style: 'short', beard: true },
  gavi:        { skin: SKINS[1], hair: '#1d150e', style: 'volume', beard: false },
  raphinha:    { skin: SKINS[3], hair: '#0c0c0c', style: 'curly', beard: false },
  hakimi:      { skin: SKINS[3], hair: '#1d150e', style: 'buzz', beard: true },
  marquinhos:  { skin: SKINS[3], hair: '#0c0c0c', style: 'short', beard: false },
  casemiro:    { skin: SKINS[3], hair: '#0c0c0c', style: 'curly', beard: true },
  endrick:     { skin: SKINS[4], hair: '#0c0c0c', style: 'short', beard: false },
  ruidiaz:     { skin: SKINS[4], hair: '#0c0c0c', style: 'buzz', beard: false },
  kroos:       { skin: SKINS[0], hair: '#5b3a1e', style: 'short', beard: false },
  muller:      { skin: SKINS[0], hair: '#5b3a1e', style: 'short', beard: false },
  carvajal:    { skin: SKINS[2], hair: '#1d150e', style: 'short', beard: true },
  thiagosilva: { skin: SKINS[3], hair: '#0c0c0c', style: 'short', beard: true },
  gundogan:    { skin: SKINS[2], hair: '#1d150e', style: 'buzz', beard: true },
  luisdiaz:    { skin: SKINS[3], hair: '#0c0c0c', style: 'volume', beard: false },
  saliba:      { skin: SKINS[4], hair: '#0c0c0c', style: 'short', beard: false },
  militao:     { skin: SKINS[4], hair: '#0c0c0c', style: 'buzz', beard: false },
  tchouameni:  { skin: SKINS[5], hair: '#0c0c0c', style: 'buzz', beard: false },
  szczesny:    { skin: SKINS[0], hair: '#2e2014', style: 'short', beard: true },
  // === Lendas aposentadas ===
  pele:        { skin: SKINS[5], hair: '#0c0c0c', style: 'short', beard: false },
  maradona:    { skin: SKINS[2], hair: '#1d150e', style: 'curly', beard: false },
  cruyff:      { skin: SKINS[0], hair: '#caa14a', style: 'long', beard: false },
  zidane:      { skin: SKINS[2], hair: '#1d150e', style: 'buzz', beard: false },
  'ronaldo-fenomeno': { skin: SKINS[3], hair: '#0c0c0c', style: 'buzz', beard: false },
  romario:     { skin: SKINS[3], hair: '#0c0c0c', style: 'short', beard: false },
  platini:     { skin: SKINS[0], hair: '#4a3320', style: 'volume', beard: false },
  beckenbauer: { skin: SKINS[0], hair: '#caa14a', style: 'short', beard: false },
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

interface Features {
  skin: string; shade: string; hair: string
  style: HairStyle; beard: boolean; band: string
  shirt: string; numc: string
}

export function faceFeatures(id: string, shirt: string, numc: string): Features {
  const h = hash(id)
  let skin = SKINS[h % SKINS.length]
  let hair = HAIRS[(h >> 3) % HAIRS.length]
  let style: HairStyle = STYLES[(h >> 6) % STYLES.length]
  let beard = ((h >> 9) % 5) === 0
  let band = BANDS[(h >> 11) % BANDS.length]
  const o = OVR[id]
  if (o) {
    if (o.skin) skin = o.skin
    if (o.hair) hair = o.hair
    if (o.style) style = o.style
    if ('beard' in o) beard = o.beard!
    if (o.band) band = o.band
  }
  return { skin: skin[0], shade: skin[1], hair, style, beard, band, shirt, numc }
}

function drawFace(ctx: CanvasRenderingContext2D, f: Features) {
  const R = (x: number, y: number, c: string, w = 1, h = 1) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h) }
  const C = (x: number, y: number, w = 1, h = 1) => { ctx.clearRect(x, y, w, h) }
  ctx.clearRect(0, 0, 16, 17)

  // Shoulders / shirt
  R(2, 14, f.shirt, 12, 3)
  R(1, 16, f.shirt, 14, 1)
  R(2, 14, 'rgba(0,0,0,.18)', 12, 1) // shirt shadow

  // Neck
  R(6, 12, f.shade, 4, 3)

  // Head
  R(4, 3, f.skin, 8, 10)
  C(4, 3); C(11, 3); C(4, 12); C(11, 12) // rounded corners
  R(10, 4, f.shade, 1, 8) // side shadow

  // Ears
  R(3, 7, f.skin, 1, 2); R(12, 7, f.skin, 1, 2)
  R(12, 7, f.shade, 1, 2)

  // Eyes
  R(6, 7, '#23201d', 1, 1); R(9, 7, '#23201d', 1, 1)
  // Nose
  R(8, 8, f.shade, 1, 2)
  // Mouth
  R(7, 10, '#8a4f3f', 2, 1)

  // Beard
  if (f.beard) {
    R(4, 10, f.hair, 8, 3); C(4, 12); C(11, 12)
    R(6, 7, '#23201d', 1, 1); R(9, 7, '#23201d', 1, 1) // re-eyes
    R(7, 10, '#5a3327', 2, 1) // mouth over beard
    R(4, 3, f.skin, 8, 4); C(4, 3); C(11, 3) // clean forehead
    R(10, 4, f.shade, 1, 3)
  }

  // Hair by style
  const H = f.hair
  switch (f.style) {
    case 'short':
      R(4, 2, H, 8, 2); R(3, 3, H, 1, 4); R(12, 3, H, 1, 4); R(4, 4, H, 8, 1)
      break
    case 'buzz':
      R(4, 2, H, 8, 2); R(3, 3, H, 1, 3); R(12, 3, H, 1, 3)
      R(5, 2, 'rgba(0,0,0,.16)', 1, 1); R(8, 2, 'rgba(0,0,0,.16)', 1, 1); R(10, 3, 'rgba(0,0,0,.16)', 1, 1)
      break
    case 'curly':
      R(3, 1, H, 10, 3); R(2, 3, H, 1, 4); R(13, 3, H, 1, 4); R(4, 4, H, 8, 1)
      R(4, 0, H, 2, 1); R(7, 0, H, 2, 1); R(10, 0, H, 2, 1)
      break
    case 'volume':
      R(3, 0, H, 10, 4); R(2, 2, H, 1, 6); R(13, 2, H, 1, 6); R(4, 4, H, 8, 1)
      R(5, 1, 'rgba(255,255,255,.08)', 4, 1)
      break
    case 'long':
      R(4, 2, H, 8, 2); R(3, 3, H, 1, 9); R(12, 3, H, 1, 9); R(4, 4, H, 8, 1)
      break
    case 'headband':
      R(4, 1, H, 8, 2); R(3, 2, H, 1, 3); R(12, 2, H, 1, 3); R(4, 3, H, 8, 1)
      R(3, 5, f.band, 10, 1)
      R(4, 5, 'rgba(255,255,255,.22)', 8, 1)
      break
  }

  // Hair shine
  if (f.style !== 'buzz') R(5, 2, 'rgba(255,255,255,.12)', 3, 1)
}

interface PixelFaceProps {
  playerId: string
  shirt: string
  numc: string
  size?: number
}

export const PixelFace = memo(function PixelFace({ playerId, shirt, numc, size = 64 }: PixelFaceProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    const f = faceFeatures(playerId, shirt, numc)
    drawFace(ctx, f)
  }, [playerId, shirt, numc, size])

  return (
    <canvas
      ref={ref}
      width={16}
      height={17}
      style={{
        width: size,
        height: Math.round(size * 17 / 16),
        imageRendering: 'pixelated',
        display: 'block',
      }}
    />
  )
})
