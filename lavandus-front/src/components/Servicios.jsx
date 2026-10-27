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

  // Mostrar / ocultar el Dashboard Gerencial
  const [mostrarDashboard, setMostrarDashboard] = useState(true)

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

  // Cálculo de estadísticas estratégicas para el Dashboard Gerencial
  const estadisticas = useMemo(() => {
    const total = servicios.length
    const terminados = servicios.filter((s) => s.estado === 5)
    const cancelados = servicios.filter((s) => s.estado === 6)
    const pendientes = servicios.filter((s) => s.estado === 0)
    const enProceso = servicios.filter((s) => s.estado >= 1 && s.estado <= 4)

    const facturacionTotal = terminados.reduce(
      (acc, s) => acc + Number(s.solicitud?.precioEstimado ?? 0),
      0
    )
    const facturacionProyectada = servicios
      .filter((s) => s.estado !== 6)
      .reduce((acc, s) => acc + Number(s.solicitud?.precioEstimado ?? 0), 0)

    const kilosTotales = servicios
      .filter((s) => s.estado !== 6)
      .reduce((acc, s) => acc + Number(s.solicitud?.pesoTotal ?? 0), 0)

    // Uso y facturación por máquina
    const mapaMaquinas = {}
    servicios.forEach((s) => {
      if (s.maquina && s.estado !== 6) {
        const clave = `${s.maquina.marca?.nombre ?? ''} ${s.maquina.modelo ?? ''} (#${s.maquina.idMaquina})`.trim()
        if (!mapaMaquinas[clave]) mapaMaquinas[clave] = { nombre: clave, cantidad: 0, monto: 0 }
        mapaMaquinas[clave].cantidad += 1
        mapaMaquinas[clave].monto += Number(s.solicitud?.precioEstimado ?? 0)
      }
    })
    const rankingMaquinas = Object.values(mapaMaquinas).sort((a, b) => b.cantidad - a.cantidad)

    // Prendas más demandadas
    const mapaPrendas = {}
    servicios.forEach((s) => {
      if (s.estado !== 6) {
        ;(s.solicitud?.detalles ?? []).forEach((d) => {
          if (!mapaPrendas[d.nombre]) mapaPrendas[d.nombre] = { nombre: d.nombre, cantidad: 0 }
          mapaPrendas[d.nombre].cantidad += d.cantidad
        })
      }
    })
    const rankingPrendas = Object.values(mapaPrendas)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)

    return {
      total,
      terminados: terminados.length,
      cancelados: cancelados.length,
      pendientes: pendientes.length,
      enProceso: enProceso.length,
      facturacionTotal,
      facturacionProyectada,
      kilosTotales,
      rankingMaquinas,
      rankingPrendas,
    }
  }, [servicios])

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
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn"
            onClick={() => setMostrarDashboard((prev) => !prev)}
          >
            {mostrarDashboard ? 'Ocultar Dashboard' : 'Ver Dashboard Gerencial'}
          </button>
          {puedeRegistrar && (
            <button className="btn btn--primario" onClick={() => setFormulario(true)}>
              Nuevo servicio
            </button>
          )}
        </div>
      </div>

      {/* =================================================================
          1. REPORTE GRÁFICO GERENCIAL (NIVEL ESTRATÉGICO - ESTILO GLASS)
         ================================================================= */}
      {mostrarDashboard && (
        <section className="glass-dashboard">
          <div className="glass-header">
            <div>
              <h2 className="glass-title">Reporte Gráfico Gerencial</h2>
              <p className="glass-subtitle">
                Indicadores estratégicos y rendimiento de servicios de lavado
              </p>
            </div>
            <span className="glass-badge">Nivel Estratégico</span>
          </div>

          {/* Tarjetas de KPIs */}
          <div className="glass-kpi-grid">
            <div className="glass-card glass-kpi">
              <span className="glass-kpi__label">Ingresos consolidados (Terminados)</span>
              <strong className="glass-kpi__value">
                ${estadisticas.facturacionTotal.toLocaleString('es-AR')}
              </strong>
              <span className="glass-kpi__meta">
                Proyectado activo: ${estadisticas.facturacionProyectada.toLocaleString('es-AR')}
              </span>
            </div>

            <div className="glass-card glass-kpi">
              <span className="glass-kpi__label">Tasa de finalización</span>
              <strong className="glass-kpi__value">
                {estadisticas.total > 0
                  ? Math.round((estadisticas.terminados / estadisticas.total) * 100)
                  : 0}
                %
              </strong>
              <span className="glass-kpi__meta">
                {estadisticas.terminados} de {estadisticas.total} servicios totales
              </span>
            </div>

            <div className="glass-card glass-kpi">
              <span className="glass-kpi__label">Volumen procesado</span>
              <strong className="glass-kpi__value">
                {estadisticas.kilosTotales.toFixed(1)} kg
              </strong>
              <span className="glass-kpi__meta">
                En {estadisticas.enProceso} servicios activos hoy
              </span>
            </div>

            <div className="glass-card glass-kpi">
              <span className="glass-kpi__label">Ticket promedio</span>
              <strong className="glass-kpi__value">
                $
                {estadisticas.total - estadisticas.cancelados > 0
                  ? Math.round(
                      estadisticas.facturacionProyectada /
                        (estadisticas.total - estadisticas.cancelados)
                    ).toLocaleString('es-AR')
                  : 0}
              </strong>
              <span className="glass-kpi__meta">Por orden de servicio activa</span>
            </div>
          </div>

          {/* Gráficos principales */}
          <div className="glass-charts-grid">
            {/* Gráfico 1: Dona SVG de distribución por estado */}
            <div className="glass-card">
              <h3 className="glass-card__title">Distribución por estado</h3>
              <GraficoDonaEstados estadisticas={estadisticas} />
            </div>

            {/* Gráfico 2: Barras de carga operativa por máquina */}
            <div className="glass-card">
              <h3 className="glass-card__title">Utilización de máquinas lavadoras</h3>
              {estadisticas.rankingMaquinas.length === 0 ? (
                <p className="glass-empty">Sin máquinas asignadas todavía.</p>
              ) : (
                <div className="glass-bars">
                  {estadisticas.rankingMaquinas.map((m) => {
                    const max = estadisticas.rankingMaquinas[0].cantidad || 1
                    const pct = Math.round((m.cantidad / max) * 100)
                    return (
                      <div key={m.nombre} className="glass-bar-item">
                        <div className="glass-bar-header">
                          <span>{m.nombre}</span>
                          <span>
                            <strong>{m.cantidad}</strong> serv. ($
                            {m.monto.toLocaleString('es-AR')})
                          </span>
                        </div>
                        <div className="glass-bar-track">
                          <div
                            className="glass-bar-fill glass-bar-fill--cyan"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Gráfico 3: Top Prendas lavadas */}
            <div className="glass-card">
              <h3 className="glass-card__title">Prendas con mayor demanda (Unidades)</h3>
              {estadisticas.rankingPrendas.length === 0 ? (
                <p className="glass-empty">Sin prendas registradas.</p>
              ) : (
                <div className="glass-bars">
                  {estadisticas.rankingPrendas.map((p) => {
                    const max = estadisticas.rankingPrendas[0].cantidad || 1
                    const pct = Math.round((p.cantidad / max) * 100)
                    return (
                      <div key={p.nombre} className="glass-bar-item">
                        <div className="glass-bar-header">
                          <span>{p.nombre}</span>
                          <strong>{p.cantidad} u.</strong>
                        </div>
                        <div className="glass-bar-track">
                          <div
                            className="glass-bar-fill glass-bar-fill--purple"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =================================================================
          2. LISTADO E INFORME OPERATIVO / TÁCTICO (PARAMETRIZADO)
         ================================================================= */}
      <section className="glass-filtros">
        <div className="glass-filtros__encabezado">
          <h3>Informe Operativo y Filtros Tácticos</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                    <td>{s.idServicio}</td>
                    <td>{formatearFecha(s.fechaAlta)}</td>
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
                <td colSpan="4">
                  <strong>Totales del listado ({serviciosFiltrados.length} registros):</strong>
                </td>
                <td>
                  <strong>{resumenOperativo.prendas} u.</strong>
                </td>
                <td colSpan="2">
                  <strong>Peso total: {resumenOperativo.kilos.toFixed(1)} kg</strong>
                </td>
                <td colSpan="2">
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

// Gráfico de Dona en SVG puro para el Dashboard Glass
function GraficoDonaEstados({ estadisticas }) {
  const segmentos = [
    { label: 'Terminados', valor: estadisticas.terminados, color: '#10b981' },
    { label: 'En Proceso', valor: estadisticas.enProceso, color: '#3b82f6' },
    { label: 'Pendientes', valor: estadisticas.pendientes, color: '#f59e0b' },
    { label: 'Cancelados', valor: estadisticas.cancelados, color: '#ef4444' },
  ]

  const total = estadisticas.total || 1
  const radio = 48
  const circunferencia = 2 * Math.PI * radio
  let acumulado = 0

  return (
    <div className="glass-donut-wrap">
      <svg width="130" height="130" viewBox="0 0 130 130" className="glass-donut-svg">
        <circle
          cx="65"
          cy="65"
          r={radio}
          fill="transparent"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="16"
        />
        {estadisticas.total > 0 &&
          segmentos.map((seg) => {
            const proporcion = seg.valor / total
            const longitud = proporcion * circunferencia
            const offset = -acumulado * circunferencia
            acumulado += proporcion
            if (seg.valor === 0) return null
            return (
              <circle
                key={seg.label}
                cx="65"
                cy="65"
                r={radio}
                fill="transparent"
                stroke={seg.color}
                strokeWidth="16"
                strokeDasharray={`${longitud} ${circunferencia - longitud}`}
                strokeDashoffset={offset}
                transform="rotate(-90 65 65)"
              />
            )
          })}
        <text x="65" y="62" textAnchor="middle" className="glass-donut-total">
          {estadisticas.total}
        </text>
        <text x="65" y="78" textAnchor="middle" className="glass-donut-sub">
          Servicios
        </text>
      </svg>

      <ul className="glass-legend">
        {segmentos.map((s) => (
          <li key={s.label} className="glass-legend__item">
            <span className="glass-legend__dot" style={{ backgroundColor: s.color }} />
            <span className="glass-legend__label">{s.label}</span>
            <strong className="glass-legend__val">{s.valor}</strong>
          </li>
        ))}
      </ul>
    </div>
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