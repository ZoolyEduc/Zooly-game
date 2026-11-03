import Alternativas from './Alternativas';
import BotaoOuvir from '../ui/BotaoOuvir';

export default function PerguntaMissao({ questao, numero, total, selecionada, onSelecionar, desabilitado }) {
  const leitura = `${questao.enunciado} ${questao.alternativas.map((alternativa) => alternativa.texto).join(', ')}`;

  return (
    <>
      <h1 className="atividade-titulo">
        <span className="atividade-titulo__icone" aria-hidden="true">
          🧩
        </span>{' '}
        Responda
      </h1>
      <p className="atividade-subtitulo">
        Pergunta {numero} de {total}
      </p>
      <div className="cartao-pergunta">
        <p>{questao.enunciado}</p>
        <BotaoOuvir texto={leitura} rotulo="Ouvir pergunta" />
      </div>
      <Alternativas
        opcoes={questao.alternativas}
        selecionada={selecionada}
        onSelecionar={onSelecionar}
        desabilitado={desabilitado}
        rotulo={questao.enunciado}
      />
    </>
  );
}
