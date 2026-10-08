import { useState } from 'react'

const VACIO = { nombre: '', apellido: '', email: '', genero: '', rol: 'EMPLEADO', clave: '' }

export default function FormularioEmpleado({ inicial, onGuardar, onCancelar }) {
  const esNuevo = !inicial
  const [datos, setDatos] = useState(
    inicial
      ? { nombre: inicial.nombre, apellido: inicial.apellido, email: inicial.email, genero: inicial.genero, rol: inicial.rol, clave: '' }
      : VACIO
  )
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cambiar = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))

  const enviar = async (e) => {
    e.preventDefault()
    if (!datos.nombre.trim() || !datos.apellido.trim() || !datos.email.trim()) {
      setError('Nombre, apellido y email son obligatorios')
      return
    }
    if (esNuevo && !datos.clave) {
      setError('La contraseña es obligatoria al crear un empleado')
      return
    }
    setEnviando(true)
    setError('')
    try {
      await onGuardar(datos, inicial?.idEmpleado)
    } catch (fallo) {
      setError(fallo.message || 'No se pudo guardar el empleado')
      setEnviando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <h2 className="modal__titulo">
        {esNuevo ? 'Nuevo empleado' : 'Editar empleado'}
      </h2>

      <div className="formulario__grilla">
        <label className="campo">
          <span>Nombre *</span>
          <input
            value={datos.nombre}
            onChange={(e) => cambiar('nombre', e.target.value)}
            placeholder="Ej: María"
            required
          />
        </label>

        <label className="campo">
          <span>Apellido *</span>
          <input
            value={datos.apellido}
            onChange={(e) => cambiar('apellido', e.target.value)}
            placeholder="Ej: López"
            required
          />
        </label>

        <label className="campo">
          <span>Email *</span>
          <input
            type="email"
            value={datos.email}
            onChange={(e) => cambiar('email', e.target.value)}
            placeholder="marla@lavandus.com"
            required
          />
        </label>

        <label className="campo">
          <span>Género</span>
          <input
            value={datos.genero}
            onChange={(e) => cambiar('genero', e.target.value)}
            placeholder="Ej: Femenino"
          />
        </label>

        <label className="campo">
          <span>Rol *</span>
          <select value={datos.rol} onChange={(e) => cambiar('rol', e.target.value)}>
            <option value="EMPLEADO">EMPLEADO</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>

        <label className="campo">
          <span>{esNuevo ? 'Contraseña *' : 'Contraseña (opcional)'}</span>
          <input
            type="password"
            value={datos.clave}
            onChange={(e) => cambiar('clave', e.target.value)}
            placeholder={esNuevo ? 'Contraseña' : 'Dejar vacío para no cambiarla'}
            autoComplete="new-password"
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