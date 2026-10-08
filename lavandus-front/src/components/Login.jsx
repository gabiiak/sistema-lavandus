import { useState } from 'react'

export default function Login({ onIngresar }) {
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      await onIngresar(email, clave)
    } catch (fallo) {
      setError(fallo.message || 'No se pudo iniciar sesión')
      setEnviando(false)
    }
  }

  return (
    <div className="login-fondo">
      <form className="login-tarjeta" onSubmit={enviar}>
        <div className="login-logo" aria-hidden="true">L</div>
        <h1 className="login-titulo">Lavandus</h1>
        <p className="login-subtitulo">Ingresá con tu cuenta</p>

        <label className="campo">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="username"
            required
          />
        </label>

        <label className="campo">
          <span>Contraseña</span>
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="aviso aviso--error">{error}</p>}

        <button
          type="submit"
          className="btn btn--primario btn--ancho"
          disabled={enviando}
        >
          {enviando ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  )
}