import { beforeEach, describe, expect, test, vi } from 'vitest'
import { borrarSesion, guardarSesion, obtenerSesion, type Sesion } from './sesion.ts'

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

const sesionDePrueba: Sesion = { token: 'abc', nombre: 'Ana', correo: 'ana@ferrelupe.cl', rol: 'Vendedor' }

describe('sesion', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', crearAlmacen())
  })

  test('sin sesión guardada devuelve null', () => {
    const resultado = obtenerSesion()

    expect(resultado).toBeNull()
  })

  test('devuelve la sesión que se guardó', () => {
    guardarSesion(sesionDePrueba)

    const resultado = obtenerSesion()

    expect(resultado).toEqual(sesionDePrueba)
  })

  test('después de borrarla ya no hay sesión', () => {
    guardarSesion(sesionDePrueba)

    borrarSesion()

    expect(obtenerSesion()).toBeNull()
  })
})
