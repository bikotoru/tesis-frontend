import { beforeEach, describe, expect, test, vi } from 'vitest'
import { api, leerMensajeError, mensajeDeError } from './api.ts'
import { guardarSesion, obtenerSesion } from './sesion.ts'

function crearAlmacen() {
  const datos = new Map<string, string>()
  return {
    getItem(clave: string) {
      const valor = datos.get(clave)
      if (valor === undefined) {
        return null
      }
      return valor
    },
    setItem(clave: string, valor: string) {
      datos.set(clave, valor)
    },
    removeItem(clave: string) {
      datos.delete(clave)
    },
  }
}

let rutaPedida = ''
let opcionesPedidas: RequestInit = {}

function simularFetch(estado: number, cuerpo: string | null) {
  globalThis.fetch = async function (ruta: RequestInfo | URL, opciones?: RequestInit) {
    rutaPedida = String(ruta)
    if (opciones) {
      opcionesPedidas = opciones
    }
    return new Response(cuerpo, { status: estado })
  }
}

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', crearAlmacen())
    vi.stubGlobal('location', { href: '' })
    rutaPedida = ''
    opcionesPedidas = {}
  })

  test('devuelve los datos de una respuesta correcta', async () => {
    simularFetch(200, '[{"id":1}]')

    const resultado = await api('/productos')

    expect(resultado).toEqual([{ id: 1 }])
  })

  test('agrega /api al comienzo de la ruta', async () => {
    simularFetch(200, '{}')

    await api('/productos')

    expect(rutaPedida).toBe('/api/productos')
  })

  test('envía el cuerpo como JSON', async () => {
    simularFetch(200, '{}')

    await api('/perfil', 'PUT', { nombre: 'Ana' })

    expect(opcionesPedidas.body).toBe('{"nombre":"Ana"}')
  })

  test('envía el token cuando hay sesión', async () => {
    guardarSesion({ token: 'abc', nombre: 'Ana', correo: 'ana@ferrelupe.cl', rol: 'Vendedor' })
    simularFetch(200, '{}')

    await api('/perfil')

    const cabeceras = new Headers(opcionesPedidas.headers)
    expect(cabeceras.get('Authorization')).toBe('Bearer abc')
  })

  test('lanza el mensaje de error del backend', async () => {
    simularFetch(400, '{"mensaje":"El producto no existe."}')

    const llamada = api('/productos/99')

    await expect(llamada).rejects.toThrow('El producto no existe.')
  })

  test('lanza un error en español si no hay conexión', async () => {
    globalThis.fetch = async function () {
      throw new TypeError('Failed to fetch')
    }

    const llamada = api('/productos')

    await expect(llamada).rejects.toThrow('No se pudo conectar con el servidor.')
  })

  test('con un 401 y sesión iniciada borra la sesión', async () => {
    guardarSesion({ token: 'abc', nombre: 'Ana', correo: 'ana@ferrelupe.cl', rol: 'Vendedor' })
    simularFetch(401, '')

    const llamada = api('/perfil')

    await expect(llamada).rejects.toThrow('Tu sesión expiró. Vuelve a iniciar sesión.')
    expect(obtenerSesion()).toBeNull()
  })

  test('acepta una respuesta correcta sin cuerpo', async () => {
    simularFetch(204, null)

    const resultado = await api('/productos/1', 'DELETE')

    expect(resultado).toBeNull()
  })
})

describe('leerMensajeError', () => {
  test('usa la primera validación de ASP.NET', () => {
    const datos = { errors: { Nombre: ['El nombre es obligatorio.'] } }

    const resultado = leerMensajeError(datos)

    expect(resultado).toBe('El nombre es obligatorio.')
  })

  test('sin datos devuelve el mensaje genérico', () => {
    const resultado = leerMensajeError(null)

    expect(resultado).toBe('No se pudo completar la operación. Inténtalo de nuevo.')
  })
})

describe('mensajeDeError', () => {
  test('devuelve el mensaje de un Error', () => {
    const error = new Error('Falló')

    const resultado = mensajeDeError(error)

    expect(resultado).toBe('Falló')
  })

  test('si no es un Error devuelve el mensaje genérico', () => {
    const resultado = mensajeDeError('texto')

    expect(resultado).toBe('No se pudo completar la operación. Inténtalo de nuevo.')
  })
})
