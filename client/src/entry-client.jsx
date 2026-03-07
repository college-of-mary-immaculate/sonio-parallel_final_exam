import { hydrateRoot, createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppWrapper from './AppWrapper'
import './css/Global.css'
import './css/UserGlobal.css'
import './css/AdminGlobal.css'

const container = document.getElementById('root')

try {
  hydrateRoot(
    container,
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  )
} catch (e) {
  console.warn('[hydration] failed, falling back to createRoot:', e.message)
  container.innerHTML = ''
  createRoot(container).render(
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  )
}