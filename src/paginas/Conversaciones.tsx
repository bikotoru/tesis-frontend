import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api.ts'
import { fechaHora } from '../formato.ts'
import Telefono from '../componentes/Telefono.tsx'

interface UltimoMensaje {
  texto: string
  fecha: string
  emisor: string
}

interface ResumenConversacion {
  id: number
  cliente: string | null
  telefono: string
  prueba: boolean
  estado: 'Asistente' | 'Vendedor'
  vendedor: string | null
  ultimo: UltimoMensaje | null
  ventanaAbierta: boolean
}

interface Props {
  esAdministrador: boolean
}

export default function Conversaciones({ esAdministrador }: Props) {
  const [conversaciones, setConversaciones] = useState<ResumenConversacion[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    function cargar() {
      api<ResumenConversacion[]>('/conversaciones')
        .then(datos => {
          setConversaciones(datos)
          setError('')
        })
        .catch((e: Error) => setError(e.message))
    }
    cargar()
    const intervalo = setInterval(cargar, 5000)
    return () => clearInterval(intervalo)
  }, [])

  return (
    <section>
      <h1>Conversaciones de WhatsApp</h1>
      <p className="ayuda">El asistente responde solo. Puedes tomar una conversación para atender tú al cliente.</p>
      {esAdministrador && (
        <div className="acciones">
          <Link className="boton" to="/conversaciones/simular">Simular conversación</Link>
        </div>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      {!conversaciones && !error && <p role="status">Cargando…</p>}
      {conversaciones && conversaciones.length === 0 && <p className="aviso">Todavía no hay conversaciones.</p>}

      {conversaciones && conversaciones.length > 0 && (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Último mensaje</th>
                <th>Atiende</th>
                <th>Ventana de 24 h</th>
                <th><span className="oculto">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {conversaciones.map(c => (
                <tr key={c.id}>
                  <td>
                    {c.cliente ? c.cliente : 'Sin nombre'}
                    {c.prueba && <> <span className="etiqueta">Prueba</span></>}
                  </td>
                  <td><Telefono numero={c.telefono} /></td>
                  <td className="resumen">{c.ultimo && fechaHora(c.ultimo.fecha) + ' · ' + c.ultimo.texto}</td>
                  <td>
                    <span className={'estado ' + c.estado}>{c.estado}</span>
                    {c.vendedor && ' ' + c.vendedor}
                  </td>
                  <td><span className={'estado ' + (c.ventanaAbierta ? 'Abierta' : 'Cerrada')}>{c.ventanaAbierta ? 'Abierta' : 'Cerrada'}</span></td>
                  <td><Link to={'/conversaciones/' + c.id}>Ver</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
