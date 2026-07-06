# Web Keseharian

Dashboard harian personal: link cepat, to-do list, dan catatan berkelompok — dengan sapaan/jam otomatis, lock password opsional, dan mode gelap/terang. Dibangun dengan Vanilla JS + Vite, tanpa framework, tanpa backend. Semua data tersimpan di `localStorage` browser.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Lalu buka URL yang muncul di terminal (biasanya `http://localhost:5173/`).

> **Penting:** perintah di atas harus dijalankan dari dalam folder proyek ini (`Web-Daily/`), bukan dari folder induknya — kalau `package.json` tidak ketemu, biasanya itu sebabnya.

## Konfigurasi

Semua pengaturan aplikasi ada di [`src/config.js`](src/config.js):

```js
export const config = {
  namaPanggilan: '',       // muncul di sapaan, mis. "Selamat pagi, Budi!"
  accentColor: '#c0552f',  // warna aksen (link, tombol, jam)
  showClock: true,         // tampilkan jam live di header
  password: '',            // isi untuk mengaktifkan layar kunci; kosongkan untuk menonaktifkan
}
```

Tidak perlu restart dev server setelah edit — Vite akan reload otomatis.

## ⚠️ Tentang penyimpanan data

Semua link, to-do, dan catatan disimpan di **`localStorage` browser ini saja** — tidak sinkron antar perangkat/browser, dan bisa hilang kalau kamu membersihkan data browsing. Gunakan tombol **⬇ Export** di dashboard secara rutin untuk mengunduh backup `.json`.

## ⚠️ Tentang password lock

Lock password ini berjalan 100% di sisi browser (client-side) — cukup untuk mencegah orang iseng membuka dashboard kamu, **tapi bukan keamanan sungguhan**: siapa pun yang membuka DevTools bisa melihat password di `src/config.js` yang ter-bundle. Jangan pakai untuk data sensitif. Kalau nanti butuh keamanan asli (mis. situs sudah publik/online), pertimbangkan:
- Fitur *password protection* bawaan hosting (Netlify/Vercel Pro), atau
- Serverless function kecil yang memverifikasi password di server.

## Build & Deploy

```bash
npm run build    # menghasilkan folder dist/ siap deploy
npm run preview  # preview hasil build secara lokal
```

Proyek ini statis sepenuhnya, jadi bisa langsung di-deploy ke Netlify atau Vercel:
- **Netlify**: sudah ada `netlify.toml` — build command `npm run build`, publish dir `dist`.
- **Vercel**: sudah ada `vercel.json` — otomatis mendeteksi Vite.

## Struktur proyek

```
src/
  config.js      # pengaturan yang bisa diedit (nama, warna, password, dll)
  store.js       # state + persistensi localStorage
  templates.js   # fungsi render HTML per bagian (murni, tanpa efek samping)
  app.js         # controller: render loop + event handling
  style.css      # design tokens & semua styling
public/
  favicon.svg
  manifest.webmanifest
  sw.js          # service worker ringan untuk cache aset statis (opsional/PWA)
```
