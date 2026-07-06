// App-level settings — edit these directly, they're not user data.
export const config = {
  namaPanggilan: '',
  accentColor: '#c0552f',
  showClock: true,
  // Set a password to enable the lock screen. Leave as '' to disable it
  // entirely (dashboard opens unlocked, no "Kunci sekarang" button shown).
  password: '1234',
}

// Accent color choices offered in the header swatch picker. The user's pick
// is persisted separately from `config.accentColor` (which is just the
// first-run default) so it survives across sessions.
export const ACCENT_PRESETS = [
  { color: '#c0552f', label: 'Terracotta' },
  { color: '#2f6b4f', label: 'Hijau' },
  { color: '#3d5a99', label: 'Biru' },
  { color: '#8a4f7d', label: 'Ungu' },
]
