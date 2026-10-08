import { useEffect, useState } from 'react'
import { api } from '../api.js'
import FormularioEmpleado from './FormularioEmpleado.jsx'

export default function Empleados() {
  const [empleados, setEmpleados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  // formulario: null | 'nuevo' | empleado a editar
  const [formulario, setFormulario] = useState(null)

  const cargar = () => {
    setCargando(true)
    setError('')
    api.empleados
      .listar()
      .then(setEmpleados)
      .catch((fallo) => setError(fallo.message))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [])

  const guardar = async (datos, id) => {
    if (id) {
      await api.empleados.editar(id, datos)
    } else {
      await api.empleados.crear(datos)
    }
    setFormulario(null)
    cargar()
  }

  const eliminar = async (empleado) => {
    if (!confirm(`¿Eliminar el empleado ${empleado.nombre} ${empleado.apellido}?`)) return
    try {
      await api.empleados.eliminar(empleado.idEmpleado)
      cargar()
    } catch (fallo) {
      alert(fallo.message)
    }
  }

  if (cargando) return <p className="aviso">Cargando empleados...</p>

  if (error) return <p className="aviso aviso--error">{error}</p>

  return (
    <>
      <div className="encabezado-pagina">
        <h1>Empleados</h1>
        <button className="btn btn--primario" onClick={() => setFormulario('nuevo')}>
          Nuevo empleado
        </button>
      </div>

      {empleados.length === 0 ? (
        <p className="aviso">Todavía no hay empleados registrados.</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>N°</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Género</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((emp) => (
                <tr key={emp.idEmpleado}>
                  <td>{emp.idEmpleado}</td>
                  <td>{emp.nombre}</td>
                  <td>{emp.apellido}</td>
                  <td>{emp.email}</td>
                  <td>{emp.genero}</td>
                  <td>
                    <span
                      className={
                        'rol-badge ' +
                        (emp.rol === 'ADMIN' ? 'rol-badge--admin' : 'rol-badge--empleado')
                      }
                    >
                      {emp.rol}
                    </span>
                  </td>
                  <td className="celda-acciones">
                    <button className="btn btn--texto" onClick={() => setFormulario(emp)}>
                      Editar
                    </button>
                    <button className="btn btn--texto btn--peligro" onClick={() => eliminar(emp)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formulario && (
        <div className="modal-fondo" onClick={() => setFormulario(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal__cerrar" onClick={() => setFormulario(null)}>
              ×
            </button>
            <FormularioEmpleado
              inicial={formulario === 'nuevo' ? null : formulario}
              onGuardar={guardar}
              onCancelar={() => setFormulario(null)}
            />
          </div>
        </div>
      )}
    </>
  )
}