/**
 * Background music manager — loop + mute toggle
 */

let audio: HTMLAudioElement | null = null
let muted = localStorage.getItem('craques-bgm-muted') === '1'

export function initBgm() {
  if (audio) return
  audio = new Audio('/bgm.mp3')
  audio.loop = true
  audio.volume = 0.3
  audio.muted = muted

  // Autoplay requires user interaction first — start on first click
  const start = () => {
    if (audio) {
      audio.play().catch(() => {})
    }
    document.removeEventListener('click', start)
    document.removeEventListener('keydown', start)
  }
  document.addEventListener('click', start)
  document.addEventListener('keydown', start)
}

export function toggleMute(): boolean {
  muted = !muted
  if (audio) audio.muted = muted
  localStorage.setItem('craques-bgm-muted', muted ? '1' : '0')
  return muted
}

export function isMuted(): boolean {
  return muted
}
