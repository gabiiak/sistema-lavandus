import { useEffect, useState } from 'react'
import { api, estadoInfo } from '../api.js'
import { descargarXlsx } from '../exportarXlsx.js'
import FormularioMaquina from './FormularioMaquina.jsx'

export default function Maquinas({ rol, sesion }) {
  const [maquinas, setMaquinas] = useState([])
  const [servicios, setServicios] = useState([])
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
    Promise.all([
      api.maquinas.listar(),
      api.servicios.listar().catch(() => []),
    ])
      .then(([listaMaquinas, listaServicios]) => {
        setMaquinas(listaMaquinas)
        setServicios(listaServicios)
      })
      .catch((fallo) => setError(fallo.message))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [])

  const exportarReporte = () => {
    if (maquinas.length === 0) {
      alert('No hay máquinas registradas para exportar.')
      return
    }

    const ahora = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const fechaHoraEmision = `${pad(ahora.getDate())}/${pad(ahora.getMonth() + 1)}/${ahora.getFullYear()} ${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`
    const generadoPor = sesion
      ? `${sesion.nombre} ${sesion.apellido} (${sesion.rol})`
      : 'Lavandus'

    // Solo se cuentan los servicios TERMINADOS (estado 5)
    const filasDetalle = maquinas.map((m) => {
      const servsMaquina = servicios.filter(
        (s) => s.maquina?.idMaquina === m.idMaquina && s.estado === 5
      )
      const facturacion = servsMaquina.reduce(
        (acc, s) => acc + Number(s.solicitud?.precioEstimado ?? 0),
        0
      )
      return {
        id_maquina: m.idMaquina,
        marca: m.marca?.nombre ?? 'Sin marca',
        modelo: m.modelo ?? '-',
        tamano: m.tamano,
        procedencia: m.marca?.pais ?? 'Argentina',
        periodo_mant: m.periodoMant ?? 'Trimestral',
        estado_codigo: m.estado,
        estado_nombre: estadoInfo(m.estado).nombre,
        servicios_completados: servsMaquina.length,
        facturacion_acumulada: facturacion,
      }
    })

    const totalMaquinas = filasDetalle.length
    const operativas = filasDetalle.filter((f) => f.estado_codigo === 1).length
    const ocupadas = filasDetalle.filter((f) => f.estado_codigo === 2).length
    const fueraDeServicio = filasDetalle.filter((f) => f.estado_codigo === 0).length
    const capacidadTotalKg = filasDetalle.reduce((acc, f) => acc + f.tamano, 0)
    const promedioCapacidadKg = Number((capacidadTotalKg / totalMaquinas).toFixed(2))
    const totalServicios = filasDetalle.reduce((acc, f) => acc + f.servicios_completados, 0)
    const ingresosTotales = filasDetalle.reduce((acc, f) => acc + f.facturacion_acumulada, 0)

    const filasXlsx = [
      { estilo: 1, celdas: ['Lavandus', ''] },
      { celdas: [{ v: 'Reporte de estado y rendimiento de máquinas', s: 4 }, { v: '', s: 3 }] },
      { celdas: [{ v: 'Fecha y hora de emisión', s: 4 }, { v: fechaHoraEmision, s: 3 }] },
      { celdas: [{ v: 'Generado por', s: 4 }, { v: generadoPor, s: 3 }] },
      { celdas: [] },
      {
        estilo: 2,
        celdas: [
          'Total de máquinas',
          'Operativas',
          'Ocupadas',
          'Fuera de servicio',
          'Capacidad instalada (kg)',
          'Capacidad promedio (kg)',
          'Servicios completados',
          'Ingresos generados (ARS)',
        ],
      },
      {
        estilo: 3,
        celdas: [
          totalMaquinas,
          operativas,
          ocupadas,
          fueraDeServicio,
          { v: capacidadTotalKg, s: 6 },
          { v: promedioCapacidadKg, s: 6 },
          totalServicios,
          { v: ingresosTotales, s: 5 },
        ],
      },
      { celdas: [] },
      {
        estilo: 2,
        celdas: [
          'N°',
          'Marca',
          'Modelo',
          'Capacidad (kg)',
          'Procedencia',
          'Período de mantenimiento',
          'Código de estado',
          'Estado',
          'Servicios completados',
          'Facturación acumulada (ARS)',
        ],
      },
      ...filasDetalle.map((f) => ({
        estilo: 3,
        celdas: [
          f.id_maquina,
          f.marca,
          f.modelo,
          { v: f.tamano, s: 6 },
          f.procedencia,
          f.periodo_mant,
          f.estado_codigo,
          f.estado_nombre,
          f.servicios_completados,
          { v: f.facturacion_acumulada, s: 5 },
        ],
      })),
    ]

    const anchosColumna = [12, 16, 14, 16, 16, 24, 16, 18, 22, 28]
    descargarXlsx(
      `reporte-maquinas-lavandus-${ahora.toISOString().slice(0, 10)}.xlsx`,
      'Reporte de máquinas',
      filasXlsx,
      anchosColumna
    )
  }

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
    if (!confirm(`¿Eliminar la máquina ${maquina.marca?.nombre ?? ''} ${maquina.modelo}?`)) return
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
        <div className="menu-accesos">
          <button className="btn" onClick={exportarReporte}>
            Exportar reporte (.xlsx)
          </button>
          {esAdmin && (
            <button className="btn btn--primario" onClick={() => setFormulario('nueva')}>
              Nueva máquina
            </button>
          )}
        </div>
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
                <th>Capacidad</th>
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
                    <td data-label="N°">{m.idMaquina}</td>
                    <td data-label="Marca">{m.marca?.nombre}</td>
                    <td data-label="Modelo">{m.modelo}</td>
                    <td data-label="Capacidad">{m.tamano} kg</td>
                    <td data-label="Procedencia">{m.marca?.pais}</td>
                    <td data-label="Período mant.">{m.periodoMant}</td>
                    <td data-label="Estado">
                      <span className={`estado-badge estado-badge--${info.clase}`}>
                        {info.nombre}
                      </span>
                    </td>
                    <td data-label="Acciones" className="celda-acciones">
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
                <dd>{detalle.marca?.nombre}</dd>
              </div>
              <div className="detalle__fila">
                <dt>Modelo</dt>
                <dd>{detalle.modelo}</dd>
              </div>
              <div className="detalle__fila">
                <dt>Capacidad</dt>
                <dd>{detalle.tamano} kg</dd>
              </div>
              <div className="detalle__fila">
                <dt>Procedencia</dt>
                <dd>{detalle.marca?.pais}</dd>
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