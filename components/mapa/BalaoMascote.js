import Image from 'next/image';
import { FiX } from 'react-icons/fi';
import { IMAGENS } from '../../config/imagens';
import BotaoOuvir from '../ui/BotaoOuvir';

export default function BalaoMascote({ titulo, texto, acao, onAcao, onFechar, escurecer = false }) {
  return (
    <div className={`balao-mapa ${escurecer ? 'balao-mapa--escuro' : ''}`} role="status" aria-live="polite">
      <div className="balao-mapa__conteudo">
        <Image className="balao-mapa__mascote" src={IMAGENS.mascotes.papagaio} alt="" width={86} height={120} />
        <div className="balao-mapa__fala">
          {onFechar && (
            <button type="button" className="balao-mapa__fechar" onClick={onFechar} aria-label="Fechar mensagem">
              <FiX />
            </button>
          )}
          <BotaoOuvir texto={[titulo, texto].filter(Boolean).join('. ')} rotulo="Ouvir mensagem" compacto className="balao-mapa__ouvir" />
          {titulo && <b>{titulo}</b>}
          {texto && <p>{texto}</p>}
          {acao && (
            <button type="button" className="botao-pilula" onClick={onAcao}>
              {acao}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
