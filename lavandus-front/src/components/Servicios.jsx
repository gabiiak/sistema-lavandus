import { useEffect, useState, useMemo } from 'react'
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

const ESTADOS_LISTA = [
  { valor: '0', nombre: 'Pendiente' },
  { valor: '1', nombre: 'Programado' },
  { valor: '2', nombre: 'En lavado' },
  { valor: '3', nombre: 'En secado' },
  { valor: '4', nombre: 'En planchado' },
  { valor: '5', nombre: 'Terminado' },
  { valor: '6', nombre: 'Cancelado' },
]

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
  const puedeRegistrar = esAdmin || rol === 'ENCARGADO_OPERACIONES'

  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [formulario, setFormulario] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [programar, setProgramar] = useState(null)
  const [factura, setFactura] = useState(null)
  const [cargandoFactura, setCargandoFactura] = useState(false)

  // Estado para los filtros operativos / tácticos
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    idEmpleado: '',
    idMaquina: '',
    fechaDesde: '',
    fechaHasta: '',
  })

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

  // Listas únicas de empleados y máquinas presentes para los selectores de filtro
  const empleadosUnicos = useMemo(() => {
    const mapa = new Map()
    servicios.forEach((s) => {
      if (s.empleado) mapa.set(s.empleado.idEmpleado, s.empleado)
    })
    return Array.from(mapa.values())
  }, [servicios])

  const maquinasUnicas = useMemo(() => {
    const mapa = new Map()
    servicios.forEach((s) => {
      if (s.maquina) mapa.set(s.maquina.idMaquina, s.maquina)
    })
    return Array.from(mapa.values())
  }, [servicios])

  // Aplicación de los filtros operativos sobre la lista de servicios
  const serviciosFiltrados = useMemo(() => {
    return servicios.filter((s) => {
      if (filtros.estado !== '' && String(s.estado) !== filtros.estado) return false
      if (filtros.idEmpleado !== '' && String(s.empleado?.idEmpleado) !== filtros.idEmpleado)
        return false
      if (filtros.idMaquina !== '') {
        if (filtros.idMaquina === 'SIN_ASIGNAR' && s.maquina) return false
        if (filtros.idMaquina !== 'SIN_ASIGNAR' && String(s.maquina?.idMaquina) !== filtros.idMaquina)
          return false
      }
      if (filtros.busqueda.trim() !== '') {
        const q = filtros.busqueda.toLowerCase()
        const cliente = (s.solicitud?.razonSocial ?? '').toLowerCase()
        const nombre = (s.solicitud?.nombreCliente ?? '').toLowerCase()
        const email = (s.solicitud?.email ?? '').toLowerCase()
        const nro = String(s.idServicio)
        if (!cliente.includes(q) && !nombre.includes(q) && !email.includes(q) && !nro.includes(q)) {
          return false
        }
      }
      if (filtros.fechaDesde && s.fechaAlta) {
        const fechaServ = new Date(s.fechaAlta).setHours(0, 0, 0, 0)
        const desde = new Date(filtros.fechaDesde + 'T00:00:00').getTime()
        if (fechaServ < desde) return false
      }
      if (filtros.fechaHasta && s.fechaAlta) {
        const fechaServ = new Date(s.fechaAlta).setHours(23, 59, 59, 999)
        const hasta = new Date(filtros.fechaHasta + 'T23:59:59').getTime()
        if (fechaServ > hasta) return false
      }
      return true
    })
  }, [servicios, filtros])

  // Cálculo de totales operativos sobre los datos filtrados
  const resumenOperativo = useMemo(() => {
    return serviciosFiltrados.reduce(
      (acc, s) => {
        acc.prendas += contarPrendas(s)
        acc.kilos += Number(s.solicitud?.pesoTotal ?? 0)
        acc.monto += Number(s.solicitud?.precioEstimado ?? 0)
        return acc
      },
      { prendas: 0, kilos: 0, monto: 0 }
    )
  }, [serviciosFiltrados])

  const limpiarFiltros = () =>
    setFiltros({
      busqueda: '',
      estado: '',
      idEmpleado: '',
      idMaquina: '',
      fechaDesde: '',
      fechaHasta: '',
    })

  const crear = async (datos) => {
    await api.servicios.crear(datos)
    setFormulario(false)
    cargar()
  }

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
        {puedeRegistrar && (
          <button className="btn btn--primario" onClick={() => setFormulario(true)}>
            Nuevo servicio
          </button>
        )}
      </div>

      {/* =================================================================
          LISTADO E INFORME OPERATIVO / TÁCTICO (PARAMETRIZADO)
         ================================================================= */}
      <section className="glass-filtros">
        <div className="glass-filtros__encabezado">
          <h3>Informe Operativo y Filtros Tácticos</h3>
          <div className="glass-filtros__acciones">
            <button type="button" className="btn btn--texto" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
            <button type="button" className="btn btn--texto" onClick={() => window.print()}>
              Imprimir listado
            </button>
          </div>
        </div>

        <div className="glass-filtros__grilla">
          <label className="campo">
            <span>Buscar cliente / N°</span>
            <input
              type="text"
              placeholder="Razón social, email o N°..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
            />
          </label>

          <label className="campo">
            <span>Estado</span>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            >
              <option value="">Todos los estados</option>
              {ESTADOS_LISTA.map((est) => (
                <option key={est.valor} value={est.valor}>
                  {est.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="campo">
            <span>Empleado a cargo</span>
            <select
              value={filtros.idEmpleado}
              onChange={(e) => setFiltros({ ...filtros, idEmpleado: e.target.value })}
            >
              <option value="">Todos los empleados</option>
              {empleadosUnicos.map((emp) => (
                <option key={emp.idEmpleado} value={emp.idEmpleado}>
                  {emp.nombre} {emp.apellido}
                </option>
              ))}
            </select>
          </label>

          <label className="campo">
            <span>Máquina asignada</span>
            <select
              value={filtros.idMaquina}
              onChange={(e) => setFiltros({ ...filtros, idMaquina: e.target.value })}
            >
              <option value="">Todas las máquinas</option>
              <option value="SIN_ASIGNAR">Sin máquina asignada</option>
              {maquinasUnicas.map((m) => (
                <option key={m.idMaquina} value={m.idMaquina}>
                  {m.marca?.nombre} {m.modelo} (N° {m.idMaquina})
                </option>
              ))}
            </select>
          </label>

          <label className="campo">
            <span>Fecha alta desde</span>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
            />
          </label>

          <label className="campo">
            <span>Fecha alta hasta</span>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
            />
          </label>
        </div>
      </section>

      {serviciosFiltrados.length === 0 ? (
        <p className="aviso">No se encontraron servicios con los parámetros seleccionados.</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>N°</th>
                <th>Fecha Alta</th>
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
              {serviciosFiltrados.map((s) => {
                const info = estadoServicioInfo(s.estado)
                return (
                  <tr key={s.idServicio}>
                    <td data-label="N°">{s.idServicio}</td>
                    <td data-label="Fecha Alta">{formatearFecha(s.fechaAlta)}</td>
                    <td data-label="Cliente">{s.solicitud?.razonSocial}</td>
                    <td data-label="Email">{s.solicitud?.email}</td>
                    <td data-label="Prendas">{contarPrendas(s)}</td>
                    <td data-label="Empleado a cargo">
                      {s.empleado?.nombre} {s.empleado?.apellido}
                    </td>
                    <td data-label="Máquina">
                      {s.maquina
                        ? `${s.maquina.marca?.nombre ?? ''} ${s.maquina.modelo ?? ''}`.trim()
                        : '—'}
                    </td>
                    <td data-label="Estado">
                      <span className={`estado-badge estado-badge--${info.clase}`}>
                        {info.nombre}
                      </span>
                    </td>
                    <td data-label="Acciones" className="celda-acciones">
                      <button className="btn btn--texto" onClick={() => setDetalle(s)}>
                        Ver
                      </button>
                      {esActivo(s.estado) && (s.estado !== 0 || puedeRegistrar) && (
                        <button
                          className="btn btn--texto"
                          onClick={() =>
                            s.estado === 0
                              ? setProgramar(s)
                              : cambiarEstado(s, SIGUIENTE[s.estado])
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
            <tfoot>
              <tr className="tabla-pie-operativo">
                <td colSpan="4" data-label="Registros">
                  <strong>Totales del listado ({serviciosFiltrados.length} registros):</strong>
                </td>
                <td data-label="Prendas">
                  <strong>{resumenOperativo.prendas} u.</strong>
                </td>
                <td colSpan="2" data-label="Peso total">
                  <strong>Peso total: {resumenOperativo.kilos.toFixed(1)} kg</strong>
                </td>
                <td colSpan="2" data-label="Total estimado">
                  <strong>Total est.: ${resumenOperativo.monto.toLocaleString('es-AR')}</strong>
                </td>
              </tr>
            </tfoot>
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
                <dt>Fecha de alta</dt>
                <dd>{formatearFecha(detalle.fechaAlta)}</dd>
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