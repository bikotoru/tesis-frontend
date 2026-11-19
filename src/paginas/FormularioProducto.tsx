import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { api, mensajeDeError } from '../api.ts'

interface Producto {
  codigo: string
  nombre: string
  categoriaId: number
  unidad: string
  precio: number
  stock: number
  litros: number | null
  activo: boolean
  descripcion: string | null
}

interface RespuestaDescripcion {
  descripcion: string
}

interface Categoria {
  id: number
  nombre: string
}

const unidades = ['unidad', 'metro', 'galón', 'tineta', 'saco', 'bolsa']

const productoVacio: Producto = {
  codigo: '',
  nombre: '',
  categoriaId: 0,
  unidad: unidades[0],
  precio: 0,
  stock: 0,
  litros: null,
  activo: true,
  descripcion: '',
}

export default function FormularioProducto() {
  const navegar = useNavigate()
  const { id } = useParams()
  const [producto, setProducto] = useState<Producto>(productoVacio)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(true)
  const [sugiriendo, setSugiriendo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarDatos() {
      try {
        const lista = await api<Categoria[]>('/categorias')
        setCategorias(lista)
        if (id) {
          const guardado = await api<Producto>('/productos/' + id)
          setProducto(guardado)
        } else if (lista.length > 0) {
          setProducto({ ...productoVacio, categoriaId: lista[0].id })
        }
        setCargando(false)
      } catch (e) {
        setError(mensajeDeError(e))
      }
    }
    cargarDatos()
  }, [id])

  async function sugerirDescripcion() {
    setSugiriendo(true)
    setError('')
    try {
      let categoria = ''
      const elegida = categorias.find(c => c.id === producto.categoriaId)
      if (elegida) {
        categoria = elegida.nombre
      }
      const cuerpo = { nombre: producto.nombre, categoria: categoria, unidad: producto.unidad }
      const respuesta = await api<RespuestaDescripcion>('/productos/sugerir-descripcion', 'POST', cuerpo)
      setProducto(actual => ({ ...actual, descripcion: respuesta.descripcion }))
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setSugiriendo(false)
    }
  }

  function cambiarLitros(texto: string) {
    if (texto === '') {
      setProducto({ ...producto, litros: null })
    } else {
      setProducto({ ...producto, litros: Number(texto) })
    }
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setGuardando(true)
    setError('')
    try {
      if (id) {
        await api('/productos/' + id, 'PUT', producto)
      } else {
        await api('/productos', 'POST', producto)
      }
      navegar('/productos')
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

  const opcionesUnidad = [...unidades]
  if (!unidades.includes(producto.unidad)) {
    opcionesUnidad.push(producto.unidad)
  }

  let titulo = 'Nuevo producto'
  if (id) {
    titulo = 'Editar producto'
  }

  let descripcion = ''
  if (producto.descripcion) {
    descripcion = producto.descripcion
  }

  return (
    <section>
      <h1>{titulo}</h1>
      <form className="tarjeta" onSubmit={guardar}>
        <div className="campos-2">
          <div className="campo">
            <label htmlFor="codigo">Código</label>
            <input id="codigo" required value={producto.codigo} onChange={e => setProducto({ ...producto, codigo: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" required value={producto.nombre} onChange={e => setProducto({ ...producto, nombre: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="categoria">Categoría</label>
            <select id="categoria" value={producto.categoriaId} onChange={e => setProducto({ ...producto, categoriaId: Number(e.target.value) })}>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="unidad">Unidad de venta</label>
            <select id="unidad" value={producto.unidad} onChange={e => setProducto({ ...producto, unidad: e.target.value })}>
              {opcionesUnidad.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="precio">Precio (IVA incluido)</label>
            <input id="precio" type="number" min={0} required value={producto.precio} onChange={e => setProducto({ ...producto, precio: Number(e.target.value) })} />
          </div>
          <div className="campo">
            <label htmlFor="stock">Stock</label>
            <input id="stock" type="number" min={0} required value={producto.stock} onChange={e => setProducto({ ...producto, stock: Number(e.target.value) })} />
          </div>
          <div className="campo">
            <label htmlFor="litros">Litros por envase (solo pinturas)</label>
            <input id="litros" type="number" min={0.001} step={0.001} value={producto.litros === null ? '' : producto.litros} onChange={e => cambiarLitros(e.target.value)} placeholder="Por ejemplo, 3,785 en un galón" />
          </div>
        </div>

        <div className="campo">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            rows={4}
            maxLength={1000}
            value={descripcion}
            onChange={e => setProducto({ ...producto, descripcion: e.target.value })}
            placeholder="Usos, características y palabras con que un cliente buscaría este producto"
          />
        </div>
        <button type="button" className="boton acento" onClick={sugerirDescripcion} disabled={sugiriendo || !producto.nombre}>
          {sugiriendo ? 'Sugiriendo…' : 'Sugerir descripción con IA'}
        </button>
        <p className="ayuda">La IA propone un texto: revísalo y corrígelo antes de guardar.</p>

        <div className="campo check">
          <input id="activo" type="checkbox" checked={producto.activo} onChange={e => setProducto({ ...producto, activo: e.target.checked })} />
          <label htmlFor="activo">Producto activo (el asistente puede recomendarlo)</label>
        </div>

        {error && <p className="error" role="alert">{error}</p>}
        <div className="acciones">
          <button className="boton" type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar producto'}</button>
          <button className="boton secundario" type="button" onClick={() => navegar('/productos')}>Cancelar</button>
        </div>
      </form>
    </section>
  )
}
