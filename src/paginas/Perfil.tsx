import { useEffect, useState, type FormEvent } from 'react'
import { api, mensajeDeError, type RespuestaMensaje } from '../api.ts'
import type { Sesion } from '../sesion.ts'

interface DatosPerfil {
  nombre: string
  correo: string
}

interface Props {
  sesion: Sesion
  alGuardar: (sesion: Sesion) => void
}

export default function Perfil({ sesion, alGuardar }: Props) {
  const [nombre, setNombre] = useState(sesion.nombre)
  const [correo, setCorreo] = useState(sesion.correo)
  const [guardandoDatos, setGuardandoDatos] = useState(false)
  const [avisoDatos, setAvisoDatos] = useState('')
  const [errorDatos, setErrorDatos] = useState('')
  const [guardandoClave, setGuardandoClave] = useState(false)
  const [avisoClave, setAvisoClave] = useState('')
  const [errorClave, setErrorClave] = useState('')

  useEffect(() => {
    api<DatosPerfil>('/perfil')
      .then(datos => {
        setNombre(datos.nombre)
        setCorreo(datos.correo)
      })
      .catch((e: Error) => setErrorDatos(e.message))
  }, [])

  async function guardarDatos(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setGuardandoDatos(true)
    setAvisoDatos('')
    setErrorDatos('')
    try {
      const respuesta = await api<RespuestaMensaje>('/perfil', 'PUT', { nombre: nombre, correo: correo })
      setAvisoDatos(respuesta.mensaje)
      alGuardar({ ...sesion, nombre: nombre.trim(), correo: correo.trim() })
    } catch (e) {
      setErrorDatos(mensajeDeError(e))
    } finally {
      setGuardandoDatos(false)
    }
  }

  async function cambiarClave(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    const datos = new FormData(formulario)
    setAvisoClave('')
    setErrorClave('')

    if (datos.get('nueva') !== datos.get('confirmacion')) {
      setErrorClave('Las contraseñas nuevas no coinciden.')
      return
    }

    setGuardandoClave(true)
    try {
      const cuerpo = { actual: datos.get('actual'), nueva: datos.get('nueva') }
      const respuesta = await api<RespuestaMensaje>('/perfil/clave', 'PUT', cuerpo)
      setAvisoClave(respuesta.mensaje)
      formulario.reset()
    } catch (e) {
      setErrorClave(mensajeDeError(e))
    } finally {
      setGuardandoClave(false)
    }
  }

  return (
    <section>
      <h1>Mi perfil</h1>
      <div className="campos-2">
        <form className="tarjeta" onSubmit={guardarDatos}>
          <h2>Mis datos</h2>
          <div className="campo">
            <label htmlFor="nombre">Nombre completo</label>
            <input id="nombre" required value={nombre} onChange={e => setNombre(e.target.value)} autoComplete="name" />
          </div>
          <div className="campo">
            <label htmlFor="correo">Correo electrónico</label>
            <input id="correo" type="email" required value={correo} onChange={e => setCorreo(e.target.value)} autoComplete="email" />
          </div>
          {errorDatos && <p className="error" role="alert">{errorDatos}</p>}
          <button className="boton" type="submit" disabled={guardandoDatos}>{guardandoDatos ? 'Guardando…' : 'Guardar cambios'}</button>
          {avisoDatos && <p className="aviso" role="status">{avisoDatos}</p>}
        </form>

        <form className="tarjeta" onSubmit={cambiarClave}>
          <h2>Cambiar contraseña</h2>
          <div className="campo">
            <label htmlFor="actual">Contraseña actual</label>
            <input id="actual" name="actual" type="password" required autoComplete="current-password" />
          </div>
          <div className="campo">
            <label htmlFor="nueva">Contraseña nueva (mínimo 8 caracteres)</label>
            <input id="nueva" name="nueva" type="password" required minLength={8} autoComplete="new-password" />
          </div>
          <div className="campo">
            <label htmlFor="confirmacion">Repite la contraseña nueva</label>
            <input id="confirmacion" name="confirmacion" type="password" required minLength={8} autoComplete="new-password" />
          </div>
          {errorClave && <p className="error" role="alert">{errorClave}</p>}
          <button className="boton" type="submit" disabled={guardandoClave}>{guardandoClave ? 'Guardando…' : 'Cambiar contraseña'}</button>
          {avisoClave && <p className="aviso" role="status">{avisoClave}</p>}
        </form>
      </div>
    </section>
  )
}
