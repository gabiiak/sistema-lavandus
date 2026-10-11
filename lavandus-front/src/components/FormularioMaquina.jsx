import { useEffect, useState } from 'react'
import { api, ESTADOS } from '../api.js'

// Valores por defecto para una máquina nueva
const VACIO = { idMarca: '', tamano: '', modelo: '', periodoMant: '', estado: 1 }

export default function FormularioMaquina({ inicial, onGuardar, onCancelar }) {
  const [marcas, setMarcas] = useState([])
  const [datos, setDatos] = useState(
    inicial
      ? {
          idMarca: inicial.marca?.idMarca ?? '',
          tamano: inicial.tamano ?? '',
          modelo: inicial.modelo ?? '',
          periodoMant: inicial.periodoMant ?? '',
          estado: inicial.estado ?? 1,
        }
      : VACIO
  )
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Cargamos las marcas para el desplegable al abrir el formulario.
  useEffect(() => {
    api.marcas.listar().then(setMarcas).catch(() => {})
  }, [])

  const cambiar = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))

  // La procedencia se deriva del país de la marca elegida (solo lectura).
  const marcaElegida = marcas.find((m) => m.idMarca === Number(datos.idMarca))

  const enviar = async (e) => {
    e.preventDefault()
    if (!datos.idMarca || !datos.modelo.trim()) {
      setError('Marca y modelo son obligatorios')
      return
    }
    setEnviando(true)
    setError('')
    try {
      await onGuardar({ ...datos, marca: { idMarca: Number(datos.idMarca) } }, inicial?.idMaquina)
    } catch (fallo) {
      setError(fallo.message || 'No se pudo guardar la máquina')
      setEnviando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <h2 className="modal__titulo">
        {inicial ? 'Editar máquina' : 'Nueva máquina'}
      </h2>

      <div className="formulario__grilla">
        <label className="campo">
          <span>Marca *</span>
          <select
            value={datos.idMarca}
            onChange={(e) => cambiar('idMarca', e.target.value)}
            required
          >
            <option value="">Seleccioná una marca</option>
            {marcas.map((marca) => (
              <option key={marca.idMarca} value={marca.idMarca}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Modelo *</span>
          <input
            value={datos.modelo}
            onChange={(e) => cambiar('modelo', e.target.value)}
            placeholder="Ej: WW90T"
            required
          />
        </label>

        <label className="campo">
          <span>Tamaño</span>
          <input
            value={datos.tamano}
            onChange={(e) => cambiar('tamano', e.target.value)}
            placeholder="Ej: Grande"
          />
        </label>

        <label className="campo">
          <span>Procedencia</span>
          <input
            value={marcaElegida?.pais ?? ''}
            readOnly
            placeholder="Se completa con la marca"
          />
        </label>

        <label className="campo">
          <span>Período de mantenimiento</span>
          <input
            value={datos.periodoMant}
            onChange={(e) => cambiar('periodoMant', e.target.value)}
            placeholder="Ej: Cada 3 meses"
          />
        </label>

        <label className="campo">
          <span>Estado</span>
          <select
            value={datos.estado}
            onChange={(e) => cambiar('estado', Number(e.target.value))}
          >
            {Object.entries(ESTADOS).map(([codigo, info]) => (
              <option key={codigo} value={Number(codigo)}>
                {info.nombre}
              </option>
            ))}
          </select>
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
