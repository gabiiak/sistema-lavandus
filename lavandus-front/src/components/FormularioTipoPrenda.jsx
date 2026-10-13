import { useState } from 'react'

const VACIO = { nombre: '', peso: '', precio: '' }

// Alta y edición de tipo de prenda (solo ADMIN). La "tarifa" es el precio unitario.
export default function FormularioTipoPrenda({ inicial, onGuardar, onCancelar }) {
  const esNuevo = !inicial
  const [datos, setDatos] = useState(
    inicial
      ? { nombre: inicial.nombre, peso: String(inicial.peso), precio: String(inicial.precio) }
      : VACIO
  )
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cambiar = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))

  const enviar = async (e) => {
    e.preventDefault()
    const peso = Number(datos.peso)
    const precio = Number(datos.precio)

    if (!datos.nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (!datos.peso || peso <= 0) {
      setError('El peso debe ser mayor a 0')
      return
    }
    if (!datos.precio || precio <= 0) {
      setError('La tarifa debe ser mayor a 0')
      return
    }

    setEnviando(true)
    setError('')
    try {
      await onGuardar({ nombre: datos.nombre.trim(), peso, precio }, inicial?.idTipoPrenda)
    } catch (fallo) {
      setError(fallo.message || 'No se pudo guardar el tipo de prenda')
      setEnviando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <h2 className="modal__titulo">
        {esNuevo ? 'Nuevo tipo de prenda' : 'Editar tipo de prenda'}
      </h2>

      <div className="formulario__grilla">
        <label className="campo">
          <span>Nombre *</span>
          <input
            value={datos.nombre}
            onChange={(e) => cambiar('nombre', e.target.value)}
            placeholder="Ej: Toalla"
            required
          />
        </label>

        <label className="campo">
          <span>Peso estimado (kg) *</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={datos.peso}
            onChange={(e) => cambiar('peso', e.target.value)}
            placeholder="Ej: 0.5"
            required
          />
        </label>

        <label className="campo">
          <span>Tarifa *</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={datos.precio}
            onChange={(e) => cambiar('precio', e.target.value)}
            placeholder="Ej: 1000"
            required
          />
        </label>
      </div>

      {error && <p className="aviso aviso--error">{error}</p>}

      <div className="formulario__acciones">
        <button type="button" className="btn" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primario" disabled={enviando}>
          {enviando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
