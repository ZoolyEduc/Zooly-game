import Image from 'next/image';
import { FiRefreshCw } from 'react-icons/fi';
import { IMAGENS } from '../../config/imagens';

export default function MensagemEstado({
  titulo,
  texto,
  tipo = 'info',
  mascote = IMAGENS.mascotes.papagaio,
  onTentarNovamente,
  children
}) {
  return (
    <div className={`mensagem-estado mensagem-estado--${tipo}`} role={tipo === 'erro' ? 'alert' : undefined}>
      {mascote && <Image src={mascote} alt="" width={72} height={96} className="mensagem-estado__mascote" />}
      <div>
        {titulo && <b>{titulo}</b>}
        {texto && <p>{texto}</p>}
        {onTentarNovamente && (
          <button type="button" className="botao-texto" onClick={onTentarNovamente}>
            <FiRefreshCw aria-hidden="true" /> Tentar de novo
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
