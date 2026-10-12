import { useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'

const FILA_VACIA = { idTipoPrenda: '', cantidad: 1 }

const formatearPrecio = (valor) =>
  '$ ' + Number(valor).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatearPeso = (valor) =>
  Number(valor).toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' kg'

// Vista pública del cliente: elegir prendas, ver el estimado y enviar la solicitud.
export default function VistaCliente() {
  const [tipos, setTipos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  const [nombreCliente, setNombreCliente] = useState('')
  const [email, setEmail] = useState('')
  const [razonSocial, setRazonSocial] = useState('')
  const [filas, setFilas] = useState([{ ...FILA_VACIA }])

  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [confirmacion, setConfirmacion] = useState(null)

  useEffect(() => {
    api.tiposPrenda
      .listar()
      .then(setTipos)
      .catch((fallo) => setErrorCarga(fallo.message))
      .finally(() => setCargando(false))
  }, [])

  const tipoPorId = (id) => tipos.find((t) => t.idTipoPrenda === Number(id))

  // Totales estimados en vivo (el backend recalcula el valor definitivo)
  const { pesoTotal, precioEstimado } = useMemo(() => {
    let peso = 0
    let precio = 0
    for (const fila of filas) {
      const tipo = tipoPorId(fila.idTipoPrenda)
      const cantidad = Number(fila.cantidad)
      if (tipo && cantidad > 0) {
        peso += tipo.peso * cantidad
        precio += tipo.precio * cantidad
      }
    }
    return { pesoTotal: peso, precioEstimado: precio }
  }, [filas, tipos])

  const cambiarFila = (indice, campo, valor) =>
    setFilas((actuales) => actuales.map((f, i) => (i === indice ? { ...f, [campo]: valor } : f)))

  const agregarFila = () => setFilas((actuales) => [...actuales, { ...FILA_VACIA }])

  const quitarFila = (indice) => setFilas((actuales) => actuales.filter((_, i) => i !== indice))

  const enviar = async (e) => {
    e.preventDefault()
    setError('')

    if (!nombreCliente.trim() || !email.trim() || !razonSocial.trim()) {
      setError('Completá nombre, email y razón social')
      return
    }

    const detalles = filas
      .filter((f) => f.idTipoPrenda !== '' && Number(f.cantidad) > 0)
      .map((f) => ({ idTipoPrenda: Number(f.idTipoPrenda), cantidad: Number(f.cantidad) }))

    if (detalles.length === 0) {
      setError('Agregá al menos una prenda con su cantidad')
      return
    }

    setEnviando(true)
    try {
      const solicitud = await api.solicitudes.crear({ nombreCliente, email, razonSocial, detalles })
      setConfirmacion(solicitud)
    } catch (fallo) {
      setError(fallo.message || 'No se pudo registrar la solicitud')
      setEnviando(false)
    }
  }

  const reiniciar = () => {
    setNombreCliente('')
    setEmail('')
    setRazonSocial('')
    setFilas([{ ...FILA_VACIA }])
    setError('')
    setEnviando(false)
    setConfirmacion(null)
  }

  return (
    <div className="cliente-fondo">
      <div className="cliente-contenedor">
        <header className="cliente-cabecera">
          <div className="login-logo" aria-hidden="true">L</div>
          <h1 className="cliente-titulo">Lavandus</h1>
          <p className="cliente-subtitulo">Solicitá el lavado de tus prendas</p>
        </header>

        {confirmacion ? (
          <div className="cliente-exito">
            <h2>¡Solicitud recibida!</h2>
            <p className="cliente-subtitulo">
              Gracias {confirmacion.nombreCliente}, registramos tu pedido N° {confirmacion.idSolicitud}.
            </p>
            <dl className="detalle">
              <div className="detalle__fila">
                <dt>Peso total</dt>
                <dd>{formatearPeso(confirmacion.pesoTotal)}</dd>
              </div>
              <div className="detalle__fila">
                <dt>Precio estimado</dt>
                <dd>{formatearPrecio(confirmacion.precioEstimado)}</dd>
              </div>
            </dl>
            <div className="formulario__acciones">
              <button className="btn btn--primario" onClick={reiniciar}>
                Cargar otra solicitud
              </button>
            </div>
          </div>
        ) : cargando ? (
          <p className="aviso">Cargando prendas...</p>
        ) : errorCarga ? (
          <p className="aviso aviso--error">{errorCarga}</p>
        ) : (
          <form onSubmit={enviar}>
            <div className="formulario__grilla">
              <label className="campo">
                <span>Nombre y apellido *</span>
                <input
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </label>
              <label className="campo">
                <span>Email *</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@email.com"
                  required
                />
              </label>
              <label className="campo">
                <span>Razón social *</span>
                <input
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  placeholder="Ej: Hotel Los Alerces"
                  required
                />
              </label>
            </div>

            <h2 className="cliente-seccion">Prendas</h2>
            <div className="cliente-filas">
              {filas.map((fila, indice) => (
                <div className="cliente-fila" key={indice}>
                  <label className="campo">
                    <span>Tipo de prenda</span>
                    <select
                      value={fila.idTipoPrenda}
                      onChange={(e) => cambiarFila(indice, 'idTipoPrenda', e.target.value)}
                    >
                      <option value="">Seleccioná...</option>
                      {tipos.map((tipo) => (
                        <option key={tipo.idTipoPrenda} value={tipo.idTipoPrenda}>
                          {tipo.nombre} ({formatearPeso(tipo.peso)})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="campo">
                    <span>Cantidad</span>
                    <input
                      type="number"
                      min="1"
                      value={fila.cantidad}
                      onChange={(e) => cambiarFila(indice, 'cantidad', e.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn btn--peligro cliente-quitar"
                    onClick={() => quitarFila(indice)}
                    disabled={filas.length === 1}
                    title="Quitar prenda"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="btn cliente-agregar" onClick={agregarFila}>
              + Agregar prenda
            </button>

            <div className="cliente-resumen">
              <div className="cliente-resumen__dato">
                <span className="cliente-resumen__etiqueta">Peso total</span>
                <span className="cliente-resumen__valor">{formatearPeso(pesoTotal)}</span>
              </div>
              <div className="cliente-resumen__dato">
                <span className="cliente-resumen__etiqueta">Precio estimado</span>
                <span className="cliente-resumen__valor">{formatearPrecio(precioEstimado)}</span>
              </div>
            </div>

            {error && <p className="aviso aviso--error">{error}</p>}

            <div className="formulario__acciones">
              <button type="submit" className="btn btn--primario" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
