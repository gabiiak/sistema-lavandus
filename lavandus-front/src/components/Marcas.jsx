import { useEffect, useState } from 'react'
import { api } from '../api.js'
import FormularioMarca from './FormularioMarca.jsx'

// ABM de marcas (vista solo ADMIN): por ahora listar y crear.
export default function Marcas() {
  const [marcas, setMarcas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [formulario, setFormulario] = useState(false)

  const cargar = () => {
    setCargando(true)
    setError('')
    api.marcas
      .listar()
      .then(setMarcas)
      .catch((fallo) => setError(fallo.message))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [])

  const guardar = async (datos) => {
    await api.marcas.crear(datos)
    setFormulario(false)
    cargar()
  }

  if (cargando) return <p className="aviso">Cargando marcas...</p>

  if (error) return <p className="aviso aviso--error">{error}</p>

  return (
    <>
      <div className="encabezado-pagina">
        <h1>Marcas</h1>
        <button className="btn btn--primario" onClick={() => setFormulario(true)}>
          Nueva marca
        </button>
      </div>

      {marcas.length === 0 ? (
        <p className="aviso">Todavía no hay marcas registradas.</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>N°</th>
                <th>Nombre</th>
                <th>País procedente</th>
              </tr>
            </thead>
            <tbody>
              {marcas.map((marca) => (
                <tr key={marca.idMarca}>
                  <td>{marca.idMarca}</td>
                  <td>{marca.nombre}</td>
                  <td>{marca.pais}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formulario && (
        <div className="modal-fondo" onClick={() => setFormulario(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal__cerrar" onClick={() => setFormulario(false)}>
              ×
            </button>
            <FormularioMarca onGuardar={guardar} onCancelar={() => setFormulario(false)} />
          </div>
        </div>
      )}
    </>
  )
}
