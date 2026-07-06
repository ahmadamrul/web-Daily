import { config } from './config.js'

const PREFIX = 'harian.'

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function persist(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* localStorage unavailable (private mode, quota, etc.) — state just won't survive reload */
  }
}

export const state = {
  links: load('links', [
    { nama: 'Jejak Uang', url: 'https://example.com' },
    { nama: 'Google Kalender', url: 'https://calendar.google.com' },
    { nama: 'Gmail', url: 'https://mail.google.com' },
  ]),
  todos: load('todos', []),
  grupCatatan: load('grupCatatan', [{ id: 'umum', nama: 'Umum' }]),
  catatanByGrup: load('catatanByGrup', { umum: '' }),
  grupAktifId: load('grupAktifId', 'umum'),
  darkMode: load('darkMode', false),
  unlocked: load('unlocked', !config.password),
  accent: load('accent', config.accentColor),
  now: new Date(),

  // transient UI-only state
  draftNama: '',
  draftUrl: '',
  draftTodo: '',
  draftNamaGrup: '',
  draftPassword: '',
  passwordSalah: false,
  formLinkTerbuka: false,
  formGrupTerbuka: false,
  searchLinks: '',
  searchCatatan: '',
  notif: null,
  konfirmasi: null, // { msg, onYes }
}

export function setLinks(links) {
  state.links = links
  persist('links', links)
}

export function setTodos(todos) {
  state.todos = todos
  persist('todos', todos)
}

export function setGrupCatatan(grup) {
  state.grupCatatan = grup
  persist('grupCatatan', grup)
}

export function setCatatanByGrup(catatan) {
  state.catatanByGrup = catatan
  persist('catatanByGrup', catatan)
}

export function setGrupAktifId(id) {
  state.grupAktifId = id
  persist('grupAktifId', id)
}

export function setDarkMode(v) {
  state.darkMode = v
  persist('darkMode', v)
}

export function setUnlocked(v) {
  state.unlocked = v
  persist('unlocked', v)
}

export function setAccent(color) {
  state.accent = color
  persist('accent', color)
}

export function reorderArray(arr, fromIdx, toIdx) {
  const copy = [...arr]
  const [item] = copy.splice(fromIdx, 1)
  copy.splice(toIdx, 0, item)
  return copy
}
