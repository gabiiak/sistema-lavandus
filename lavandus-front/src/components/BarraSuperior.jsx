export default function BarraSuperior({ sesion, vista, onCambiarVista, onSalir }) {
  const esAdmin = sesion.rol === 'ADMIN'
  const esEncargado =
    sesion.rol === 'ENCARGADO_SERVICIO' || sesion.rol === 'ENCARGADO_OPERACIONES'

  return (
    <header className="barra">
      <div
        className="barra__marca"
        onClick={() => onCambiarVista('inicio')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onCambiarVista('inicio')
        }}
        title="Ir al menú principal"
      >
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
        {(esAdmin || esEncargado) && (
          <button
            className={vista === 'servicios' ? 'barra__link activo' : 'barra__link'}
            onClick={() => onCambiarVista('servicios')}
          >
            Servicios
          </button>
        )}
        {esAdmin && (
          <button
            className={vista === 'empleados' ? 'barra__link activo' : 'barra__link'}
            onClick={() => onCambiarVista('empleados')}
          >
            Empleados
          </button>
        )}
        {esAdmin && (
          <button
            className={vista === 'marcas' ? 'barra__link activo' : 'barra__link'}
            onClick={() => onCambiarVista('marcas')}
          >
            Marcas
          </button>
        )}
        {esAdmin && (
          <button
            className={vista === 'tipos-prenda' ? 'barra__link activo' : 'barra__link'}
            onClick={() => onCambiarVista('tipos-prenda')}
          >
            Tipos de prenda
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