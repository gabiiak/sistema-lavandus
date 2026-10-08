export default function BarraSuperior({ sesion, vista, onCambiarVista, onSalir }) {
  const esAdmin = sesion.rol === 'ADMIN'

  return (
    <header className="barra">
      <div className="barra__marca">
        <span className="barra__logo" aria-hidden="true">L</span>
        <span className="barra__nombre">Lavandus</span>
      </div>

      <nav className="barra__nav">
        <button
          className={vista === 'maquinas' ? 'barra__link activo' : 'barra__link'}
          onClick={() => onCambiarVista('maquinas')}
        >
          Máquinas
        </button>
        {esAdmin && (
          <button
            className={vista === 'empleados' ? 'barra__link activo' : 'barra__link'}
            onClick={() => onCambiarVista('empleados')}
          >
            Empleados
          </button>
        )}
      </nav>

      <div className="barra__usuario">
        <span className="usuario">
          {sesion.nombre} {sesion.apellido}
        </span>
        <span className={'rol-badge ' + (esAdmin ? 'rol-badge--admin' : 'rol-badge--empleado')}>
          {sesion.rol}
        </span>
        <button className="btn btn--texto" onClick={onSalir}>
          Salir
        </button>
      </div>
    </header>
  )
}