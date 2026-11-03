import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import GameFrame from '../components/layout/GameFrame';
import ItemMissao from '../components/jogo/ItemMissao';
import BarraProgresso from '../components/ui/BarraProgresso';
import BotaoOuvir from '../components/ui/BotaoOuvir';
import Carregando from '../components/ui/Carregando';
import MensagemEstado from '../components/ui/MensagemEstado';
import { IMAGENS } from '../config/imagens';
import { useAluno } from '../contexts/AlunoContext';
import { useMissoes } from '../hooks/useMissoes';
import { cidadeDaMissao, missaoDisponivel, resumoProgresso, situacaoMissao } from '../utils/missoes';
import { ROTAS } from '../config/rotas';
import { rotaDaMissao, rotaDoTreino } from '../utils/rotasMissao';
import { primeiroNome } from '../utils/texto';

const BOAS_VINDAS = 'Aqui você aprende brincando e ajuda seus amigos da floresta!';

function orientacao({ carregando, missoes }) {
  if (carregando || missoes.length === 0) return BOAS_VINDAS;
  const proxima = missaoDisponivel(missoes);
  if (proxima) return `Sua próxima aventura é "${proxima.titulo}". Toque em JOGAR para começar!`;
  return 'Você terminou todas as missões! Logo seu professor vai liberar novas aventuras.';
}

export default function Aventura() {
  const router = useRouter();
  const { aluno } = useAluno();
  const { missoes, progresso, carregando, erro, recarregar } = useMissoes({ comProgresso: true });
  const [aviso, setAviso] = useState('');
  const nome = primeiroNome(aluno?.nomeCompleto) || 'aventureiro';
  const resumo = resumoProgresso(missoes);
  const mensagem = orientacao({ carregando, missoes });

  function abrir(missao, situacao) {
    if (situacao === 'bloqueada') {
      setAviso(`"${missao.titulo}" ainda está trancada. Termine a missão anterior para liberar!`);
      return;
    }
    router.push(rotaDaMissao(missao));
  }

  return (
    <GameFrame ativo="inicio">
      <section className="home-saudacao">
        <h1>Olá, {nome}!</h1>
        <div className="home-boas-vindas">
          <Image src={IMAGENS.mascotes.cobra} alt="" width={82} height={96} />
          <div className="home-boas-vindas__texto">
            <p aria-live="polite">{mensagem}</p>
            <BotaoOuvir texto={`Olá, ${nome}! ${mensagem}`} />
          </div>
        </div>
      </section>

      <h2 className="rotulo-secao">SUAS MISSÕES</h2>

      {carregando && <Carregando texto="Buscando suas missões..." />}

      {!carregando && erro && (
        <MensagemEstado tipo="erro" titulo="Ops!" texto={erro} onTentarNovamente={recarregar} />
      )}

      {!carregando && !erro && missoes.length === 0 && (
        <MensagemEstado
          titulo="Nenhuma missão por enquanto"
          texto="Seu professor ainda não liberou aventuras para a sua turma. Volte mais tarde!"
          onTentarNovamente={recarregar}
        />
      )}

      {aviso && (
        <p className="aviso-inline" role="status">
          {aviso}
        </p>
      )}

      {!carregando && !erro && missoes.length > 0 && (
        <>
          <ul className="lista-missoes">
            {missoes.map((missao) => (
              <ItemMissao
                key={missao.id}
                missao={missao}
                situacao={situacaoMissao(missao, progresso[String(missao.id)])}
                cidade={cidadeDaMissao(missoes, missao.id)}
                onAbrir={abrir}
              />
            ))}
          </ul>

          <section className="cartao-progresso" aria-label="Progresso da aventura">
            <b>Progresso da aventura</b>
            <BarraProgresso valor={resumo.percentual} rotulo="Missões concluídas" />
            <small>
              {resumo.concluidas} de {resumo.total} {resumo.total === 1 ? 'missão concluída' : 'missões concluídas'}
            </small>
          </section>
        </>
      )}

      {/* Fora da lista de propósito: o treino não é missão oficial e não vale moedas. */}
      <section className="cartao-treino" aria-labelledby="titulo-treino">
        <h2 id="titulo-treino">Aprenda a jogar</h2>
        <p>Reveja os amigos e o mapa, ou faça uma missão de treino. O treino não vale moedas.</p>
        <div className="cartao-treino__acoes">
          <button type="button" className="botao-pilula" onClick={() => router.push(rotaDoTreino(1))}>
            Missão de treino
          </button>
          <button type="button" className="botao-pilula botao-pilula--claro" onClick={() => router.push(ROTAS.introducao)}>
            Como jogar
          </button>
        </div>
      </section>
    </GameFrame>
  );
}
