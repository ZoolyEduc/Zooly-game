import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { FiArrowLeft, FiArrowRight, FiCheck, FiLock, FiVolume2, FiVolumeX } from 'react-icons/fi';
import Cenario from '../components/layout/Cenario';
import Marca from '../components/marca/Marca';
import { MoedaBanana } from '../components/ui/MoedaBanana';
import { IMAGENS } from '../config/imagens';
import { LISTA_MASCOTES } from '../config/mascotes';
import { ROTAS } from '../config/rotas';
import { definirIntroPendente } from '../services/sessao';
import { useLeitorVoz } from '../hooks/useLeitorVoz';
import { rotaDoTreino } from '../utils/rotasMissao';

/*
 * Introdução guiada ao universo Zooly:
 * boas-vindas → mascotes → proposta → mapa → missões → missão de treino (opcional).
 * Nada aqui é enviado à API; ao terminar, só a marca local "introdução pendente" é removida.
 */
const ETAPAS = [
  {
    titulo: 'Olá, pequeno explorador!',
    texto: (
      <>
        Você acaba de chegar ao <strong className="texto-verde">Vale do Ribeira</strong>, um lugar cheio de florestas
        encantadas, rios, cachoeiras e muitos animais!
      </>
    ),
    leitura:
      'Olá, pequeno explorador! Você acaba de chegar ao Vale do Ribeira, um lugar cheio de florestas encantadas, rios, cachoeiras e muitos animais!'
  },
  {
    titulo: 'Estes são seus novos amigos!',
    texto: <>As histórias do Vale do Ribeira precisam de você! Conheça os animais que vão acompanhar sua aventura.</>,
    leitura:
      'Estes são seus novos amigos! As histórias do Vale do Ribeira precisam de você! Conheça o Saruê, a Cobra, o Lagarto e o Papagaio.',
    conteudo: 'mascotes'
  },
  {
    titulo: 'Vamos trazer a magia de volta?',
    texto: (
      <>
        Com a sua ajuda, nossos amigos vão descobrir histórias incríveis! Leia, escute, complete atividades e explore o
        Vale do Ribeira.
      </>
    ),
    leitura:
      'Vamos trazer a magia de volta? Com a sua ajuda, nossos amigos vão descobrir histórias incríveis! Leia, escute, complete atividades e explore o Vale do Ribeira.'
  },
  {
    titulo: 'Este é o mapa do Vale',
    texto: <>Cada cidade guarda uma aventura. Toque na cidade para ver a missão.</>,
    leitura:
      'Este é o mapa do Vale. Cada cidade guarda uma aventura. Toque na cidade para ver a missão. A bolinha brilhando é a missão que você pode jogar agora. O cadeado é uma missão trancada. E o sinal de certo é uma missão que você já fez.',
    conteudo: 'mapa'
  },
  {
    titulo: 'Como funcionam as missões',
    texto: <>Seu professor libera as missões. Cada uma tem três passos:</>,
    leitura:
      'Como funcionam as missões. Seu professor libera as missões. Cada uma tem três passos. Primeiro, ouça ou leia a história. Depois, responda as perguntas. No fim, você ganha moedas para usar na loja. Que tal treinar uma missão agora?',
    conteudo: 'missoes'
  }
];

// Grade de cartões: 2x2 em celulares estreitos e 4 colunas quando há espaço.
function ConteudoMascotes() {
  return (
    <ul className="amigos-trilha" aria-label="Seus novos amigos">
      {LISTA_MASCOTES.map((mascote) => (
        <li key={mascote.id} className="amigo">
          <span className="amigo__foto">
            <Image src={mascote.imagem} alt={mascote.nome} width={120} height={120} sizes="120px" />
          </span>
          <b className="amigo__nome">{mascote.nome}</b>
        </li>
      ))}
    </ul>
  );
}

function ConteudoMapa() {
  return (
    <div className="guia-cartao">
      <Image
        className="guia-mapa"
        src={IMAGENS.mapas.valeDoRibeira}
        alt="Mapa do Vale do Ribeira com as cidades das missões"
        width={150}
        height={225}
      />
      <ul className="guia-legenda">
        <li>
          <span className="guia-icone guia-icone--disponivel" aria-hidden="true" />
          Pode jogar agora
        </li>
        <li>
          <span className="guia-icone guia-icone--trancada" aria-hidden="true">
            <FiLock />
          </span>
          Trancada: termine a anterior
        </li>
        <li>
          <span className="guia-icone guia-icone--feita" aria-hidden="true">
            <FiCheck />
          </span>
          Missão feita
        </li>
      </ul>
    </div>
  );
}

function ConteudoMissoes() {
  return (
    <ol className="guia-cartao guia-passos">
      <li>
        <span className="guia-passos__icone" aria-hidden="true">📘</span>
        Ouça ou leia a história
      </li>
      <li>
        <span className="guia-passos__icone" aria-hidden="true">🧩</span>
        Responda as perguntas
      </li>
      <li>
        <span className="guia-passos__icone" aria-hidden="true">
          <MoedaBanana tamanho={26} />
        </span>
        Ganhe moedas para a loja
      </li>
    </ol>
  );
}

const CONTEUDOS = { mascotes: ConteudoMascotes, mapa: ConteudoMapa, missoes: ConteudoMissoes };

export default function Introducao() {
  const [etapa, setEtapa] = useState(0);
  const router = useRouter();
  const { suportado, falando, falar, parar } = useLeitorVoz();
  const atual = ETAPAS[etapa];
  const ultima = etapa === ETAPAS.length - 1;
  const Conteudo = CONTEUDOS[atual.conteudo];

  function mudarEtapa(nova) {
    parar();
    setEtapa(nova);
  }

  function concluir(destino) {
    parar();
    definirIntroPendente(false);
    router.push(destino);
  }

  return (
    <Cenario classe={`tela-introducao ${atual.conteudo === 'mascotes' ? 'tela-introducao--amigos' : ''}`}>
      <div className="introducao__topo">
        <div className="progresso-etapas" aria-label={`Etapa ${etapa + 1} de ${ETAPAS.length}`}>
          {ETAPAS.map((item, indice) => (
            <span key={item.titulo} className={indice === etapa ? 'ativo' : ''} />
          ))}
        </div>
        {suportado && (
          <button
            type="button"
            className="som-botao"
            aria-label={falando ? 'Parar leitura' : 'Ouvir o texto'}
            onClick={() => (falando ? parar() : falar(atual.leitura))}
          >
            {falando ? <FiVolumeX /> : <FiVolume2 />}
          </button>
        )}
      </div>

      {/* As etapas de guia (mapa e missões) usam o espaço da logo para a ilustração. */}
      {!['mapa', 'missoes'].includes(atual.conteudo) && <Marca />}

      <section className={`painel-introducao ${Conteudo ? 'painel-introducao--amigos' : ''}`} aria-live="polite">
        <span className="enfeite enfeite--esquerda" aria-hidden="true">〝</span>
        <h1>{atual.titulo}</h1>
        <p>{atual.texto}</p>
        <span className="enfeite enfeite--direita" aria-hidden="true">〟</span>
      </section>

      {Conteudo && <Conteudo />}

      <div className="acoes-introducao">
        {etapa > 0 && (
          <button type="button" className="botao-voltar" onClick={() => mudarEtapa(etapa - 1)} aria-label="Voltar">
            <FiArrowLeft />
          </button>
        )}
        {ultima ? (
          <button type="button" className="botao-principal" onClick={() => concluir(rotaDoTreino(1))}>
            Treinar uma missão <FiArrowRight aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="botao-principal" onClick={() => mudarEtapa(etapa + 1)}>
            Continuar <FiArrowRight aria-hidden="true" />
          </button>
        )}
      </div>
      {ultima && (
        <button type="button" className="link-secundario" onClick={() => concluir(ROTAS.inicio)}>
          Pular o treino e ver minhas missões
        </button>
      )}
    </Cenario>
  );
}
