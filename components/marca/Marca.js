import Image from 'next/image';
import { IMAGENS } from '../../config/imagens';

export default function Marca({ compacta = false }) {
  return (
    <div className={`marca ${compacta ? 'marca--compacta' : ''}`}>
      <Image
        className="marca__logo-turma"
        src={IMAGENS.marca.logoTurmaAnimal}
        alt="Zooly com a Turma Animal"
        width={338}
        height={243}
        priority
      />
    </div>
  );
}
