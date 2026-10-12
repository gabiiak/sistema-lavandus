import { useEffect, useState } from 'react'
import { api } from '../api.js'

// Alta de un servicio de lavado a partir de una solicitud disponible.
export default function FormularioServicio({ onGuardar, onCancelar }) {
  const [solicitudes, setSolicitudes] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [maquinas, setMaquinas] = useState([])
  const [datos, setDatos] = useState({ idSolicitud: '', idEmpleado: '', idMaquina: '' })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    api.solicitudes.disponibles().then(setSolicitudes).catch(() => {})
    api.empleados.listarPorRol('ENCARGADO_SERVICIO').then(setEmpleados).catch(() => {})
    api.maquinas
      .listar()
      .then((lista) => setMaquinas(lista.filter((m) => m.estado === 1)))
      .catch(() => {})
  }, [])

  const cambiar = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))

  const enviar = async (e) => {
    e.preventDefault()
    if (!datos.idSolicitud || !datos.idEmpleado) {
      setError('La solicitud y el empleado a cargo son obligatorios')
      return
    }
    setEnviando(true)
    setError('')
    try {
      await onGuardar({
        idSolicitud: Number(datos.idSolicitud),
        idEmpleado: Number(datos.idEmpleado),
        idMaquina: datos.idMaquina ? Number(datos.idMaquina) : null,
      })
    } catch (fallo) {
      setError(fallo.message || 'No se pudo registrar el servicio')
      setEnviando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <h2 className="modal__titulo">Nuevo servicio</h2>

      <div className="formulario__grilla">
        <label className="campo">
          <span>Solicitud *</span>
          <select
            value={datos.idSolicitud}
            onChange={(e) => cambiar('idSolicitud', e.target.value)}
            required
          >
            <option value="">Seleccioná una solicitud</option>
            {solicitudes.map((s) => (
              <option key={s.idSolicitud} value={s.idSolicitud}>
                {s.razonSocial} — {s.email}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Empleado a cargo *</span>
          <select
            value={datos.idEmpleado}
            onChange={(e) => cambiar('idEmpleado', e.target.value)}
            required
          >
            <option value="">Seleccioná un empleado</option>
            {empleados.map((emp) => (
              <option key={emp.idEmpleado} value={emp.idEmpleado}>
                {emp.nombre} {emp.apellido}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Máquina (opcional)</span>
          <select value={datos.idMaquina} onChange={(e) => cambiar('idMaquina', e.target.value)}>
            <option value="">Sin asignar (queda Pendiente)</option>
            {maquinas.map((m) => (
              <option key={m.idMaquina} value={m.idMaquina}>
                {m.marca?.nombre} {m.modelo} (N° {m.idMaquina})
              </option>
            ))}
          </select>
        </label>
      </div>

      {solicitudes.length === 0 && (
        <p className="aviso">No hay solicitudes disponibles sin servicio.</p>
      )}

      {error && <p className="aviso aviso--error">{error}</p>}

      <div className="formulario__acciones">
        <button type="button" className="btn" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primario" disabled={enviando}>
          {enviando ? 'Guardando...' : 'Registrar'}
        </button>
      </div>
    </form>
  )
}
