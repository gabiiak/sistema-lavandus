import { useEffect, useState, useMemo } from 'react'
import { api } from '../api.js'

export default function MenuPrincipal({ sesion, onCambiarVista }) {
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const esAdmin = sesion?.rol === 'ADMIN'
  const puedeServicios =
    esAdmin || sesion?.rol === 'ENCARGADO_SERVICIO' || sesion?.rol === 'ENCARGADO_OPERACIONES'

  useEffect(() => {
    setCargando(true)
    setError('')
    api.servicios
      .listar()
      .then(setServicios)
      .catch((fallo) => setError(fallo.message))
      .finally(() => setCargando(false))
  }, [])

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

  return (
    <>
      <div className="encabezado-pagina encabezado-pagina--menu">
        <div>
          <h1>Menú Principal</h1>
          <p className="menu-subtitulo">
            Hola, {sesion?.nombre} {sesion?.apellido} — Panel general de Lavandus
          </p>
        </div>
        <div className="menu-accesos">
          {puedeServicios && (
            <button className="btn btn--primario" onClick={() => onCambiarVista('servicios')}>
              Ir a Servicios
            </button>
          )}
          <button className="btn" onClick={() => onCambiarVista('maquinas')}>
            Máquinas
          </button>
          {esAdmin && (
            <>
              <button className="btn" onClick={() => onCambiarVista('empleados')}>
                Empleados
              </button>
              <button className="btn" onClick={() => onCambiarVista('marcas')}>
                Marcas
              </button>
              <button className="btn" onClick={() => onCambiarVista('tipos-prenda')}>
                Tipos de prenda
              </button>
            </>
          )}
        </div>
      </div>

      {cargando ? (
        <p className="aviso">Cargando dashboard...</p>
      ) : error ? (
        <p className="aviso aviso--error">{error}</p>
      ) : (
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

