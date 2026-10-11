import { useState } from 'react'

const VACIO = { nombre: '', pais: '' }

// Alta de marca (solo ADMIN). El campo país es la procedencia de la marca.
export default function FormularioMarca({ onGuardar, onCancelar }) {
  const [datos, setDatos] = useState(VACIO)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cambiar = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))

  const enviar = async (e) => {
    e.preventDefault()
    if (!datos.nombre.trim() || !datos.pais.trim()) {
      setError('Nombre y país son obligatorios')
      return
    }
    setEnviando(true)
    setError('')
    try {
      await onGuardar(datos)
    } catch (fallo) {
      setError(fallo.message || 'No se pudo guardar la marca')
      setEnviando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <h2 className="modal__titulo">Nueva marca</h2>

      <div className="formulario__grilla">
        <label className="campo">
          <span>Nombre *</span>
          <input
            value={datos.nombre}
            onChange={(e) => cambiar('nombre', e.target.value)}
            placeholder="Ej: Samsung"
            required
          />
        </label>

        <label className="campo">
          <span>País procedente *</span>
          <input
            value={datos.pais}
            onChange={(e) => cambiar('pais', e.target.value)}
            placeholder="Ej: Corea del Sur"
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
