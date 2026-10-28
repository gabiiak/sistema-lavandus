import { useState } from 'react'
import { api } from './api.js'
import Login from './components/Login.jsx'
import BarraSuperior from './components/BarraSuperior.jsx'
import MenuPrincipal from './components/MenuPrincipal.jsx'
import Maquinas from './components/Maquinas.jsx'
import Empleados from './components/Empleados.jsx'
import Marcas from './components/Marcas.jsx'
import Servicios from './components/Servicios.jsx'
import TiposPrenda from './components/TiposPrenda.jsx'

const SESION_KEY = 'lavandus.sesion'

// Al iniciar sesión todos aterrizan en el Menú Principal (con el Dashboard).
const vistaInicial = () => 'inicio'

export default function App() {
  // Si hay sesión guardada en sessionStorage, no pedimos login de nuevo.
  const [sesion, setSesion] = useState(() => {
    const guardada = sessionStorage.getItem(SESION_KEY)
    return guardada ? JSON.parse(guardada) : null
  })
  const [vista, setVista] = useState(() => vistaInicial(sesion?.rol))

  const iniciarSesion = async (email, clave) => {
    const datos = await api.login(email, clave)
    sessionStorage.setItem(SESION_KEY, JSON.stringify(datos))
    setSesion(datos)
    setVista(vistaInicial(datos.rol))
  }

  const cerrarSesion = async () => {
    try {
      await api.logout()
    } catch {
      // si el servidor ya no existe, igual cerramos la sesión local
    }
    sessionStorage.removeItem(SESION_KEY)
    setSesion(null)
    setVista('inicio')
  }

  if (!sesion) return <Login onIngresar={iniciarSesion} />

  const esAdmin = sesion.rol === 'ADMIN'
  const puedeServicios =
    esAdmin || sesion.rol === 'ENCARGADO_SERVICIO' || sesion.rol === 'ENCARGADO_OPERACIONES'

  return (
    <>
      <BarraSuperior
        sesion={sesion}
        vista={vista}
        onCambiarVista={setVista}
        onSalir={cerrarSesion}
      />
      <main className="contenido">
        {vista === 'inicio' ? (
          <MenuPrincipal sesion={sesion} onCambiarVista={setVista} />
        ) : vista === 'empleados' && esAdmin ? (
          <Empleados />
        ) : vista === 'marcas' && esAdmin ? (
          <Marcas />
        ) : vista === 'tipos-prenda' && esAdmin ? (
          <TiposPrenda />
        ) : vista === 'servicios' && puedeServicios ? (
          <Servicios rol={sesion.rol} />
        ) : (
          <Maquinas rol={sesion.rol} />
        )}
      </main>
    </>
  )
}