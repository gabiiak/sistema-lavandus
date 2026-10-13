import { useState } from 'react'
import { api } from './api.js'
import Login from './components/Login.jsx'
import BarraSuperior from './components/BarraSuperior.jsx'
import Maquinas from './components/Maquinas.jsx'
import Empleados from './components/Empleados.jsx'
import Marcas from './components/Marcas.jsx'
import Servicios from './components/Servicios.jsx'
import TiposPrenda from './components/TiposPrenda.jsx'

const SESION_KEY = 'lavandus.sesion'

export default function App() {
  // Si hay sesión guardada en sessionStorage, no pedimos login de nuevo.
  const [sesion, setSesion] = useState(() => {
    const guardada = sessionStorage.getItem(SESION_KEY)
    return guardada ? JSON.parse(guardada) : null
  })
  const [vista, setVista] = useState(() =>
    sesion?.rol === 'ENCARGADO_SERVICIO' ? 'servicios' : 'maquinas'
  )

  const iniciarSesion = async (email, clave) => {
    const datos = await api.login(email, clave)
    sessionStorage.setItem(SESION_KEY, JSON.stringify(datos))
    setSesion(datos)
    setVista(datos.rol === 'ENCARGADO_SERVICIO' ? 'servicios' : 'maquinas')
  }

  const cerrarSesion = async () => {
    try {
      await api.logout()
    } catch {
      // si el servidor ya no existe, igual cerramos la sesión local
    }
    sessionStorage.removeItem(SESION_KEY)
    setSesion(null)
    setVista('maquinas')
  }

  if (!sesion) return <Login onIngresar={iniciarSesion} />

  const esAdmin = sesion.rol === 'ADMIN'
  const puedeServicios = esAdmin || sesion.rol === 'ENCARGADO_SERVICIO'

  return (
    <>
      <BarraSuperior
        sesion={sesion}
        vista={vista}
        onCambiarVista={setVista}
        onSalir={cerrarSesion}
      />
      <main className="contenido">
        {vista === 'empleados' && esAdmin ? (
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