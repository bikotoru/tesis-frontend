export interface Linea {
  productoId: number
  nombre: string
  unidad: string
  precio: number
  cantidad: number
}

export function total(lineas: Linea[]) {
  let suma = 0
  for (const linea of lineas) {
    suma = suma + linea.precio * linea.cantidad
  }
  return suma
}

export function pesos(valor: number) {
  return '$' + valor.toLocaleString('es-CL')
}

export function soloFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-CL')
}

export function fechaHora(fecha: string) {
  return new Date(fecha).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })
}

export interface Pais {
  codigo: string
  sigla: string
}

const paises: Pais[] = [
  { codigo: '591', sigla: 'bo' },
  { codigo: '593', sigla: 'ec' },
  { codigo: '595', sigla: 'py' },
  { codigo: '598', sigla: 'uy' },
  { codigo: '56', sigla: 'cl' },
  { codigo: '54', sigla: 'ar' },
  { codigo: '51', sigla: 'pe' },
  { codigo: '57', sigla: 'co' },
  { codigo: '52', sigla: 'mx' },
  { codigo: '58', sigla: 've' },
  { codigo: '34', sigla: 'es' },
  { codigo: '1', sigla: 'us' },
]

export function paisDelTelefono(numero: string) {
  for (const pais of paises) {
    if (numero.startsWith(pais.codigo)) {
      return pais
    }
  }
  return null
}

export function telefono(numero: string) {
  if (!/^\d+$/.test(numero)) {
    return numero
  }
  const pais = paisDelTelefono(numero)
  if (pais === null) {
    return '+' + numero
  }

  const resto = numero.slice(pais.codigo.length)
  if (pais.sigla === 'cl' && resto.length === 9) {
    return '+56 ' + resto.slice(0, 1) + ' ' + resto.slice(1, 5) + ' ' + resto.slice(5)
  }
  if (pais.sigla === 'us' && resto.length === 10) {
    return '+1 ' + resto.slice(0, 3) + ' ' + resto.slice(3, 6) + ' ' + resto.slice(6)
  }

  const grupos: string[] = []
  for (let i = 0; i < resto.length; i = i + 3) {
    grupos.push(resto.slice(i, i + 3))
  }
  return '+' + pais.codigo + ' ' + grupos.join(' ')
}
