import Image from 'next/image';
import { IMAGENS } from '../../config/imagens';

export default function FeedbackMascote({ titulo, texto, tipo = 'sucesso', children }) {
  return (
    <div className={`feedback-mascote feedback-mascote--${tipo}`} role="status" aria-live="polite">
      <Image src={IMAGENS.mascotes.papagaio} alt="" width={72} height={80} />
      <div>
        <b>{titulo}</b>
        {texto && <p>{texto}</p>}
        {children}
      </div>
    </div>
  );
}
