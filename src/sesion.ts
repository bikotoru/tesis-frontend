export type Rol = 'Administrador' | 'Vendedor'

export interface Sesion {
  token: string
  nombre: string
  correo: string
  rol: Rol
}

export function obtenerSesion(): Sesion | null {
  const texto = localStorage.getItem('sesion')
  if (!texto) {
    return null
  }
  return JSON.parse(texto)
}

export function guardarSesion(sesion: Sesion) {
  localStorage.setItem('sesion', JSON.stringify(sesion))
}

export function borrarSesion() {
  localStorage.removeItem('sesion')
}
