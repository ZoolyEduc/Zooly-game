import Image from 'next/image';
import { IMAGENS } from '../../config/imagens';

export function MoedaBanana({ tamanho = 22 }) {
  return <Image className="moeda-banana" src={IMAGENS.moedas.banana} alt="" width={tamanho} height={tamanho} />;
}

export default function SaldoMoedas({ saldo, carregando }) {
  const valor = carregando ? '…' : saldo === null || saldo === undefined ? '--' : saldo;
  return (
    <span className="saldo-moedas" aria-label={`Saldo: ${valor} moedas`}>
      <span>{valor}</span>
      <MoedaBanana />
    </span>
  );
}
