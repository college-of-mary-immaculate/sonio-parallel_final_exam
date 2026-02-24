import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppWrapper from './AppWrapper'
import './css/Global.css'
import './css/UserGlobal.css'
import './css/AdminGlobal.css'

hydrateRoot(
  document.getElementById('root'),
  <BrowserRouter>
    <AppWrapper />
  </BrowserRouter>
)