import { useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router'
import { borrarSesion, guardarSesion, obtenerSesion, type Sesion } from './sesion.ts'
import IniciarSesion from './paginas/IniciarSesion.tsx'
import Conversaciones from './paginas/Conversaciones.tsx'
import DetalleConversacion from './paginas/DetalleConversacion.tsx'
import SimularConversacion from './paginas/SimularConversacion.tsx'
import Cotizaciones from './paginas/Cotizaciones.tsx'
import DetalleCotizacion from './paginas/DetalleCotizacion.tsx'
import FormularioCotizacion from './paginas/FormularioCotizacion.tsx'
import Productos from './paginas/Productos.tsx'
import FormularioProducto from './paginas/FormularioProducto.tsx'
import Usuarios from './paginas/Usuarios.tsx'
import FormularioUsuario from './paginas/FormularioUsuario.tsx'
import Configuracion from './paginas/Configuracion.tsx'
import Perfil from './paginas/Perfil.tsx'

export default function App() {
  const [sesion, setSesion] = useState(obtenerSesion())

  if (!sesion) {
    return <IniciarSesion alEntrar={setSesion} />
  }

  const esAdministrador = sesion.rol === 'Administrador'

  function salir() {
    borrarSesion()
    setSesion(null)
  }

  function actualizarSesion(nueva: Sesion) {
    guardarSesion(nueva)
    setSesion(nueva)
  }

  return (
    <>
      <header className="encabezado">
        <span className="marca">FerreLupe</span>
        <nav aria-label="Menú principal">
          <NavLink to="/conversaciones">Conversaciones</NavLink>
          <NavLink to="/cotizaciones">Cotizaciones</NavLink>
          <NavLink to="/productos">Productos</NavLink>
          {esAdministrador && <NavLink to="/usuarios">Usuarios</NavLink>}
          {esAdministrador && <NavLink to="/configuracion">Configuración</NavLink>}
          <NavLink to="/perfil">Mi perfil</NavLink>
          <button type="button" className="enlace" onClick={salir}>Cerrar sesión</button>
        </nav>
        <span className="usuario">{sesion.nombre} · {sesion.rol}</span>
      </header>

      <main className="contenido">
        <Routes>
          <Route path="/conversaciones" element={<Conversaciones esAdministrador={esAdministrador} />} />
          {esAdministrador && <Route path="/conversaciones/simular" element={<SimularConversacion />} />}
          <Route path="/conversaciones/:id" element={<DetalleConversacion esAdministrador={esAdministrador} />} />
          <Route path="/cotizaciones" element={<Cotizaciones />} />
          <Route path="/cotizaciones/nueva" element={<FormularioCotizacion />} />
          <Route path="/cotizaciones/:id" element={<DetalleCotizacion />} />
          <Route path="/cotizaciones/:id/editar" element={<FormularioCotizacion />} />
          <Route path="/productos" element={<Productos esAdministrador={esAdministrador} />} />
          {esAdministrador && <Route path="/productos/nuevo" element={<FormularioProducto />} />}
          {esAdministrador && <Route path="/productos/:id" element={<FormularioProducto />} />}
          {esAdministrador && <Route path="/usuarios" element={<Usuarios />} />}
          {esAdministrador && <Route path="/usuarios/nuevo" element={<FormularioUsuario />} />}
          {esAdministrador && <Route path="/usuarios/:id" element={<FormularioUsuario />} />}
          {esAdministrador && <Route path="/configuracion" element={<Configuracion />} />}
          <Route path="/perfil" element={<Perfil sesion={sesion} alGuardar={actualizarSesion} />} />
          <Route path="*" element={<Navigate to="/conversaciones" replace />} />
        </Routes>
      </main>
    </>
  )
}
