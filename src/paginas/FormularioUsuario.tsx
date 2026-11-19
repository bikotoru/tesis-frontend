import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { api, mensajeDeError } from '../api.ts'

export interface Usuario {
  id: number
  nombre: string
  correo: string
  rol: string
  activo: boolean
}

const usuarioVacio: Usuario = { id: 0, nombre: '', correo: '', rol: 'Vendedor', activo: true }

export default function FormularioUsuario() {
  const navegar = useNavigate()
  const { id } = useParams()
  const [usuario, setUsuario] = useState<Usuario>(usuarioVacio)
  const [clave, setClave] = useState('')
  const [cargando, setCargando] = useState(id !== undefined)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      return
    }
    api<Usuario>('/usuarios/' + id)
      .then(datos => {
        setUsuario(datos)
        setCargando(false)
      })
      .catch((e: Error) => setError(e.message))
  }, [id])

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setGuardando(true)
    setError('')
    try {
      if (id) {
        const cuerpo = { nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, activo: usuario.activo, clave: null }
        await api('/usuarios/' + id, 'PUT', cuerpo)
      } else {
        const cuerpo = { nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, activo: usuario.activo, clave: clave }
        await api('/usuarios', 'POST', cuerpo)
      }
      navegar('/usuarios')
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

  let titulo = 'Nuevo usuario'
  if (id) {
    titulo = 'Editar usuario'
  }

  return (
    <section>
      <h1>{titulo}</h1>
      <form className="tarjeta" onSubmit={guardar}>
        <div className="campos-2">
          <div className="campo">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" required value={usuario.nombre} onChange={e => setUsuario({ ...usuario, nombre: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="correo">Correo electrónico</label>
            <input id="correo" type="email" required value={usuario.correo} onChange={e => setUsuario({ ...usuario, correo: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="rol">Perfil</label>
            <select id="rol" value={usuario.rol} onChange={e => setUsuario({ ...usuario, rol: e.target.value })}>
              <option>Vendedor</option>
              <option>Administrador</option>
            </select>
          </div>
          {!id && (
            <div className="campo">
              <label htmlFor="clave">Contraseña inicial (mínimo 8 caracteres)</label>
              <input id="clave" type="password" required minLength={8} autoComplete="new-password" value={clave} onChange={e => setClave(e.target.value)} />
            </div>
          )}
        </div>

        <div className="campo check">
          <input id="activo" type="checkbox" checked={usuario.activo} onChange={e => setUsuario({ ...usuario, activo: e.target.checked })} />
          <label htmlFor="activo">Cuenta activa (puede iniciar sesión)</label>
        </div>

        {error && <p className="error" role="alert">{error}</p>}
        <div className="acciones">
          <button className="boton" type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar usuario'}</button>
          <button className="boton secundario" type="button" onClick={() => navegar('/usuarios')}>Cancelar</button>
        </div>
      </form>
    </section>
  )
}
