import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api.ts'
import type { Usuario } from './FormularioUsuario.tsx'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api<Usuario[]>('/usuarios')
      .then(datos => setUsuarios(datos))
      .catch((e: Error) => setError(e.message))
  }, [])

  return (
    <section>
      <div className="titulo-con-accion">
        <h1>Usuarios</h1>
        <Link className="boton" to="/usuarios/nuevo">Nuevo usuario</Link>
      </div>
      <p className="ayuda">Cuentas del personal de FerreLupe. Los clientes no tienen cuenta: escriben por WhatsApp.</p>

      {error && <p className="error" role="alert">{error}</p>}
      {!usuarios && !error && <p role="status">Cargando…</p>}

      {usuarios && (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Perfil</th>
                <th>Estado</th>
                <th><span className="oculto">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} className={u.activo ? '' : 'inactivo'}>
                  <td>{u.nombre}</td>
                  <td>{u.correo}</td>
                  <td>{u.rol}</td>
                  <td><span className={'estado ' + (u.activo ? 'Activo' : 'Inactivo')}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td><Link to={'/usuarios/' + u.id}>Editar</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
