function esc(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function lockedTemplate({ passwordSalah, draftPassword }) {
  return `
    <div class="locked-screen">
      <div class="locked-card">
        <h1 class="locked-title">Terkunci</h1>
        <div class="locked-sub">Masukkan password untuk membuka</div>
        <input
          type="password"
          class="input input-center"
          data-bind="draftPassword"
          data-enter="unlock"
          value="${esc(draftPassword)}"
          placeholder="Password"
          autofocus
        />
        <button class="btn btn-accent btn-block" data-action="unlock" style="margin-top:12px">Buka</button>
        ${passwordSalah ? '<div class="locked-error">Password salah, coba lagi.</div>' : ''}
      </div>
    </div>
  `
}

function headerTemplate({ tanggal, salam, darkMode, showClock, jam, accentPresets }) {
  const swatches = accentPresets
    .map(
      (p) => `
      <button
        class="swatch ${p.active ? 'active' : ''}"
        data-action="set-accent"
        data-color="${esc(p.color)}"
        style="background:${esc(p.color)}"
        title="${esc(p.label)}"
      ></button>
    `
    )
    .join('')

  return `
    <header class="app-header">
      <div>
        <div class="label-muted">${esc(tanggal)}</div>
        <h1 class="greeting">${esc(salam)}</h1>
      </div>
      <div class="header-right">
        <div class="swatch-row" title="Warna aksen">${swatches}</div>
        <button class="btn-text" data-action="toggle-dark" title="Dark mode">${darkMode ? '☀️ Terang' : '🌙 Gelap'}</button>
        ${showClock ? `<div class="clock" id="clock">${esc(jam)}</div>` : ''}
      </div>
    </header>
  `
}

function linksTemplate({ links, formLinkTerbuka, draftNama, draftUrl, searchLinks, totalLinks }) {
  const cards = links
    .map(
      (lk) => `
      <div class="link-card" data-drag="link" data-idx="${lk._idx}">
        <span class="drag-handle" draggable="true" title="Seret untuk urutkan">⠿</span>
        <a href="${esc(lk.url)}" target="_blank" rel="noopener" class="link-card-body">
          <div class="link-name">${esc(lk.nama)}</div>
          <div class="link-domain">${esc(hostnameOf(lk.url))}</div>
        </a>
        <button class="icon-btn danger-hover" data-action="delete-link" data-idx="${lk._idx}" title="Hapus link">×</button>
      </div>
    `
    )
    .join('')

  const noMatch = totalLinks > 0 && links.length === 0 ? '<div class="empty-state">Tidak ada link yang cocok.</div>' : ''

  return `
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Link cepat</h2>
        <div class="section-actions">
          <button class="btn-text small" data-action="export" title="Data hanya tersimpan di browser ini — export rutin untuk backup">⬇ Export</button>
          <button class="btn-text small" data-action="toggle-link-form">${formLinkTerbuka ? '✕ Tutup' : '+ Tambah link'}</button>
        </div>
      </div>
      ${
        formLinkTerbuka
          ? `
        <div class="inline-form">
          <input class="input flex-2" data-bind="draftNama" value="${esc(draftNama)}" placeholder="Nama, mis. Jejak Uang" />
          <input class="input flex-3" data-bind="draftUrl" value="${esc(draftUrl)}" placeholder="https://..." />
          <button class="btn btn-accent" data-action="save-link">Simpan</button>
        </div>
      `
          : ''
      }
      ${
        totalLinks > 3
          ? `
        <input class="input search-input" data-bind="searchLinks" value="${esc(searchLinks)}" placeholder="🔍 Cari link…" style="margin-top:14px" />
      `
          : ''
      }
      <div class="link-grid">${cards}</div>
      ${noMatch}
    </section>
  `
}

function todosTemplate({ todos, draftTodo }) {
  const rows = todos
    .map(
      (td, i) => `
      <div class="todo-row" data-drag="todo" data-idx="${i}">
        <span class="drag-handle" draggable="true" title="Seret untuk urutkan">⠿</span>
        <button class="checkbox ${td.selesai ? 'checked' : ''}" data-action="toggle-todo" data-idx="${i}">${td.selesai ? '✓' : ''}</button>
        <span class="todo-text ${td.selesai ? 'done' : ''}">${esc(td.teks)}</span>
        <button class="icon-btn danger-hover" data-action="delete-todo" data-idx="${i}" title="Hapus">×</button>
      </div>
    `
    )
    .join('')

  return `
    <section class="card todo-card">
      <h2 class="section-title">Hal yang harus diisi hari ini</h2>
      <div class="inline-form" style="margin-top:16px">
        <input class="input flex-1" data-bind="draftTodo" data-enter="add-todo" value="${esc(draftTodo)}" placeholder="Tulis tugas baru…" />
        <button class="btn btn-accent btn-square" data-action="add-todo">+</button>
      </div>
      <div class="todo-list">${rows}</div>
      ${todos.length === 0 ? '<div class="empty-state">Belum ada tugas — santai dulu ✨</div>' : ''}
    </section>
  `
}

function notesTemplate({ grupCatatanTampil, grupAktifId, formGrupTerbuka, draftNamaGrup, catatanAktif, searchCatatan, grupAktifNama, totalGrup }) {
  const chips = grupCatatanTampil
    .map(
      (g) => `
      <div class="chip-wrap">
        <button class="chip ${g.id === grupAktifId ? 'active' : ''}" data-action="select-group" data-id="${esc(g.id)}">${esc(g.nama)}</button>
        ${g.id !== 'umum' ? `<button class="chip-delete" data-action="delete-group" data-id="${esc(g.id)}" title="Hapus grup ini dan semua catatannya">×</button>` : ''}
      </div>
    `
    )
    .join('')

  const noMatch =
    totalGrup > 0 && grupCatatanTampil.length === 0
      ? '<div class="empty-state notes-empty">Tidak ada grup/catatan yang cocok.</div>'
      : ''

  return `
    <section class="card notes-card">
      <div class="section-head">
        <h2 class="section-title notes-title">Catatan</h2>
        <button class="btn-text notes-toggle" data-action="toggle-group-form">${formGrupTerbuka ? '✕ Tutup' : '+ Grup baru'}</button>
      </div>
      ${
        formGrupTerbuka
          ? `
        <div class="inline-form notes-form">
          <input class="input flex-1" data-bind="draftNamaGrup" value="${esc(draftNamaGrup)}" placeholder="Nama grup, mis. Pekerjaan, Ide, dll" autocomplete="off" />
          <button class="btn btn-accent" data-action="save-group">Buat</button>
        </div>
      `
          : ''
      }
      ${
        totalGrup > 2
          ? `
        <input class="input search-input notes-search" data-bind="searchCatatan" value="${esc(searchCatatan)}" placeholder="🔍 Cari grup / isi catatan…" />
      `
          : ''
      }
      <div class="chip-row">${chips}</div>
      ${noMatch}
      <div class="notes-body">
        <textarea class="textarea" data-bind="catatanAktif" placeholder="Tulis catatan di sini…" autocomplete="off">${esc(catatanAktif)}</textarea>
        <div class="notes-caption">Tersimpan otomatis. Grup: <strong>${esc(grupAktifNama)}</strong></div>
      </div>
    </section>
  `
}

function modalTemplate(konfirmasi) {
  if (!konfirmasi) return ''
  return `
    <div class="overlay">
      <div class="modal-card">
        <div class="modal-msg">${esc(konfirmasi.msg)}</div>
        <div class="modal-actions">
          <button class="btn btn-ghost" data-action="confirm-cancel">Batal</button>
          <button class="btn btn-danger" data-action="confirm-yes">Hapus</button>
        </div>
      </div>
    </div>
  `
}

function toastTemplate(notif) {
  if (!notif) return ''
  return `<div class="toast">${esc(notif)}</div>`
}

export function dashboardTemplate(vm) {
  return `
    <div class="dashboard">
      <div class="dashboard-inner">
        ${headerTemplate(vm)}
        ${linksTemplate(vm)}
        <div class="two-col">
          ${todosTemplate(vm)}
          ${notesTemplate(vm)}
        </div>
        ${
          vm.showLockButton
            ? `
          <div class="lock-again">
            <button class="btn btn-outline" data-action="lock">🔒 Kunci sekarang</button>
          </div>
        `
            : ''
        }
        <footer class="app-footer">
          Web keseharian — dibuat untuk dipakai tiap hari
          <div class="storage-note">Data tersimpan di browser ini saja — pakai ⬇ Export untuk backup rutin.</div>
        </footer>
      </div>
    </div>
    ${toastTemplate(vm.notif)}
    ${modalTemplate(vm.konfirmasi)}
  `
}
