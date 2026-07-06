import {
  state,
  setLinks,
  setTodos,
  setGrupCatatan,
  setCatatanByGrup,
  setGrupAktifId,
  setDarkMode,
  setUnlocked,
} from './store.js'
import { config } from './config.js'
import { lockedTemplate, dashboardTemplate } from './templates.js'

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

let root = null
let notifTimer = null
let clockTimer = null

export function initApp(el) {
  root = el
  document.documentElement.style.setProperty('--accent', config.accentColor)
  applyTheme()
  wireEvents()
  render()
  startClock()
}

function applyTheme() {
  document.documentElement.classList.toggle('dark', state.darkMode)
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function greeting() {
  const h = state.now.getHours()
  const waktu = h < 11 ? 'pagi' : h < 15 ? 'siang' : h < 18 ? 'sore' : 'malam'
  const nama = (config.namaPanggilan ?? '').trim()
  return `Selamat ${waktu}${nama ? ', ' + nama : ''}!`
}

function tanggalLabel() {
  return `${HARI[state.now.getDay()]}, ${state.now.getDate()} ${BULAN[state.now.getMonth()]} ${state.now.getFullYear()}`
}

function viewModel() {
  return {
    tanggal: tanggalLabel(),
    salam: greeting(),
    jam: `${pad(state.now.getHours())}:${pad(state.now.getMinutes())}`,
    darkMode: state.darkMode,
    showClock: config.showClock,
    links: state.links,
    formLinkTerbuka: state.formLinkTerbuka,
    draftNama: state.draftNama,
    draftUrl: state.draftUrl,
    todos: state.todos,
    draftTodo: state.draftTodo,
    grupCatatan: state.grupCatatan,
    grupAktifId: state.grupAktifId,
    formGrupTerbuka: state.formGrupTerbuka,
    draftNamaGrup: state.draftNamaGrup,
    catatanAktif: state.catatanByGrup[state.grupAktifId] ?? '',
    showLockButton: !!config.password,
    notif: state.notif,
    konfirmasi: state.konfirmasi,
  }
}

function render() {
  const pwSet = !!config.password
  const locked = pwSet && !state.unlocked
  root.innerHTML = locked
    ? lockedTemplate({ passwordSalah: state.passwordSalah, draftPassword: state.draftPassword })
    : dashboardTemplate(viewModel())
}

function startClock() {
  clearInterval(clockTimer)
  clockTimer = setInterval(() => {
    state.now = new Date()
    // Avoid a full re-render every second (would blur focused inputs/textarea
    // mid-typing) — patch only the clock/date text nodes directly.
    const clockEl = document.getElementById('clock')
    if (clockEl) clockEl.textContent = `${pad(state.now.getHours())}:${pad(state.now.getMinutes())}`
    const labelEl = document.querySelector('.label-muted')
    if (labelEl) labelEl.textContent = tanggalLabel()
    const greetEl = document.querySelector('.greeting')
    if (greetEl) greetEl.textContent = greeting()
  }, 1000)
}

function showToast(msg, ms = 3000) {
  state.notif = msg
  render()
  clearTimeout(notifTimer)
  notifTimer = setTimeout(() => {
    state.notif = null
    render()
  }, ms)
}

function askConfirm(msg, onYes) {
  state.konfirmasi = { msg, onYes }
  render()
}

// ---- actions ----

function unlock() {
  const pw = config.password ?? ''
  if (!pw || state.draftPassword === pw) {
    setUnlocked(true)
    state.passwordSalah = false
  } else {
    state.passwordSalah = true
  }
  render()
}

function lockNow() {
  setUnlocked(false)
  state.draftPassword = ''
  render()
}

function addTodo() {
  const t = state.draftTodo.trim()
  if (!t) return
  setTodos([...state.todos, { teks: t, selesai: false }])
  state.draftTodo = ''
  render()
}

function toggleTodo(idx) {
  setTodos(state.todos.map((t, i) => (i === idx ? { ...t, selesai: !t.selesai } : t)))
  render()
}

function deleteTodo(idx) {
  askConfirm('Hapus tugas ini?', () => {
    setTodos(state.todos.filter((_, i) => i !== idx))
    showToast('Tugas dihapus')
  })
}

function saveLink() {
  const nama = state.draftNama.trim()
  let url = state.draftUrl.trim()
  if (!nama || !url) return
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url
  setLinks([...state.links, { nama, url }])
  state.draftNama = ''
  state.draftUrl = ''
  state.formLinkTerbuka = false
  render()
}

function deleteLink(idx) {
  askConfirm('Hapus link ini?', () => {
    setLinks(state.links.filter((_, i) => i !== idx))
    showToast('Link dihapus')
  })
}

function saveGroup() {
  const nama = state.draftNamaGrup.trim()
  if (!nama) return
  const id = 'grup_' + Date.now()
  setGrupCatatan([...state.grupCatatan, { id, nama }])
  setCatatanByGrup({ ...state.catatanByGrup, [id]: '' })
  setGrupAktifId(id)
  state.draftNamaGrup = ''
  state.formGrupTerbuka = false
  render()
}

function deleteGroup(id) {
  if (id === 'umum') return
  const grup = state.grupCatatan.find((g) => g.id === id)
  askConfirm(`Hapus "${grup ? grup.nama : ''}" dan semua catatannya?`, () => {
    setGrupCatatan(state.grupCatatan.filter((g) => g.id !== id))
    const catatan = { ...state.catatanByGrup }
    delete catatan[id]
    setCatatanByGrup(catatan)
    if (state.grupAktifId === id) {
      setGrupAktifId(state.grupCatatan.find((g) => g.id !== id)?.id ?? 'umum')
    }
    showToast('Grup dihapus')
  })
}

function exportData() {
  const data = {
    links: state.links,
    todos: state.todos,
    catatanByGrup: state.catatanByGrup,
    grupCatatan: state.grupCatatan,
    tanggal_export: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `web-keseharian-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ---- event wiring (delegated, attached once) ----

const DRAFT_FIELDS = new Set(['draftNama', 'draftUrl', 'draftTodo', 'draftNamaGrup', 'draftPassword'])

function wireEvents() {
  root.addEventListener('input', (e) => {
    const bind = e.target.dataset.bind
    if (!bind) return
    if (bind === 'catatanAktif') {
      // Persist as the user types without a full re-render, so focus/cursor
      // position in the textarea survives (a re-render would blur it).
      setCatatanByGrup({ ...state.catatanByGrup, [state.grupAktifId]: e.target.value })
      return
    }
    if (DRAFT_FIELDS.has(bind)) {
      state[bind] = e.target.value
      if (bind === 'draftPassword') state.passwordSalah = false
    }
  })

  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return
    const action = e.target.dataset.enter
    if (action === 'add-todo') addTodo()
    if (action === 'unlock') unlock()
  })

  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]')
    if (!btn) return
    const idx = btn.dataset.idx !== undefined ? Number(btn.dataset.idx) : undefined
    const id = btn.dataset.id

    switch (btn.dataset.action) {
      case 'unlock':
        unlock()
        break
      case 'lock':
        lockNow()
        break
      case 'toggle-dark':
        setDarkMode(!state.darkMode)
        applyTheme()
        render()
        break
      case 'export':
        exportData()
        break
      case 'toggle-link-form':
        state.formLinkTerbuka = !state.formLinkTerbuka
        render()
        break
      case 'save-link':
        saveLink()
        break
      case 'delete-link':
        deleteLink(idx)
        break
      case 'add-todo':
        addTodo()
        break
      case 'toggle-todo':
        toggleTodo(idx)
        break
      case 'delete-todo':
        deleteTodo(idx)
        break
      case 'toggle-group-form':
        state.formGrupTerbuka = !state.formGrupTerbuka
        render()
        break
      case 'save-group':
        saveGroup()
        break
      case 'select-group':
        setGrupAktifId(id)
        render()
        break
      case 'delete-group':
        deleteGroup(id)
        break
      case 'confirm-cancel':
        state.konfirmasi = null
        render()
        break
      case 'confirm-yes': {
        const onYes = state.konfirmasi?.onYes
        state.konfirmasi = null
        if (onYes) onYes()
        render()
        break
      }
    }
  })
}
