/**
 * Background music manager — 2 tracks + mute toggle
 * State: 'track1' | 'track2' | 'muted'
 */

const TRACKS = ['/bgm.mp3', '/bgm2.mp3']
const TRACK_NAMES = ['Four Card Fable', 'Goal Post Shuffle']

let audio: HTMLAudioElement | null = null
let state: 'track1' | 'track2' | 'muted' = (localStorage.getItem('craques-bgm') as any) ?? 'track1'

function loadTrack(idx: number) {
  const wasPlaying = audio && !audio.paused
  if (audio) { audio.pause(); audio.src = '' }
  audio = new Audio(TRACKS[idx])
  audio.loop = true
  audio.volume = 0.3
  if (wasPlaying) audio.play().catch(() => {})
}

export function initBgm() {
  if (audio) return
  const idx = state === 'track2' ? 1 : 0
  audio = new Audio(TRACKS[idx])
  audio.loop = true
  audio.volume = 0.3
  if (state === 'muted' && audio) audio.muted = true

  const start = () => {
    if (audio && state !== 'muted') audio.play().catch(() => {})
    document.removeEventListener('click', start)
    document.removeEventListener('keydown', start)
  }
  document.addEventListener('click', start)
  document.addEventListener('keydown', start)
}

/** Cycle: track1 → track2 → muted → track1 */
export function cycleBgm(): { state: string; label: string } {
  if (state === 'track1') {
    state = 'track2'
    loadTrack(1)
  } else if (state === 'track2') {
    state = 'muted'
    if (audio) audio.muted = true
  } else {
    state = 'track1'
    loadTrack(0)
    if (audio) { audio.muted = false; audio.play().catch(() => {}) }
  }
  localStorage.setItem('craques-bgm', state)
  return getBgmState()
}

export function getBgmState(): { state: string; label: string } {
  if (state === 'track1') return { state: 'track1', label: TRACK_NAMES[0] }
  if (state === 'track2') return { state: 'track2', label: TRACK_NAMES[1] }
  return { state: 'muted', label: 'Mudo' }
}

// Keep old exports for compatibility
export function toggleMute(): boolean { cycleBgm(); return state === 'muted' }
export function isMuted(): boolean { return state === 'muted' }
