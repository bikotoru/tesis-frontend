import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { api, mensajeDeError, type RespuestaMensaje } from '../api.ts'
import { soloFecha, type Linea } from '../formato.ts'
import TablaLineas from '../componentes/TablaLineas.tsx'
import Telefono from '../componentes/Telefono.tsx'

interface Cotizacion {
  id: number
  fecha: string
  cliente: string | null
  telefono: string
  estado: string
  lineas: Linea[]
}

export default function DetalleCotizacion() {
  const { id } = useParams()
  const ubicacion = useLocation()
  let avisoDelFormulario = ''
  if (ubicacion.state && ubicacion.state.aviso) {
    avisoDelFormulario = ubicacion.state.aviso
  }
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
  const [estadoElegido, setEstadoElegido] = useState('Enviada')
  const [aviso, setAviso] = useState(avisoDelFormulario)
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    api<Cotizacion>('/cotizaciones/' + id)
      .then(datos => {
        setCotizacion(datos)
        setEstadoElegido(datos.estado)
      })
      .catch((e: Error) => setError(e.message))
  }, [id])

  async function accion(ruta: string, metodo: string, cuerpo?: unknown) {
    setOcupado(true)
    setAviso('')
    setError('')
    try {
      const respuesta = await api<RespuestaMensaje>('/cotizaciones/' + id + ruta, metodo, cuerpo)
      setAviso(respuesta.mensaje)
      return true
    } catch (e) {
      setError(mensajeDeError(e))
      return false
    } finally {
      setOcupado(false)
    }
  }

  async function guardarEstado() {
    if (!cotizacion) {
      return
    }
    const guardado = await accion('/estado', 'PUT', { estado: estadoElegido })
    if (guardado) {
      setCotizacion({ ...cotizacion, estado: estadoElegido })
    }
  }

  if (!cotizacion) {
    if (error) {
      return <p className="error" role="alert">{error}</p>
    }
    return <p role="status">Cargando…</p>
  }

  return (
    <section>
      <h1>Cotización N.º {cotizacion.id}</h1>
      <div className="tarjeta">
        <p><strong>Fecha:</strong> {soloFecha(cotizacion.fecha)}</p>
        <p><strong>Cliente:</strong> {cotizacion.cliente ? cotizacion.cliente : 'Sin nombre'}</p>
        <p><strong>WhatsApp:</strong> <Telefono numero={cotizacion.telefono} /></p>
        <p><strong>Estado:</strong> <span className={'estado ' + cotizacion.estado}>{cotizacion.estado}</span></p>
      </div>

      <TablaLineas lineas={cotizacion.lineas} />

      <div className="tarjeta cambio-estado no-imprimir">
        <div className="campo">
          <label htmlFor="estado">Cambiar estado</label>
          <select id="estado" value={estadoElegido} onChange={e => setEstadoElegido(e.target.value)}>
            <option>Enviada</option>
            <option>Aceptada</option>
            <option>Rechazada</option>
          </select>
        </div>
        <button type="button" className="boton" disabled={ocupado} onClick={guardarEstado}>Guardar estado</button>
      </div>

      {aviso && <p className="aviso" role="status">{aviso}</p>}
      {error && <p className="error" role="alert">{error}</p>}

      <div className="acciones">
        <Link className="boton" to={'/cotizaciones/' + cotizacion.id + '/editar'}>Ajustar cotización</Link>
        <button type="button" className="boton acento" disabled={ocupado} onClick={() => accion('/reenviar', 'POST')}>
          Reenviar por WhatsApp
        </button>
        <button type="button" className="boton secundario" onClick={() => window.print()}>Imprimir</button>
        <Link className="boton secundario" to="/cotizaciones">Volver</Link>
      </div>
    </section>
  )
}
