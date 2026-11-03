import Image from 'next/image';
import { IMAGENS } from '../../config/imagens';
import BotaoOuvir from '../ui/BotaoOuvir';

function textoDaCidade({ nome, situacao }) {
  if (situacao === 'disponivel' || situacao === 'andamento') return `Encontramos uma nova aventura em ${nome}!`;
  if (situacao === 'concluida') return `Você já ajudou ${nome}!`;
  if (situacao === 'bloqueada') return `A aventura de ${nome} ainda está trancada. Termine a missão anterior para liberar.`;
  return `Ainda não há aventura em ${nome}. Aguarde as próximas missões!`;
}

// Conteúdo do modal aberto ao tocar em uma cidade do mapa.
export default function ConteudoCidade({ cidade, onJogar }) {
  const { missao, situacao } = cidade;
  const texto = textoDaCidade(cidade);
  const podeJogar = missao && situacao !== 'bloqueada';

  return (
    <>
      <Image className="modal-fase__mascote" src={IMAGENS.mascotes.papagaio} alt="" width={96} height={130} />
      <p className="modal-fase__texto">{texto}</p>
      {missao && <b className="modal-fase__missao">{missao.titulo}</b>}
      <BotaoOuvir texto={missao ? `${texto} ${missao.titulo}` : texto} />
      {podeJogar && (
        <button
          type="button"
          className={`botao-pilula ${situacao === 'concluida' ? 'botao-pilula--claro' : ''}`}
          onClick={() => onJogar(missao)}
        >
          {situacao === 'concluida' ? 'Jogar de novo' : 'Começar aventura'}
        </button>
      )}
    </>
  );
}
