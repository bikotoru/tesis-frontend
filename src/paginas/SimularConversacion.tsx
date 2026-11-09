import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { api, mensajeDeError } from '../api.ts'

interface ConversacionCreada {
  id: number
  mensaje: string
}

export default function SimularConversacion() {
  const navegar = useNavigate()
  const [nombre, setNombre] = useState('')
  const [texto, setTexto] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function crear(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setGuardando(true)
    setError('')
    try {
      const creada = await api<ConversacionCreada>('/conversaciones/simular', 'POST', { nombre: nombre, texto: texto })
      navegar('/conversaciones/' + creada.id)
    } catch (e) {
      setError(mensajeDeError(e))
      setGuardando(false)
    }
  }

  return (
    <section>
      <h1>Simular conversación</h1>
      <p className="ayuda">Escribe como si fueras un cliente para ver cómo responde el asistente. Los mensajes no se envían por WhatsApp y la conversación queda marcada como prueba.</p>
      <form className="tarjeta" onSubmit={crear}>
        <div className="campo">
          <label htmlFor="nombre">Nombre del cliente (opcional)</label>
          <input id="nombre" maxLength={100} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Cliente de prueba" />
        </div>
        <div className="campo">
          <label htmlFor="texto">Primer mensaje</label>
          <textarea id="texto" rows={3} required maxLength={4096} value={texto} onChange={e => setTexto(e.target.value)} placeholder="Por ejemplo: quiero pintar una pieza de 3 por 4 metros" />
        </div>

        {error && <p className="error" role="alert">{error}</p>}
        <div className="acciones">
          <button className="boton" type="submit" disabled={guardando}>{guardando ? 'Creando…' : 'Iniciar conversación'}</button>
          <button className="boton secundario" type="button" onClick={() => navegar('/conversaciones')}>Cancelar</button>
        </div>
      </form>
    </section>
  )
}
