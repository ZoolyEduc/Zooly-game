import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { FiX } from 'react-icons/fi';
import { IMAGENS } from '../../config/imagens';
import BotaoOuvir from '../ui/BotaoOuvir';

const semAssinatura = () => () => {};

export default function BalaoMascote({ titulo, texto, acao, onAcao, onFechar, escurecer = false }) {
  // A versão escurecida é renderizada direto no <body>: dentro de .mapa-cena ela ficaria
  // presa ao contexto de empilhamento do mapa e não cobriria cabeçalho, navegação e rolagem.
  // true no navegador, false na renderização do servidor (onde não existe document.body).
  const montado = useSyncExternalStore(semAssinatura, () => true, () => false);

  // Enquanto a camada escura estiver aberta, o fundo não rola por trás dela.
  useEffect(() => {
    if (!escurecer) return undefined;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [escurecer]);

  const balao = (
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

  if (!escurecer) return balao;
  return montado ? createPortal(balao, document.body) : null;
}
