/**
 * CRAQUES — Sound system using Web Audio API
 * All sounds are synthesized (no external files needed)
 */

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.15) {
  const c = getCtx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + duration)
}

function playNotes(notes: [number, number][], type: OscillatorType = 'square', volume = 0.12) {
  let t = 0
  for (const [freq, dur] of notes) {
    setTimeout(() => playTone(freq, dur, type, volume), t * 1000)
    t += dur * 0.7
  }
}

export const sounds = {
  /** Card placed in escalation slot */
  escalar: () => {
    playTone(523, 0.08, 'square', 0.1)
    setTimeout(() => playTone(659, 0.1, 'square', 0.1), 60)
  },

  /** Card removed from slot */
  desescalar: () => {
    playTone(440, 0.08, 'triangle', 0.08)
  },

  /** Card selected in hand */
  select: () => {
    playTone(880, 0.05, 'square', 0.06)
  },

  /** Combo activated! */
  combo: () => {
    playNotes([
      [523, 0.1], [659, 0.1], [784, 0.15], [1047, 0.2],
    ], 'square', 0.12)
  },

  /** GOOOL! */
  gol: () => {
    playNotes([
      [392, 0.1], [523, 0.1], [659, 0.12], [784, 0.15], [1047, 0.25],
    ], 'square', 0.15)
  },

  /** Gol do adversário */
  golAdv: () => {
    playNotes([
      [330, 0.15], [262, 0.2],
    ], 'triangle', 0.1)
  },

  /** Victory! */
  vitoria: () => {
    playNotes([
      [523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.15],
      [784, 0.08], [1047, 0.3],
    ], 'square', 0.15)
  },

  /** Defeat */
  derrota: () => {
    playNotes([
      [392, 0.2], [349, 0.2], [330, 0.2], [262, 0.4],
    ], 'triangle', 0.12)
  },

  /** Trocar card */
  trocar: () => {
    playTone(440, 0.06, 'triangle', 0.08)
    setTimeout(() => playTone(523, 0.08, 'triangle', 0.08), 80)
  },

  /** Pack opening */
  packOpen: () => {
    playNotes([
      [262, 0.08], [330, 0.08], [392, 0.08], [523, 0.12],
    ], 'square', 0.1)
  },

  /** Legendary card revealed */
  legendary: () => {
    playNotes([
      [523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.15],
      [1319, 0.1], [1568, 0.3],
    ], 'sine', 0.12)
  },

  /** Button click */
  click: () => {
    playTone(660, 0.03, 'square', 0.05)
  },

  /** Error / can't do */
  error: () => {
    playTone(220, 0.15, 'square', 0.08)
  },
}
