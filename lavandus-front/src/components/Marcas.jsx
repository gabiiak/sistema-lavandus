import { useEffect, useState } from 'react'
import { api } from '../api.js'
import FormularioMarca from './FormularioMarca.jsx'

// ABM de marcas (vista solo ADMIN): listar, crear y editar.
export default function Marcas() {
  const [marcas, setMarcas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  // formulario: null | 'nueva' | marca a editar
  const [formulario, setFormulario] = useState(null)

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

  const guardar = async (datos, id) => {
    if (id) {
      await api.marcas.editar(id, datos)
    } else {
      await api.marcas.crear(datos)
    }
    setFormulario(null)
    cargar()
  }

  if (cargando) return <p className="aviso">Cargando marcas...</p>

  if (error) return <p className="aviso aviso--error">{error}</p>

  return (
    <>
      <div className="encabezado-pagina">
        <h1>Marcas</h1>
        <button className="btn btn--primario" onClick={() => setFormulario('nueva')}>
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
                <tr
                  key={marca.idMarca}
                  className="fila--clic"
                  title="Seleccionar para editar"
                  onClick={() => setFormulario(marca)}
                >
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
        <div className="modal-fondo" onClick={() => setFormulario(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal__cerrar" onClick={() => setFormulario(null)}>
              ×
            </button>
            <FormularioMarca
              inicial={formulario === 'nueva' ? null : formulario}
              onGuardar={guardar}
              onCancelar={() => setFormulario(null)}
            />
          </div>
        </div>
      )}
    </>
  )
}
