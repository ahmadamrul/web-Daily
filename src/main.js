import './style.css'
import { initApp } from './app.js'

initApp(document.querySelector('#app'))

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline caching is a nice-to-have, safe to skip if registration fails */
    })
  })
}
