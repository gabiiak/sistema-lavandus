import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import VistaCliente from './components/VistaCliente.jsx'

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <VistaCliente />
  </StrictMode>,
)
