import { useEffect, useState, type FormEvent } from 'react'
import { api, mensajeDeError, type RespuestaMensaje } from '../api.ts'

interface DatosConfiguracion {
  mensajeBienvenida: string
  horario: string
  rendimientoPintura: number
  margenMedidas: number
}

export default function Configuracion() {
  const [configuracion, setConfiguracion] = useState<DatosConfiguracion | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api<DatosConfiguracion>('/configuracion')
      .then(datos => setConfiguracion(datos))
      .catch((e: Error) => setError(e.message))
  }, [])

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!configuracion) {
      return
    }
    setGuardando(true)
    setAviso('')
    setError('')
    const cuerpo = {
      mensajeBienvenida: configuracion.mensajeBienvenida,
      horario: configuracion.horario,
      rendimientoPintura: configuracion.rendimientoPintura,
      margenMedidas: configuracion.margenMedidas,
    }
    try {
      const respuesta = await api<RespuestaMensaje>('/configuracion', 'PUT', cuerpo)
      setAviso(respuesta.mensaje)
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  if (!configuracion) {
    if (error) {
      return <p className="error" role="alert">{error}</p>
    }
    return <p role="status">Cargando…</p>
  }

  return (
    <section>
      <h1>Configuración del asistente</h1>
      <form className="tarjeta" onSubmit={guardar}>
        <div className="campo">
          <label htmlFor="bienvenida">Mensaje de bienvenida</label>
          <textarea id="bienvenida" rows={3} required maxLength={500} value={configuracion.mensajeBienvenida} onChange={e => setConfiguracion({ ...configuracion, mensajeBienvenida: e.target.value })} />
        </div>
        <div className="campo">
          <label htmlFor="horario">Horario de atención</label>
          <input id="horario" required maxLength={100} value={configuracion.horario} onChange={e => setConfiguracion({ ...configuracion, horario: e.target.value })} />
        </div>
        <div className="campos-2">
          <div className="campo">
            <label htmlFor="rendimiento">Rendimiento de la pintura (m² por litro por mano)</label>
            <input id="rendimiento" type="number" min={1} max={30} step={0.5} required value={configuracion.rendimientoPintura} onChange={e => setConfiguracion({ ...configuracion, rendimientoPintura: Number(e.target.value) })} />
          </div>
          <div className="campo">
            <label htmlFor="margen">Margen de las medidas (%)</label>
            <input id="margen" type="number" min={0} max={50} required value={configuracion.margenMedidas} onChange={e => setConfiguracion({ ...configuracion, margenMedidas: Number(e.target.value) })} />
          </div>
        </div>
        <p className="ayuda">El asistente usa el rendimiento y el margen en sus cálculos: a cada medida le suma el margen y redondea hacia arriba.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="boton" type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar configuración'}</button>
        {aviso && <p className="aviso" role="status">{aviso}</p>}
      </form>
    </section>
  )
}
