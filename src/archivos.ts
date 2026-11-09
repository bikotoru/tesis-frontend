export interface ImagenAdjunta {
  nombre: string
  tipo: string
  datos: string
}

export const tamanoMaximoImagen = 3_500_000

export function revisarImagen(tipo: string, tamano: number) {
  if (tipo !== 'image/jpeg' && tipo !== 'image/png') {
    return 'La imagen debe ser JPG o PNG.'
  }
  if (tamano > tamanoMaximoImagen) {
    return 'La imagen puede pesar hasta 3,5 MB.'
  }
  return null
}

export function datosBase64(dataUrl: string) {
  const coma = dataUrl.indexOf(',')
  return dataUrl.slice(coma + 1)
}

export function leerImagen(archivo: File): Promise<ImagenAdjunta> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader()
    lector.onload = () => {
      const imagen: ImagenAdjunta = { nombre: archivo.name, tipo: archivo.type, datos: datosBase64(String(lector.result)) }
      resolver(imagen)
    }
    lector.onerror = () => rechazar(new Error('No se pudo leer la imagen.'))
    lector.readAsDataURL(archivo)
  })
}

export function guardarArchivo(archivo: Blob, nombre: string) {
  const direccion = URL.createObjectURL(archivo)
  const enlace = document.createElement('a')
  enlace.href = direccion
  enlace.download = nombre
  enlace.click()
  URL.revokeObjectURL(direccion)
}
