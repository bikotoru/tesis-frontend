import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api.ts'
import { pesos, soloFecha } from '../formato.ts'
import Telefono from '../componentes/Telefono.tsx'

interface ResumenCotizacion {
  id: number
  fecha: string
  cliente: string | null
  telefono: string
  total: number
  estado: string
}

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<ResumenCotizacion[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api<ResumenCotizacion[]>('/cotizaciones')
      .then(datos => setCotizaciones(datos))
      .catch((e: Error) => setError(e.message))
  }, [])

  return (
    <section>
      <div className="titulo-con-accion">
        <h1>Cotizaciones</h1>
        <Link className="boton" to="/cotizaciones/nueva">Nueva cotización</Link>
      </div>
      <p className="ayuda">El asistente envía las cotizaciones por WhatsApp. Aquí puedes revisarlas, ajustarlas y reenviarlas.</p>
      {error && <p className="error" role="alert">{error}</p>}
      {!cotizaciones && !error && <p role="status">Cargando…</p>}
      {cotizaciones && cotizaciones.length === 0 && <p className="aviso">Todavía no hay cotizaciones.</p>}

      {cotizaciones && cotizaciones.length > 0 && (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>N.º</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th className="numero">Total</th>
                <th>Estado</th>
                <th><span className="oculto">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{soloFecha(c.fecha)}</td>
                  <td>{c.cliente ? c.cliente : <Telefono numero={c.telefono} />}</td>
                  <td className="numero">{pesos(c.total)}</td>
                  <td><span className={'estado ' + c.estado}>{c.estado}</span></td>
                  <td><Link to={'/cotizaciones/' + c.id}>Ver detalle</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
