import { useEffect, useState } from 'react'
import { api, estadoInfo } from '../api.js'
import FormularioMaquina from './FormularioMaquina.jsx'

export default function Maquinas({ rol }) {
  const [maquinas, setMaquinas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  // formulario: null | 'nueva' | máquina a editar
  const [formulario, setFormulario] = useState(null)
  // detalle: máquina seleccionada para ver / null
  const [detalle, setDetalle] = useState(null)

  const esAdmin = rol === 'ADMIN'

  const cargar = () => {
    setCargando(true)
    setError('')
    api.maquinas
      .listar()
      .then(setMaquinas)
      .catch((fallo) => setError(fallo.message))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [])

  const guardar = async (datos, id) => {
    if (id) {
      await api.maquinas.editar(id, datos)
    } else {
      await api.maquinas.crear(datos)
    }
    setFormulario(null)
    cargar()
  }

  const eliminar = async (maquina) => {
    if (!confirm(`¿Eliminar la máquina ${maquina.marca} ${maquina.modelo}?`)) return
    try {
      await api.maquinas.eliminar(maquina.idMaquina)
      cargar()
    } catch (fallo) {
      alert(fallo.message)
    }
  }

  if (cargando) return <p className="aviso">Cargando máquinas...</p>

  if (error) return <p className="aviso aviso--error">{error}</p>

  return (
    <>
      <div className="encabezado-pagina">
        <h1>Máquinas de lavandería</h1>
        {esAdmin && (
          <button className="btn btn--primario" onClick={() => setFormulario('nueva')}>
            Nueva máquina
          </button>
        )}
      </div>

      {maquinas.length === 0 ? (
        <p className="aviso">Todavía no hay máquinas registradas.</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>N°</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Tamaño</th>
                <th>Procedencia</th>
                <th>Período mant.</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {maquinas.map((m) => {
                const info = estadoInfo(m.estado)
                return (
                  <tr key={m.idMaquina}>
                    <td>{m.idMaquina}</td>
                    <td>{m.marca}</td>
                    <td>{m.modelo}</td>
                    <td>{m.tamano}</td>
                    <td>{m.procedencia}</td>
                    <td>{m.periodoMant}</td>
                    <td>
                      <span className={`estado-badge estado-badge--${info.clase}`}>
                        {info.nombre}
                      </span>
                    </td>
                    <td className="celda-acciones">
                      <button className="btn btn--texto" onClick={() => setDetalle(m)}>
                        Ver
                      </button>
                      {esAdmin && (
                        <>
                          <button className="btn btn--texto" onClick={() => setFormulario(m)}>
                            Editar
                          </button>
                          <button className="btn btn--texto btn--peligro" onClick={() => eliminar(m)}>
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: alta o edición (solo admin) */}
      {formulario && (
        <div className="modal-fondo" onClick={() => setFormulario(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal__cerrar" onClick={() => setFormulario(null)}>
              ×
            </button>
            <FormularioMaquina
              inicial={formulario === 'nueva' ? null : formulario}
              onGuardar={guardar}
              onCancelar={() => setFormulario(null)}
            />
          </div>
        </div>
      )}

      {/* Modal: ver detalle (todos) */}
      {detalle && (
        <div className="modal-fondo" onClick={() => setDetalle(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal__cerrar" onClick={() => setDetalle(null)}>
              ×
            </button>
            <h2 className="modal__titulo">Detalle de la máquina</h2>
            <dl className="detalle">
              <div className="detalle__fila">
                <dt>N°</dt>
                <dd>{detalle.idMaquina}</dd>
              </div>
              <div className="detalle__fila">
                <dt>Marca</dt>
                <dd>{detalle.marca}</dd>
              </div>
              <div className="detalle__fila">
                <dt>Modelo</dt>
                <dd>{detalle.modelo}</dd>
              </div>
              <div className="detalle__fila">
                <dt>Tamaño</dt>
                <dd>{detalle.tamano}</dd>
              </div>
              <div className="detalle__fila">
                <dt>Procedencia</dt>
                <dd>{detalle.procedencia}</dd>
              </div>
              <div className="detalle__fila">
                <dt>Período de mantenimiento</dt>
                <dd>{detalle.periodoMant}</dd>
              </div>
              <div className="detalle__fila">
                <dt>Estado</dt>
                <dd>
                  <span className={`estado-badge estado-badge--${estadoInfo(detalle.estado).clase}`}>
                    {estadoInfo(detalle.estado).nombre}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </>
  )
}