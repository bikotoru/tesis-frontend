import { pesos, total, type Linea } from '../formato.ts'

interface Props {
  lineas: Linea[]
}

export default function TablaLineas({ lineas }: Props) {
  return (
    <div className="tabla-contenedor">
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Unidad</th>
            <th className="numero">Cantidad</th>
            <th className="numero">Precio</th>
            <th className="numero">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {lineas.map(l => (
            <tr key={l.productoId}>
              <td>{l.nombre}</td>
              <td>{l.unidad}</td>
              <td className="numero">{l.cantidad}</td>
              <td className="numero">{pesos(l.precio)}</td>
              <td className="numero">{pesos(l.precio * l.cantidad)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>Total (IVA incluido)</td>
            <td className="numero">{pesos(total(lineas))}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
