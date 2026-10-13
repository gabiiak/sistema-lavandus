// Capa de acceso a la API.
// TODA comunicación con el backend pasa por acá (fetch con la cookie de sesión).

const BASE_URL = 'http://localhost:8080/api'

// helper central para llamar a la API
async function pedir(path, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // envía la cookie JSESSIONID de la sesión
      ...opciones,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está corriendo el backend?')
  }

  // 204 (sin contenido) => no hay cuerpo que parsear
  if (respuesta.status === 204) return null

  const cuerpo = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    const error = new Error(cuerpo?.mensaje || `Error ${respuesta.status}`)
    error.status = respuesta.status
    throw error
  }

  return cuerpo
}

// helper para descargar archivos binarios (PDF) con la cookie de sesión
async function pedirArchivo(path) {
  let respuesta
  try {
    respuesta = await fetch(`${BASE_URL}${path}`, { credentials: 'include' })
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está corriendo el backend?')
  }

  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => null)
    const error = new Error(cuerpo?.mensaje || `Error ${respuesta.status}`)
    error.status = respuesta.status
    throw error
  }

  return respuesta.blob()
}

export const api = {
  login: (email, clave) =>
    pedir('/auth/login', { method: 'POST', body: JSON.stringify({ email, clave }) }),
  logout: () => pedir('/auth/logout', { method: 'POST' }),

  maquinas: {
    listar: () => pedir('/maquinas'),
    obtener: (id) => pedir(`/maquinas/${id}`),
    crear: (datos) => pedir('/maquinas', { method: 'POST', body: JSON.stringify(datos) }),
    editar: (id, datos) => pedir(`/maquinas/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
    eliminar: (id) => pedir(`/maquinas/${id}`, { method: 'DELETE' }),
  },

  empleados: {
    listar: () => pedir('/empleados'),
    listarPorRol: (rol) => pedir(`/empleados?rol=${encodeURIComponent(rol)}`),
    crear: (datos) => pedir('/empleados', { method: 'POST', body: JSON.stringify(datos) }),
    editar: (id, datos) => pedir(`/empleados/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
    eliminar: (id) => pedir(`/empleados/${id}`, { method: 'DELETE' }),
  },

  marcas: {
    listar: () => pedir('/marcas'),
    crear: (datos) => pedir('/marcas', { method: 'POST', body: JSON.stringify(datos) }),
    editar: (id, datos) => pedir(`/marcas/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  },

  tiposPrenda: {
    listar: () => pedir('/tipos-prenda'),
    crear: (datos) => pedir('/tipos-prenda', { method: 'POST', body: JSON.stringify(datos) }),
    editar: (id, datos) =>
      pedir(`/tipos-prenda/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  },

  solicitudes: {
    crear: (datos) => pedir('/solicitudes', { method: 'POST', body: JSON.stringify(datos) }),
    listar: () => pedir('/solicitudes'),
    disponibles: () => pedir('/solicitudes/disponibles'),
  },

  servicios: {
    listar: () => pedir('/servicios'),
    obtener: (id) => pedir(`/servicios/${id}`),
    crear: (datos) => pedir('/servicios', { method: 'POST', body: JSON.stringify(datos) }),
    actualizar: (id, datos) => pedir(`/servicios/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  },

  facturas: {
    obtenerPorServicio: (idServicio) => pedir(`/facturas/servicio/${idServicio}`),
    enviar: (idServicio) =>
      pedir(`/facturas/servicio/${idServicio}/enviar`, { method: 'POST' }),
    descargarPdf: (idServicio) => pedirArchivo(`/facturas/servicio/${idServicio}/pdf`),
  },
}

// Estados de máquina (deben coincidir con las constantes del backend).
// la clase se usa para el color del badge en la tabla.
export const ESTADOS = {
  0: { nombre: 'Fuera de servicio', clase: 'fuera' },
  1: { nombre: 'Operativa', clase: 'operativa' },
  2: { nombre: 'Ocupada', clase: 'ocupada' },
}

export const estadoInfo = (estado) => ESTADOS[estado] ?? { nombre: 'Desconocido', clase: 'fuera' }

// Estados de servicio (deben coincidir con las constantes del backend).
export const ESTADOS_SERVICIO = {
  0: { nombre: 'Pendiente', clase: 'pendiente' },
  1: { nombre: 'Programada', clase: 'programada' },
  2: { nombre: 'En lavado', clase: 'lavado' },
  3: { nombre: 'En secado', clase: 'secado' },
  4: { nombre: 'En planchado', clase: 'planchado' },
  5: { nombre: 'Terminado', clase: 'terminado' },
  6: { nombre: 'Cancelada', clase: 'cancelada' },
}

export const estadoServicioInfo = (estado) =>
  ESTADOS_SERVICIO[estado] ?? { nombre: 'Desconocido', clase: 'pendiente' }

// Estados de factura (deben coincidir con las constantes del backend).
export const ESTADOS_FACTURA = {
  0: { nombre: 'No enviada', clase: 'cancelada' },
  1: { nombre: 'Enviada', clase: 'terminado' },
}

export const estadoFacturaInfo = (estado) =>
  ESTADOS_FACTURA[estado] ?? { nombre: 'Desconocido', clase: 'pendiente' }