import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api, mensajeDeError, type RespuestaMensaje } from '../api.ts'
import { fechaHora, pesos } from '../formato.ts'

interface Producto {
  id: number
  codigo: string
  nombre: string
  categoria: string
  precio: number
  stock: number
  activo: boolean
  descripcion: string | null
}

interface DatosSincronizacion {
  ultimaSincronizacion: string | null
}

interface Props {
  esAdministrador: boolean
}

export default function Productos({ esAdministrador }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [productos, setProductos] = useState<Producto[] | null>(null)
  const [ultimaSincronizacion, setUltimaSincronizacion] = useState<string | null>(null)
  const [recargar, setRecargar] = useState(0)
  const [sincronizando, setSincronizando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    function buscar() {
      api<Producto[]>('/productos?busqueda=' + encodeURIComponent(busqueda))
        .then(datos => {
          setProductos(datos)
          setError('')
        })
        .catch((e: Error) => setError(e.message))
    }
    const espera = setTimeout(buscar, 300)
    return () => clearTimeout(espera)
  }, [busqueda, recargar])

  useEffect(() => {
    if (!esAdministrador) {
      return
    }
    api<DatosSincronizacion>('/configuracion')
      .then(datos => setUltimaSincronizacion(datos.ultimaSincronizacion))
      .catch((e: Error) => setError(e.message))
  }, [esAdministrador, recargar])

  async function sincronizar() {
    setSincronizando(true)
    setAviso('')
    setError('')
    try {
      const respuesta = await api<RespuestaMensaje>('/productos/sincronizar', 'POST')
      setAviso(respuesta.mensaje)
      setRecargar(recargar + 1)
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setSincronizando(false)
    }
  }

  let textoSincronizacion = 'todavía no se ha realizado'
  if (ultimaSincronizacion) {
    textoSincronizacion = fechaHora(ultimaSincronizacion)
  }

  return (
    <section>
      <div className="titulo-con-accion">
        <h1>Productos</h1>
        {esAdministrador && (
          <div className="acciones">
            <button type="button" className="boton secundario" onClick={sincronizar} disabled={sincronizando}>
              {sincronizando ? 'Sincronizando…' : 'Sincronizar con el ERP'}
            </button>
            <Link className="boton" to="/productos/nuevo">Nuevo producto</Link>
          </div>
        )}
      </div>
      {esAdministrador && <p className="ayuda">Los precios y el stock vienen del ERP (última sincronización: {textoSincronizacion}).</p>}
      {aviso && <p className="aviso" role="status">{aviso}</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {!esAdministrador && <p className="ayuda">Puedes consultar el catálogo. Solo el administrador puede modificarlo.</p>}

      <div className="campo">
        <label htmlFor="busqueda">Buscar producto</label>
        <input id="busqueda" type="search" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre, código o uso" />
      </div>

      {!productos && !error && <p role="status">Cargando…</p>}
      {productos && productos.length === 0 && <p className="aviso">No se encontraron productos.</p>}

      {productos && productos.length > 0 && (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th className="numero">Precio</th>
                <th className="numero">Stock</th>
                <th>Descripción</th>
                {esAdministrador && <th><span className="oculto">Acciones</span></th>}
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id} className={p.activo ? '' : 'inactivo'}>
                  <td>{p.codigo}</td>
                  <td>{p.nombre}{!p.activo && ' (inactivo)'}</td>
                  <td>{p.categoria}</td>
                  <td className="numero">{pesos(p.precio)}</td>
                  <td className="numero">{p.stock}</td>
                  <td>{p.descripcion ? 'Sí' : <span className="etiqueta">Falta</span>}</td>
                  {esAdministrador && <td><Link to={'/productos/' + p.id}>Editar</Link></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
