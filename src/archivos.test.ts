import { describe, expect, test } from 'vitest'
import { datosBase64, revisarImagen } from './archivos.ts'

describe('archivos', () => {
  test('revisarImagen acepta un JPG liviano', () => {
    const resultado = revisarImagen('image/jpeg', 1000)

    expect(resultado).toBeNull()
  })

  test('revisarImagen rechaza otros formatos', () => {
    const resultado = revisarImagen('image/gif', 1000)

    expect(resultado).toBe('La imagen debe ser JPG o PNG.')
  })

  test('revisarImagen rechaza imágenes de más de 3,5 MB', () => {
    const resultado = revisarImagen('image/png', 4_000_000)

    expect(resultado).toBe('La imagen puede pesar hasta 3,5 MB.')
  })

  test('datosBase64 quita el encabezado del data URL', () => {
    const resultado = datosBase64('data:image/png;base64,AAEC')

    expect(resultado).toBe('AAEC')
  })
})
