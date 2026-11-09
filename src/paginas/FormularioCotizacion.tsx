import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { api, mensajeDeError } from '../api.ts'
import { pesos, total, type Linea, telefono } from '../formato.ts'

interface Cliente {
  id: number
  nombre: string | null
  telefono: string
}

interface Producto {
  id: number
  nombre: string
  unidad: string
  precio: number
  activo: boolean
}

interface CotizacionGuardada {
  clienteId: number
  lineas: Linea[]
}

interface RespuestaGuardar {
  id: number
  aviso: string | null
}

export default function FormularioCotizacion() {
  const navegar = useNavigate()
  const { id } = useParams()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [clienteId, setClienteId] = useState(0)
  const [lineas, setLineas] = useState<Linea[]>([])
  const [productoId, setProductoId] = useState(0)
  const [cantidad, setCantidad] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarDatos() {
      try {
        const listaClientes = await api<Cliente[]>('/clientes')
        const todosLosProductos = await api<Producto[]>('/productos')
        const listaProductos = todosLosProductos.filter(p => p.activo)
        setClientes(listaClientes)
        setProductos(listaProductos)
        if (listaClientes.length > 0) {
          setClienteId(listaClientes[0].id)
        }
        if (listaProductos.length > 0) {
          setProductoId(listaProductos[0].id)
        }
        if (id) {
          const cotizacion = await api<CotizacionGuardada>('/cotizaciones/' + id)
          for (const linea of cotizacion.lineas) {
            const producto = listaProductos.find(p => p.id === linea.productoId)
            if (producto) {
              linea.precio = producto.precio
            }
          }
          setClienteId(cotizacion.clienteId)
          setLineas(cotizacion.lineas)
        }
        setCargando(false)
      } catch (e) {
        setError(mensajeDeError(e))
      }
    }
    cargarDatos()
  }, [id])

  function cambiarCantidad(indice: number, valor: number) {
    const nuevas: Linea[] = []
    for (let i = 0; i < lineas.length; i++) {
      if (i === indice) {
        nuevas.push({ ...lineas[i], cantidad: valor })
      } else {
        nuevas.push(lineas[i])
      }
    }
    setLineas(nuevas)
  }

  function quitar(indice: number) {
    const nuevas: Linea[] = []
    for (let i = 0; i < lineas.length; i++) {
      if (i !== indice) {
        nuevas.push(lineas[i])
      }
    }
    setLineas(nuevas)
  }

  function agregar() {
    if (cantidad < 1) {
      setError('La cantidad debe ser 1 o más.')
      return
    }
    const producto = productos.find(p => p.id === productoId)
    if (!producto) {
      return
    }
    setError('')

    const nuevas: Linea[] = []
    let yaEstaba = false
    for (const linea of lineas) {
      if (linea.productoId === productoId) {
        nuevas.push({ ...linea, cantidad: linea.cantidad + cantidad })
        yaEstaba = true
      } else {
        nuevas.push(linea)
      }
    }
    if (!yaEstaba) {
      nuevas.push({ productoId: producto.id, nombre: producto.nombre, unidad: producto.unidad, precio: producto.precio, cantidad: cantidad })
    }
    setLineas(nuevas)
    setCantidad(1)
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setGuardando(true)
    setError('')
    const lineasParaEnviar = lineas.map(l => ({ productoId: l.productoId, cantidad: l.cantidad }))
    const cuerpo = { clienteId: clienteId, lineas: lineasParaEnviar }
    try {
      let respuesta: RespuestaGuardar
      if (id) {
        respuesta = await api<RespuestaGuardar>('/cotizaciones/' + id, 'PUT', cuerpo)
      } else {
        respuesta = await api<RespuestaGuardar>('/cotizaciones', 'POST', cuerpo)
      }
      let aviso = 'La cotización se guardó y se envió por WhatsApp.'
      if (respuesta.aviso) {
        aviso = respuesta.aviso
      }
      navegar('/cotizaciones/' + respuesta.id, { state: { aviso: aviso } })
    } catch (e) {
      setError(mensajeDeError(e))
      setGuardando(false)
    }
  }

  if (cargando) {
    if (error) {
      return <p className="error" role="alert">{error}</p>
    }
    return <p role="status">Cargando…</p>
  }

  let titulo = 'Nueva cotización'
  if (id) {
    titulo = 'Ajustar cotización N.º ' + id
  }

  return (
    <section>
      <h1>{titulo}</h1>
      <form onSubmit={guardar}>
        <div className="tarjeta">
          <div className="campo">
            <label htmlFor="cliente">Cliente</label>
            <select id="cliente" value={clienteId} disabled={id !== undefined} onChange={e => setClienteId(Number(e.target.value))}>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre ? c.nombre : telefono(c.telefono)} ({telefono(c.telefono)})</option>
              ))}
            </select>
          </div>
          {clientes.length === 0 && <p className="aviso">Todavía no hay clientes: aparecen aquí cuando escriben por WhatsApp.</p>}
          <p className="ayuda">La cotización se envía al WhatsApp del cliente, siempre que su ventana de 24 horas esté abierta.</p>
        </div>

        <div className="tarjeta">
          <h2>Productos</h2>
          {lineas.length === 0 && <p className="aviso">Agrega al menos un producto.</p>}
          {lineas.length > 0 && (
            <div className="tabla-contenedor">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="numero">Precio</th>
                    <th>Cantidad</th>
                    <th className="numero">Subtotal</th>
                    <th><span className="oculto">Quitar</span></th>
                  </tr>
                </thead>
                <tbody>
                  {lineas.map((l, i) => (
                    <tr key={l.productoId}>
                      <td>{l.nombre}</td>
                      <td className="numero">{pesos(l.precio)}</td>
                      <td>
                        <input
                          className="cantidad"
                          type="number"
                          min={1}
                          value={l.cantidad}
                          aria-label={'Cantidad de ' + l.nombre}
                          onChange={e => cambiarCantidad(i, Number(e.target.value))}
                        />
                      </td>
                      <td className="numero">{pesos(l.precio * l.cantidad)}</td>
                      <td>
                        <button type="button" className="enlace-peligro" onClick={() => quitar(i)}>Quitar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}>Total (IVA incluido)</td>
                    <td className="numero">{pesos(total(lineas))}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="agregar">
            <div className="campo">
              <label htmlFor="producto">Producto</label>
              <select id="producto" value={productoId} onChange={e => setProductoId(Number(e.target.value))}>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({pesos(p.precio)})</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="cantidad">Cantidad</label>
              <input id="cantidad" type="number" min={1} value={cantidad} onChange={e => setCantidad(Number(e.target.value))} />
            </div>
            <button type="button" className="boton secundario" onClick={agregar} disabled={productoId === 0}>Agregar</button>
          </div>
        </div>

        {error && <p className="error" role="alert">{error}</p>}
        <div className="acciones">
          <button className="boton" type="submit" disabled={lineas.length === 0 || clienteId === 0 || guardando}>
            {guardando ? 'Guardando…' : 'Guardar y enviar por WhatsApp'}
          </button>
          <button className="boton secundario" type="button" onClick={() => navegar(-1)}>Cancelar</button>
        </div>
      </form>
    </section>
  )
}
