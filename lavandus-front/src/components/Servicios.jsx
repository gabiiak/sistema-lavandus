import { useEffect, useState } from 'react'
import { api, estadoServicioInfo, estadoFacturaInfo } from '../api.js'
import FormularioServicio from './FormularioServicio.jsx'

// Siguiente estado en la secuencia (debe coincidir con el backend)
const SIGUIENTE = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 }
// Etiqueta de la acción que avanza al siguiente estado
const ACCION = {
  0: 'Programar',
  1: 'Iniciar lavado',
  2: 'Iniciar secado',
  3: 'Iniciar planchado',
  4: 'Terminar',
}

const esActivo = (estado) => estado !== 5 && estado !== 6

const contarPrendas = (servicio) =>
  (servicio.solicitud?.detalles ?? []).reduce((total, d) => total + d.cantidad, 0)

// Formatea un LocalDateTime ISO a dd/mm/aaaa hh:mm
const formatearFecha = (valor) => {
  if (!valor) return '—'
  return new Date(valor).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Servicios({ rol }) {
  const esAdmin = rol === 'ADMIN'
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [formulario, setFormulario] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [programar, setProgramar] = useState(null)
  const [factura, setFactura] = useState(null)
  const [cargandoFactura, setCargandoFactura] = useState(false)

  const cargar = () => {
    setCargando(true)
    setError('')
    api.servicios
      .listar()
      .then(setServicios)
      .catch((fallo) => setError(fallo.message))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [])

  // Al abrir el detalle de un servicio TERMINADO, el ADMIN carga su factura.
  useEffect(() => {
    setFactura(null)
    if (!detalle || !esAdmin || detalle.estado !== 5) return
    setCargandoFactura(true)
    api.facturas
      .obtenerPorServicio(detalle.idServicio)
      .then(setFactura)
      .catch(() => setFactura(null))
      .finally(() => setCargandoFactura(false))
  }, [detalle, esAdmin])

  const crear = async (datos) => {
    await api.servicios.crear(datos)
    setFormulario(false)
    cargar()
  }

  // Cambia el estado del servicio (y la máquina si corresponde)
  const cambiarEstado = async (servicio, estado, idMaquina) => {
    try {
      await api.servicios.actualizar(servicio.idServicio, {
        idEmpleado: servicio.empleado.idEmpleado,
        idMaquina: idMaquina ?? servicio.maquina?.idMaquina ?? null,
        estado,
      })
      setProgramar(null)
      setDetalle(null)
      cargar()
    } catch (fallo) {
      alert(fallo.message)
    }
  }

  const cancelarServicio = (servicio) => {
    if (!confirm('¿Cancelar el servicio? La máquina (si tiene) quedará libre.')) return
    cambiarEstado(servicio, 6)
  }

  // Descarga el PDF de la factura (solo ADMIN)
  const descargarFactura = async (idServicio) => {
    try {
      const blob = await api.facturas.descargarPdf(idServicio)
      const url = URL.createObjectURL(blob)
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = `factura-${idServicio}.pdf`
      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()
      URL.revokeObjectURL(url)
    } catch (fallo) {
      alert(fallo.message)
    }
  }

  // Reintenta el envío por correo de una factura NO_ENVIADA (solo ADMIN)
  const reenviarFactura = async (idServicio) => {
    try {
      const actualizada = await api.facturas.enviar(idServicio)
      setFactura(actualizada)
    } catch (fallo) {
      alert(fallo.message)
    }
  }

  if (cargando) return <p className="aviso">Cargando servicios...</p>

  if (error) return <p className="aviso aviso--error">{error}</p>

  return (
    <>
      <div className="encabezado-pagina">
        <h1>Servicios de lavado</h1>
        <button className="btn btn--primario" onClick={() => setFormulario(true)}>
          Nuevo servicio
        </button>
      </div>

      {servicios.length === 0 ? (
        <p className="aviso">Todavía no hay servicios registrados.</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>N°</th>
                <th>Cliente</th>
                <th>Email</th>
                <th>Prendas</th>
                <th>Empleado a cargo</th>
                <th>Máquina</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => {
                const info = estadoServicioInfo(s.estado)
                return (
                  <tr key={s.idServicio}>
                    <td>{s.idServicio}</td>
                    <td>{s.solicitud?.razonSocial}</td>
                    <td>{s.solicitud?.email}</td>
                    <td>{contarPrendas(s)}</td>
                    <td>
                      {s.empleado?.nombre} {s.empleado?.apellido}
                    </td>
                    <td>
                      {s.maquina
                        ? `${s.maquina.marca?.nombre ?? ''} ${s.maquina.modelo ?? ''}`.trim()
                        : '—'}
                    </td>
                    <td>
                      <span className={`estado-badge estado-badge--${info.clase}`}>
                        {info.nombre}
                      </span>
                    </td>
                    <td className="celda-acciones">
                      <button className="btn btn--texto" onClick={() => setDetalle(s)}>
                        Ver
                      </button>
                      {esActivo(s.estado) && (
                        <button
                          className="btn btn--texto"
                          onClick={() =>
                            s.estado === 0 ? setProgramar(s) : cambiarEstado(s, SIGUIENTE[s.estado])
                          }
                        >
                          {ACCION[s.estado]}
                        </button>
                      )}
                      {esActivo(s.estado) && (
                        <button
                          className="btn btn--texto btn--peligro"
                          onClick={() => cancelarServicio(s)}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: alta (ADMIN o encargado) */}
      {formulario && (
        <div className="modal-fondo" onClick={() => setFormulario(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal__cerrar" onClick={() => setFormulario(false)}>
              ×
            </button>
            <FormularioServicio onGuardar={crear} onCancelar={() => setFormulario(false)} />
          </div>
        </div>
      )}

      {/* Modal: programar (elegir máquina operativa) */}
      {programar && (
        <div className="modal-fondo" onClick={() => setProgramar(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal__cerrar" onClick={() => setProgramar(null)}>
              ×
            </button>
            <ProgramarMaquina
              servicio={programar}
              onGuardar={(idMaquina) => cambiarEstado(programar, 1, idMaquina)}
              onCancelar={() => setProgramar(null)}
            />
          </div>
        </div>
      )}

      {/* Modal: detalle */}
      {detalle && (
        <div className="modal-fondo" onClick={() => setDetalle(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal__cerrar" onClick={() => setDetalle(null)}>
              ×
            </button>
            <h2 className="modal__titulo">Detalle del servicio N° {detalle.idServicio}</h2>
            <dl className="detalle">
              <div className="detalle__fila">
                <dt>Estado</dt>
                <dd>
                  <span
                    className={`estado-badge estado-badge--${estadoServicioInfo(detalle.estado).clase}`}
                  >
                    {estadoServicioInfo(detalle.estado).nombre}
                  </span>
                </dd>
              </div>
              <div className="detalle__fila">
                <dt>Cliente</dt>
                <dd>{detalle.solicitud?.nombreCliente}</dd>
              </div>
              <div className="detalle__fila">
                <dt>Razón social</dt>
                <dd>{detalle.solicitud?.razonSocial}</dd>
              </div>
              <div className="detalle__fila">
                <dt>Email</dt>
                <dd>{detalle.solicitud?.email}</dd>
              </div>
              <div className="detalle__fila">
                <dt>Empleado a cargo</dt>
                <dd>
                  {detalle.empleado?.nombre} {detalle.empleado?.apellido}
                </dd>
              </div>
              <div className="detalle__fila">
                <dt>Máquina</dt>
                <dd>
                  {detalle.maquina
                    ? `${detalle.maquina.marca?.nombre ?? ''} ${detalle.maquina.modelo ?? ''} (N° ${detalle.maquina.idMaquina})`.trim()
                    : 'Sin asignar'}
                </dd>
              </div>
              <div className="detalle__fila">
                <dt>Peso total</dt>
                <dd>{detalle.solicitud?.pesoTotal} kg</dd>
              </div>
              <div className="detalle__fila">
                <dt>Precio estimado</dt>
                <dd>${detalle.solicitud?.precioEstimado}</dd>
              </div>
            </dl>

            <h3 className="cliente-seccion">Prendas</h3>
            <div className="tabla-contenedor">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Prenda</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(detalle.solicitud?.detalles ?? []).map((d) => (
                    <tr key={d.idTipoPrenda}>
                      <td>{d.nombre}</td>
                      <td>{d.cantidad}</td>
                      <td>${d.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {esAdmin && detalle.estado === 5 && (
              <>
                <h3 className="cliente-seccion">Factura</h3>
                {cargandoFactura ? (
                  <p className="aviso">Cargando factura...</p>
                ) : factura ? (
                  <>
                    <dl className="detalle">
                      <div className="detalle__fila">
                        <dt>Estado</dt>
                        <dd>
                          <span
                            className={`estado-badge estado-badge--${estadoFacturaInfo(factura.estado).clase}`}
                          >
                            {estadoFacturaInfo(factura.estado).nombre}
                          </span>
                        </dd>
                      </div>
                      <div className="detalle__fila">
                        <dt>Email destino</dt>
                        <dd>{factura.emailDestino}</dd>
                      </div>
                      <div className="detalle__fila">
                        <dt>Fecha de emisión</dt>
                        <dd>{formatearFecha(factura.fechaEmision)}</dd>
                      </div>
                      {factura.fechaEnvio && (
                        <div className="detalle__fila">
                          <dt>Fecha de envío</dt>
                          <dd>{formatearFecha(factura.fechaEnvio)}</dd>
                        </div>
                      )}
                    </dl>

                    {factura.mensajeError && (
                      <p className="aviso aviso--error">{factura.mensajeError}</p>
                    )}

                    <div className="formulario__acciones">
                      <button
                        className="btn"
                        onClick={() => descargarFactura(detalle.idServicio)}
                      >
                        Descargar PDF
                      </button>
                      {factura.estado === 0 && (
                        <button
                          className="btn btn--primario"
                          onClick={() => reenviarFactura(detalle.idServicio)}
                        >
                          Reenviar
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="aviso">Todavía no hay factura para este servicio.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// Selección de una máquina operativa para programar el servicio
function ProgramarMaquina({ onGuardar, onCancelar }) {
  const [maquinas, setMaquinas] = useState([])
  const [idMaquina, setIdMaquina] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    api.maquinas
      .listar()
      .then((lista) => setMaquinas(lista.filter((m) => m.estado === 1)))
      .catch(() => {})
  }, [])

  const enviar = async (e) => {
    e.preventDefault()
    if (!idMaquina) {
      setError('Seleccioná una máquina operativa')
      return
    }
    setEnviando(true)
    setError('')
    try {
      await onGuardar(Number(idMaquina))
    } catch (fallo) {
      setError(fallo.message || 'No se pudo programar el servicio')
      setEnviando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <h2 className="modal__titulo">Programar servicio</h2>

      <div className="formulario__grilla">
        <label className="campo">
          <span>Máquina operativa *</span>
          <select value={idMaquina} onChange={(e) => setIdMaquina(e.target.value)} required>
            <option value="">Seleccioná una máquina</option>
            {maquinas.map((m) => (
              <option key={m.idMaquina} value={m.idMaquina}>
                {m.marca?.nombre} {m.modelo} (N° {m.idMaquina})
              </option>
            ))}
          </select>
        </label>
      </div>

      {maquinas.length === 0 && <p className="aviso">No hay máquinas operativas disponibles.</p>}

      {error && <p className="aviso aviso--error">{error}</p>}

      <div className="formulario__acciones">
        <button type="button" className="btn" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primario" disabled={enviando}>
          {enviando ? 'Guardando...' : 'Programar'}
        </button>
      </div>
    </form>
  )
}
