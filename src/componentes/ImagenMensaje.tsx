import { useEffect, useState } from 'react'
import { descargar } from '../api.ts'
import { guardarArchivo } from '../archivos.ts'

interface Props {
  ruta: string
  nombre: string
}

export default function ImagenMensaje({ ruta, nombre }: Props) {
  const [archivo, setArchivo] = useState<Blob | null>(null)
  const [direccion, setDireccion] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    let creada = ''
    descargar(ruta)
      .then(datos => {
        creada = URL.createObjectURL(datos)
        setArchivo(datos)
        setDireccion(creada)
      })
      .catch(() => setError(true))
    return () => {
      if (creada) {
        URL.revokeObjectURL(creada)
      }
    }
  }, [ruta])

  if (error) {
    return <p className="ayuda">La imagen ya no está disponible.</p>
  }
  if (!archivo) {
    return <p className="ayuda">Cargando imagen…</p>
  }

  return (
    <div className="imagen-mensaje">
      <img src={direccion} alt={'Imagen enviada en el mensaje: ' + nombre} />
      <button type="button" className="enlace" onClick={() => guardarArchivo(archivo, nombre)}>Descargar imagen</button>
    </div>
  )
}
