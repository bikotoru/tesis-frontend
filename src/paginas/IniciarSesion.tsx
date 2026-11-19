import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { api, mensajeDeError } from '../api.ts'
import { guardarSesion, type Sesion } from '../sesion.ts'

interface Props {
  alEntrar: (sesion: Sesion) => void
}

export default function IniciarSesion({ alEntrar }: Props) {
  const navegar = useNavigate()
  const [error, setError] = useState('')
  const [ingresando, setIngresando] = useState(false)

  async function ingresar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    setError('')
    setIngresando(true)
    try {
      const cuerpo = { correo: datos.get('correo'), clave: datos.get('clave') }
      const sesion = await api<Sesion>('/auth/ingresar', 'POST', cuerpo)
      guardarSesion(sesion)
      alEntrar(sesion)
      navegar('/conversaciones')
    } catch (e) {
      setError(mensajeDeError(e))
      setIngresando(false)
    }
  }

  return (
    <main className="acceso">
      <h1>FerreLupe</h1>
      <p className="ayuda">Panel de atención por WhatsApp. Ingresa con tu cuenta de la ferretería.</p>
      <form className="tarjeta" onSubmit={ingresar}>
        <div className="campo">
          <label htmlFor="correo">Correo electrónico</label>
          <input id="correo" name="correo" type="email" required autoComplete="email" />
        </div>
        <div className="campo">
          <label htmlFor="clave">Contraseña</label>
          <input id="clave" name="clave" type="password" required autoComplete="current-password" />
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="boton" type="submit" disabled={ingresando}>{ingresando ? 'Ingresando…' : 'Iniciar sesión'}</button>
      </form>
    </main>
  )
}
