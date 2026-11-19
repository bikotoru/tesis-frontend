import { describe, expect, test } from 'vitest'
import { fechaHora, paisDelTelefono, pesos, soloFecha, telefono, total, type Linea } from './formato.ts'

describe('formato', () => {
  test('total suma el precio por la cantidad de cada línea', () => {
    const lineas: Linea[] = [
      { productoId: 1, nombre: 'Pintura', unidad: 'galón', precio: 12990, cantidad: 2 },
      { productoId: 2, nombre: 'Rodillo', unidad: 'unidad', precio: 3500, cantidad: 1 },
    ]

    const resultado = total(lineas)

    expect(resultado).toBe(29480)
  })

  test('total de una lista vacía es cero', () => {
    const lineas: Linea[] = []

    const resultado = total(lineas)

    expect(resultado).toBe(0)
  })

  test('pesos agrega el signo y el punto de miles', () => {
    const valor = 205510

    const resultado = pesos(valor)

    expect(resultado).toBe('$205.510')
  })

  test('soloFecha muestra el día, el mes y el año', () => {
    const fecha = '2026-10-12T15:00:00'

    const resultado = soloFecha(fecha)

    expect(resultado).toBe('12-10-2026')
  })

  test('fechaHora muestra la fecha y la hora', () => {
    const fecha = '2026-10-12T15:30:00'

    const resultado = fechaHora(fecha)

    expect(resultado).toContain('12-10-26')
  })

  test('telefono de Chile se agrupa como celular chileno', () => {
    const numero = '56971252508'

    const resultado = telefono(numero)

    expect(resultado).toBe('+56 9 7125 2508')
  })

  test('telefono de Estados Unidos se agrupa en tres partes', () => {
    const numero = '15556607077'

    const resultado = telefono(numero)

    expect(resultado).toBe('+1 555 660 7077')
  })

  test('telefono de otro país agrupa de a tres cifras', () => {
    const numero = '5491123456789'

    const resultado = telefono(numero)

    expect(resultado).toBe('+54 911 234 567 89')
  })

  test('telefono sin país conocido solo agrega el signo más', () => {
    const numero = '447700900123'

    const resultado = telefono(numero)

    expect(resultado).toBe('+447700900123')
  })

  test('telefono de un cliente de prueba se muestra tal cual', () => {
    const numero = 'PRUEBA-1a2b3c4d'

    const resultado = telefono(numero)

    expect(resultado).toBe('PRUEBA-1a2b3c4d')
  })

  test('paisDelTelefono reconoce el código de tres cifras antes que el de dos', () => {
    const numero = '59171234567'

    const resultado = paisDelTelefono(numero)

    expect(resultado).toEqual({ codigo: '591', sigla: 'bo' })
  })
})
