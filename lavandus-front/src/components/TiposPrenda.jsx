import { useEffect, useState } from 'react'
import { api } from '../api.js'
import FormularioTipoPrenda from './FormularioTipoPrenda.jsx'

const tarifa = (valor) =>
  Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

// ABM de tipos de prenda (vista solo ADMIN): listar, crear y editar.
export default function TiposPrenda() {
  const [tipos, setTipos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  // formulario: null | 'nuevo' | tipo a editar
  const [formulario, setFormulario] = useState(null)

  const cargar = () => {
    setCargando(true)
    setError('')
    api.tiposPrenda
      .listar()
      .then(setTipos)
      .catch((fallo) => setError(fallo.message))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [])

  const guardar = async (datos, id) => {
    if (id) {
      await api.tiposPrenda.editar(id, datos)
    } else {
      await api.tiposPrenda.crear(datos)
    }
    setFormulario(null)
    cargar()
  }

  if (cargando) return <p className="aviso">Cargando tipos de prenda...</p>

  if (error) return <p className="aviso aviso--error">{error}</p>

  return (
    <>
      <div className="encabezado-pagina">
        <h1>Tipos de prenda</h1>
        <button className="btn btn--primario" onClick={() => setFormulario('nuevo')}>
          Nuevo tipo de prenda
        </button>
      </div>

      {tipos.length === 0 ? (
        <p className="aviso">Todavía no hay tipos de prenda registrados.</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>N°</th>
                <th>Nombre</th>
                <th>Peso estimado</th>
                <th>Tarifa</th>
              </tr>
            </thead>
            <tbody>
              {tipos.map((tipo) => (
                <tr
                  key={tipo.idTipoPrenda}
                  className="fila--clic"
                  title="Seleccionar para editar"
                  onClick={() => setFormulario(tipo)}
                >
                  <td data-label="N°">{tipo.idTipoPrenda}</td>
                  <td data-label="Nombre">{tipo.nombre}</td>
                  <td data-label="Peso estimado">{tipo.peso} kg</td>
                  <td data-label="Tarifa">{tarifa(tipo.precio)}</td>
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
            <FormularioTipoPrenda
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
