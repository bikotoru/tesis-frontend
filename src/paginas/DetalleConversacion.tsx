import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { api, descargar, mensajeDeError, type RespuestaMensaje } from '../api.ts'
import { guardarArchivo, type ImagenAdjunta } from '../archivos.ts'
import { fechaHora, telefono } from '../formato.ts'
import Telefono from '../componentes/Telefono.tsx'
import AdjuntarImagen from '../componentes/AdjuntarImagen.tsx'
import ImagenMensaje from '../componentes/ImagenMensaje.tsx'

interface Mensaje {
  id: number
  emisor: string
  texto: string
  fecha: string
  cotizacionId: number | null
  tieneImagen: boolean
}

interface Conversacion {
  id: number
  cliente: string | null
  telefono: string
  prueba: boolean
  estado: string
  vendedor: string | null
  ventanaAbierta: boolean
  mensajes: Mensaje[]
}

interface Props {
  esAdministrador: boolean
}

export default function DetalleConversacion({ esAdministrador }: Props) {
  const { id } = useParams()
  const [conversacion, setConversacion] = useState<Conversacion | null>(null)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [texto, setTexto] = useState('')
  const [textoCliente, setTextoCliente] = useState('')
  const [imagen, setImagen] = useState<ImagenAdjunta | null>(null)
  const [imagenCliente, setImagenCliente] = useState<ImagenAdjunta | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    function cargar() {
      api<Conversacion>('/conversaciones/' + id)
        .then(datos => {
          setConversacion(datos)
          setError('')
        })
        .catch((e: Error) => setError(e.message))
    }
    cargar()
    const intervalo = setInterval(cargar, 5000)
    return () => clearInterval(intervalo)
  }, [id, recargar])

  async function accion(ruta: string, cuerpo?: unknown) {
    setOcupado(true)
    setError('')
    setAviso('')
    try {
      const respuesta = await api<RespuestaMensaje>('/conversaciones/' + id + ruta, 'POST', cuerpo)
      setAviso(respuesta.mensaje)
      setRecargar(recargar + 1)
      return true
    } catch (e) {
      setError(mensajeDeError(e))
      return false
    } finally {
      setOcupado(false)
    }
  }

  async function responder(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!texto.trim() && !imagen) {
      return
    }
    const enviado = await accion('/responder', { texto: texto, imagen: imagen })
    if (enviado) {
      setTexto('')
      setImagen(null)
    }
  }

  async function escribirComoCliente(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!textoCliente.trim() && !imagenCliente) {
      return
    }
    const enviado = await accion('/simular', { texto: textoCliente, imagen: imagenCliente })
    if (enviado) {
      setTextoCliente('')
      setImagenCliente(null)
    }
  }

  async function descargarCotizacion(cotizacionId: number) {
    setError('')
    try {
      const archivo = await descargar('/cotizaciones/' + cotizacionId + '/pdf')
      guardarArchivo(archivo, 'Cotizacion-' + cotizacionId + '.pdf')
    } catch (e) {
      setError(mensajeDeError(e))
    }
  }

  if (!conversacion) {
    if (error) {
      return <p className="error" role="alert">{error}</p>
    }
    return <p role="status">Cargando…</p>
  }

  let nombreCliente = telefono(conversacion.telefono)
  if (conversacion.cliente) {
    nombreCliente = conversacion.cliente
  }

  let ventana = 'Cerrada'
  if (conversacion.ventanaAbierta) {
    ventana = 'Abierta'
  }

  const atiendeAsistente = conversacion.estado === 'Asistente'

  return (
    <section>
      <h1>Conversación con {nombreCliente} {conversacion.prueba && <span className="etiqueta">Prueba</span>}</h1>
      {conversacion.prueba && <p className="aviso">Conversación de prueba: los mensajes no se envían por WhatsApp.</p>}
      <p className="ayuda">
        <Telefono numero={conversacion.telefono} /> · Atiende: <span className={'estado ' + conversacion.estado}>{conversacion.estado}</span>
        {conversacion.vendedor && ' (' + conversacion.vendedor + ')'}
        {' '}· Ventana de 24 h: <span className={'estado ' + ventana}>{ventana}</span>
      </p>

      <div className="chat" aria-live="polite">
        {conversacion.mensajes.map(mensaje => (
          <div key={mensaje.id} className={'mensaje ' + mensaje.emisor.toLowerCase()}>
            <p className="autor">{mensaje.emisor} · {fechaHora(mensaje.fecha)}</p>
            <p>{mensaje.texto}</p>
            {mensaje.tieneImagen && <ImagenMensaje ruta={'/conversaciones/' + conversacion.id + '/mensajes/' + mensaje.id + '/imagen'} nombre={'imagen-' + mensaje.id} />}
            {mensaje.cotizacionId && (
              <button type="button" className="enlace" onClick={() => descargarCotizacion(mensaje.cotizacionId!)}>
                Descargar cotización N.º {mensaje.cotizacionId} (PDF)
              </button>
            )}
          </div>
        ))}
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {aviso && <p className="aviso" role="status">{aviso}</p>}

      {conversacion.prueba && esAdministrador && (
        <form className="enviar" onSubmit={escribirComoCliente}>
          <label htmlFor="textoCliente" className="oculto">Mensaje como cliente</label>
          <textarea id="textoCliente" rows={2} maxLength={4096} value={textoCliente} onChange={e => setTextoCliente(e.target.value)} placeholder="Escribe como si fueras el cliente" />
          <AdjuntarImagen id="imagenCliente" imagen={imagenCliente} alCambiar={setImagenCliente} alError={setError} />
          <button className="boton acento" type="submit" disabled={ocupado}>Enviar como cliente</button>
        </form>
      )}

      {atiendeAsistente && (
        <div className="acciones">
          <button type="button" className="boton acento" disabled={ocupado} onClick={() => accion('/tomar')}>Tomar conversación</button>
          <button type="button" className="boton secundario" onClick={() => setRecargar(recargar + 1)}>Actualizar</button>
          <Link className="boton secundario" to="/conversaciones">Volver</Link>
        </div>
      )}

      {!atiendeAsistente && conversacion.ventanaAbierta && (
        <form className="enviar" onSubmit={responder}>
          <label htmlFor="texto" className="oculto">Mensaje para el cliente</label>
          <textarea id="texto" rows={2} maxLength={4096} value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escribe tu respuesta al cliente" />
          <AdjuntarImagen id="imagenVendedor" imagen={imagen} alCambiar={setImagen} alError={setError} />
          <button className="boton" type="submit" disabled={ocupado}>{ocupado ? 'Enviando…' : 'Enviar por WhatsApp'}</button>
        </form>
      )}

      {!atiendeAsistente && !conversacion.ventanaAbierta && (
        <p className="aviso">Pasaron más de 24 horas desde el último mensaje recibido: WhatsApp no permite escribirle hasta que el cliente envíe un mensaje nuevo.</p>
      )}

      {!atiendeAsistente && (
        <div className="acciones">
          <button type="button" className="boton secundario" disabled={ocupado} onClick={() => accion('/devolver')}>Devolver al asistente</button>
          <button type="button" className="boton secundario" onClick={() => setRecargar(recargar + 1)}>Actualizar</button>
          <Link className="boton secundario" to="/conversaciones">Volver</Link>
        </div>
      )}
    </section>
  )
}
