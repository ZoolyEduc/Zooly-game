import Image from 'next/image';
import { FiCheck, FiLock } from 'react-icons/fi';
import { IMAGENS } from '../../config/imagens';
import { POSICAO_INICIAL_MASCOTE } from '../../config/mapa';
import { TEXTO_SITUACAO, situacaoMissao } from '../../utils/missoes';

const posicao = ({ x, y }) => ({ left: `${x}%`, top: `${y}%` });

function rotuloCidade(cidade, situacao) {
  const missao = cidade.missao ? `: ${cidade.missao.titulo}` : '';
  return `${cidade.nome}${missao} (${TEXTO_SITUACAO[situacao]})`;
}

export default function MapaCena({ cidades, cidadeFoco, onCidade, children }) {
  // O papagaio pousa ao lado do marcador da cidade atual, sem cobrir a placa com o nome.
  const posicaoMascote = cidadeFoco
    ? cidadeFoco.mascote || cidadeFoco.ponto
    : POSICAO_INICIAL_MASCOTE;

  return (
    <div className="mapa-cena">
      <Image
        className="mapa-cena__arte"
        src={IMAGENS.mapas.valeDoRibeira}
        alt="Mapa ilustrado do Vale do Ribeira com as cidades Eldorado, Sete Barras, Iporanga, Registro, Iguape e Cananéia"
        fill
        priority
        sizes="(max-width: 430px) 100vw, 430px"
      />

      {cidades.map((cidade) => {
        const situacao = situacaoMissao(cidade.missao);
        return (
          <button
            key={cidade.id}
            type="button"
            className={`mapa-cidade mapa-cidade--${situacao}`}
            style={posicao(cidade.rotulo)}
            onClick={() => onCidade(cidade, situacao)}
            aria-label={rotuloCidade(cidade, situacao)}
          >
            {situacao === 'concluida' && (
              <span className="mapa-cidade__selo mapa-cidade__selo--ok" aria-hidden="true">
                <FiCheck />
              </span>
            )}
            {situacao === 'bloqueada' && (
              <span className="mapa-cidade__selo" aria-hidden="true">
                <FiLock />
              </span>
            )}
            {situacao === 'disponivel' && <span className="mapa-cidade__pulso" aria-hidden="true" />}
          </button>
        );
      })}

      <span
        className={`mapa-mascote ${cidadeFoco ? 'mapa-mascote--foco' : ''}`}
        style={posicao(posicaoMascote)}
        aria-hidden="true"
      >
        <Image src={IMAGENS.mascotes.papagaio} alt="" width={78} height={110} />
      </span>

      {children}
    </div>
  );
}
