import { paisDelTelefono, telefono } from '../formato.ts'

interface Props {
  numero: string
}

export default function Telefono(props: Props) {
  const pais = paisDelTelefono(props.numero)
  return (
    <span className="telefono">
      {pais && (
        <img
          src={'https://flagcdn.com/20x15/' + pais.sigla + '.png'}
          width={20}
          height={15}
          alt={'Bandera de ' + pais.sigla.toUpperCase()}
        />
      )}
      {telefono(props.numero)}
    </span>
  )
}
