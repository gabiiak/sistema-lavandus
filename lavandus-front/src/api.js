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
    crear: (datos) => pedir('/empleados', { method: 'POST', body: JSON.stringify(datos) }),
    editar: (id, datos) => pedir(`/empleados/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
    eliminar: (id) => pedir(`/empleados/${id}`, { method: 'DELETE' }),
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