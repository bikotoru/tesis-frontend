import { type ChangeEvent } from 'react'
import { leerImagen, revisarImagen, type ImagenAdjunta } from '../archivos.ts'

interface Props {
  id: string
  imagen: ImagenAdjunta | null
  alCambiar: (imagen: ImagenAdjunta | null) => void
  alError: (mensaje: string) => void
}

export default function AdjuntarImagen({ id, imagen, alCambiar, alError }: Props) {
  async function elegir(evento: ChangeEvent<HTMLInputElement>) {
    const archivos = evento.target.files
    evento.target.value = ''
    if (!archivos || archivos.length === 0) {
      return
    }
    const archivo = archivos[0]
    const error = revisarImagen(archivo.type, archivo.size)
    if (error) {
      alError(error)
      return
    }
    try {
      const leida = await leerImagen(archivo)
      alCambiar(leida)
    } catch {
      alError('No se pudo leer la imagen.')
    }
  }

  if (imagen) {
    return (
      <span className="adjunto">
        {imagen.nombre}
        <button type="button" className="enlace" onClick={() => alCambiar(null)}>Quitar</button>
      </span>
    )
  }

  return (
    <>
      <input id={id} type="file" accept="image/jpeg,image/png" className="oculto" onChange={elegir} />
      <label htmlFor={id} className="boton secundario">Adjuntar imagen</label>
    </>
  )
}
