import Image, { getImageProps } from 'next/image';
import { FiCheck, FiLock } from 'react-icons/fi';
import { IMAGENS } from '../../config/imagens';
import { POSICAO_INICIAL_MASCOTE } from '../../config/mapa';
import { TEXTO_SITUACAO, situacaoMissao } from '../../utils/missoes';

const posicao = ({ x, y }) => ({ left: `${x}%`, top: `${y}%` });

// Arte do mapa por dispositivo: celular (< 600px) usa a versão mobile e tablet usa a
// versão maior. As duas têm a mesma composição e proporção, então as posições de
// config/mapa.js valem para ambas.
const ARTE_MAPA = {
  alt: 'Mapa ilustrado do Vale do Ribeira com as cidades Eldorado, Sete Barras, Iporanga, Registro, Iguape e Cananéia',
  fill: true,
  loading: 'eager',
};
const { props: { srcSet: srcSetTablet } } = getImageProps({
  ...ARTE_MAPA,
  src: IMAGENS.mapas.valeDoRibeiraTablet,
  sizes: '(max-width: 900px) 100vw, 900px',
});
const { props: propsMapaMobile } = getImageProps({
  ...ARTE_MAPA,
  src: IMAGENS.mapas.valeDoRibeiraMobile,
  sizes: '100vw',
});

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
      <picture>
        <source media="(min-width: 600px)" srcSet={srcSetTablet} />
        {/* fetchpriority em minúsculas: o React 18 não reconhece a prop fetchPriority. */}
        <img
          {...propsMapaMobile}
          alt={propsMapaMobile.alt}
          className="mapa-cena__arte"
          fetchpriority="high"
        />
      </picture>

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
