import { borrarSesion, obtenerSesion } from './sesion.ts'

const errorGenerico = 'No se pudo completar la operación. Inténtalo de nuevo.'

interface RespuestaError {
  mensaje?: string
  errors?: { [campo: string]: string[] }
}

export interface RespuestaMensaje {
  mensaje: string
}

export function leerMensajeError(datos: RespuestaError | null) {
  if (!datos) {
    return errorGenerico
  }
  if (datos.mensaje) {
    return datos.mensaje
  }
  if (datos.errors) {
    const listas = Object.values(datos.errors)
    if (listas.length > 0 && listas[0].length > 0) {
      return listas[0][0]
    }
  }
  return errorGenerico
}

export function mensajeDeError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return errorGenerico
}

export async function api<T>(ruta: string, metodo = 'GET', cuerpo?: unknown): Promise<T> {
  const sesion = obtenerSesion()
  const cabeceras = new Headers()
  if (sesion) {
    cabeceras.set('Authorization', 'Bearer ' + sesion.token)
  }
  let cuerpoTexto = undefined
  if (cuerpo !== undefined) {
    cabeceras.set('Content-Type', 'application/json')
    cuerpoTexto = JSON.stringify(cuerpo)
  }

  let respuesta: Response
  try {
    respuesta = await fetch('/api' + ruta, { method: metodo, headers: cabeceras, body: cuerpoTexto })
  } catch {
    throw new Error('No se pudo conectar con el servidor.')
  }

  if (respuesta.status === 401 && sesion) {
    borrarSesion()
    location.href = '/'
    throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
  }

  let datos = null
  try {
    datos = await respuesta.json()
  } catch {
    datos = null
  }

  if (!respuesta.ok) {
    throw new Error(leerMensajeError(datos))
  }
  return datos
}

export async function descargar(ruta: string): Promise<Blob> {
  const sesion = obtenerSesion()
  const cabeceras = new Headers()
  if (sesion) {
    cabeceras.set('Authorization', 'Bearer ' + sesion.token)
  }

  let respuesta: Response
  try {
    respuesta = await fetch('/api' + ruta, { headers: cabeceras })
  } catch {
    throw new Error('No se pudo conectar con el servidor.')
  }
  if (!respuesta.ok) {
    throw new Error('No se pudo descargar el archivo.')
  }
  return await respuesta.blob()
}
