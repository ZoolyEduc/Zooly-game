import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import TelaAtividade from '../../components/atividade/TelaAtividade';
import EtapaHistoria from '../../components/atividade/EtapaHistoria';
import PerguntaMissao from '../../components/atividade/PerguntaMissao';
import FeedbackMascote from '../../components/atividade/FeedbackMascote';
import Carregando from '../../components/ui/Carregando';
import MensagemEstado from '../../components/ui/MensagemEstado';
import { MoedaBanana } from '../../components/ui/MoedaBanana';
import { ROTAS } from '../../config/rotas';
import { useAluno } from '../../contexts/AlunoContext';
import { useCarregamento } from '../../hooks/useCarregamento';
import {
  buscarConteudo,
  buscarTentativas,
  concluirAtividade,
  enviarRespostas,
  iniciarAtividade
} from '../../services/jogo';
import { mensagemErroApi } from '../../services/erros';
import {
  passoInicial,
  respostasParaApi,
  respostasSalvas,
  resultadoDaConclusao,
  rotuloVez,
  situacaoTentativa
} from '../../utils/tentativas';

/*
 * Missão publicada pelo professor: história (opcional) → perguntas → conclusão.
 *
 * Tentativas (regras da API, ver docs/INTEGRACAO-API.md):
 * - "iniciar" abre a próxima tentativa ou retoma a que ficou em andamento;
 * - cada resposta confirmada é salva na tentativa, para a criança poder continuar depois;
 * - a 1ª vez concluída é a oficial e a única que dá moedas; repetir não muda nada disso.
 * A API não devolve o gabarito ao aluno, então não há "certo/errado" por questão.
 */
export default function Missao() {
  const router = useRouter();
  const id = router.query.id;

  const buscar = useCallback(async () => {
    const atividade = await buscarConteudo(id);
    const inicio = await iniciarAtividade(id);
    return { atividade, inicio };
  }, [id]);

  const { dados, carregando, erro, recarregar } = useCarregamento(buscar, {
    ativo: router.isReady && Boolean(id),
    mensagemErro: 'Não foi possível abrir esta missão.'
  });

  if (carregando) {
    return (
      <TelaAtividade passo={0} total={0}>
        <Carregando texto="Preparando a missão..." />
      </TelaAtividade>
    );
  }

  if (erro || !dados?.atividade) {
    return (
      <TelaAtividade passo={0} total={0}>
        <MensagemEstado
          tipo="erro"
          titulo="Ops! Não deu para abrir a missão"
          texto={erro}
          onTentarNovamente={recarregar}
        >
          <button type="button" className="botao-texto" onClick={() => router.push(ROTAS.mapa)}>
            Voltar ao mapa
          </button>
        </MensagemEstado>
      </TelaAtividade>
    );
  }

  return (
    <JogarMissao
      key={`${id}-${dados.inicio?.tentativa?.id ?? 'sem-tentativa'}`}
      id={id}
      atividade={dados.atividade}
      inicio={dados.inicio}
    />
  );
}

function AvisoTentativa({ situacao }) {
  if (situacao.tipo === 'primeira') return null;
  return (
    <div className={`aviso-tentativa aviso-tentativa--${situacao.tipo}`} role="status">
      <b>{situacao.titulo}</b>
      {situacao.repeticao && <span className="aviso-tentativa__vez">{rotuloVez(situacao.numero)}</span>}
      <p>{situacao.texto}</p>
    </div>
  );
}

function HistoricoTentativas({ historico }) {
  if (!historico || historico.total < 2) return null;
  return (
    <div className="historico-tentativas">
      <b>Suas vezes nesta missão</b>
      <ul>
        {historico.tentativas.map((tentativa) => (
          <li
            key={tentativa.id}
            className={tentativa.oficial ? 'historico-tentativas__oficial' : ''}
          >
            {rotuloVez(tentativa.numeroTentativa)}
            {tentativa.oficial && <small> ⭐ a que vale</small>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function JogarMissao({ id, atividade, inicio }) {
  const router = useRouter();
  const { definirSaldo } = useAluno();
  const questoes = atividade.questoes || [];
  const temHistoria = Boolean(atividade.historia?.texto);
  const totalPassos = (temHistoria ? 1 : 0) + questoes.length + 1;

  const [respostas, setRespostas] = useState(() => respostasSalvas(inicio?.tentativa, questoes));
  const [situacao] = useState(() =>
    situacaoTentativa({
      tentativa: inicio?.tentativa,
      retomada: inicio?.tentativaRetomada,
      respondidas: Object.keys(respostasSalvas(inicio?.tentativa, questoes)).length
    })
  );
  const [passo, setPasso] = useState(() =>
    passoInicial({
      temHistoria,
      questoes,
      respostas: respostasSalvas(inicio?.tentativa, questoes),
      retomada: inicio?.tentativaRetomada
    })
  );
  const [mostrarAviso, setMostrarAviso] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const [resultado, setResultado] = useState(null);
  const [historico, setHistorico] = useState(null);
  // Salvamentos parciais em fila: o envio final só acontece depois deles,
  // para uma resposta antiga nunca chegar depois da última.
  const fila = useRef(Promise.resolve());

  const indiceQuestao = passo - (temHistoria ? 1 : 0);
  const naHistoria = temHistoria && passo === 0;
  const questao = !naHistoria && indiceQuestao < questoes.length ? questoes[indiceQuestao] : null;
  const recompensa = atividade.recompensaMoedas;

  function salvarParcial(atuais) {
    const lista = respostasParaApi(questoes, atuais);
    if (!lista.length) return;
    // Se falhar (rede), não atrapalha a criança: todas as respostas vão de novo no fim.
    fila.current = fila.current.then(() => enviarRespostas(id, lista)).catch(() => {});
  }

  async function enviarTudo() {
    setEnviando(true);
    setErroEnvio('');
    try {
      await fila.current;
      if (questoes.length > 0) await enviarRespostas(id, respostasParaApi(questoes, respostas));
      const conclusao = await concluirAtividade(id);
      if (typeof conclusao?.saldo === 'number') definirSaldo(conclusao.saldo);
      setResultado(conclusao);
      setPasso(totalPassos - 1);
      // O histórico é um extra: se não carregar, a tela final continua completa.
      buscarTentativas(id)
        .then(setHistorico)
        .catch(() => setHistorico(null));
    } catch (error) {
      setErroEnvio(mensagemErroApi(error, 'Não foi possível salvar suas respostas.'));
    } finally {
      setEnviando(false);
    }
  }

  function avancar() {
    setMostrarAviso(false);
    const proximo = passo + 1;
    if (proximo === totalPassos - 1) {
      enviarTudo();
      return;
    }
    if (questao) salvarParcial(respostas);
    setPasso(proximo);
  }

  const aviso = mostrarAviso ? <AvisoTentativa situacao={situacao} /> : null;
  const mensagemErroEnvio = erroEnvio && (
    <p className="mensagem-erro" role="alert">
      {erroEnvio}
    </p>
  );

  if (naHistoria) {
    return (
      <TelaAtividade
        passo={1}
        total={totalPassos}
        rodape={
          <button type="button" className="botao-atividade" onClick={avancar} disabled={enviando}>
            {enviando ? 'Salvando...' : 'Entendi'}
          </button>
        }
      >
        {aviso}
        <EtapaHistoria titulo={atividade.historia.titulo || atividade.titulo} texto={atividade.historia.texto} />
        {recompensa > 0 && !situacao.repeticao && (
          <p className="recompensa-missao">
            Esta missão vale <b>{recompensa}</b> <MoedaBanana tamanho={18} /> moedas
          </p>
        )}
        {mensagemErroEnvio}
      </TelaAtividade>
    );
  }

  if (questao) {
    const selecionada = respostas[questao.id] || '';
    return (
      <TelaAtividade
        passo={passo + 1}
        total={totalPassos}
        rodape={
          <button
            type="button"
            className={`botao-atividade ${selecionada ? 'botao-atividade--escuro' : ''}`}
            disabled={!selecionada || enviando}
            onClick={avancar}
          >
            {enviando ? 'Salvando...' : 'Confirmar'}
          </button>
        }
      >
        {aviso}
        <PerguntaMissao
          key={questao.id}
          questao={questao}
          numero={indiceQuestao + 1}
          total={questoes.length}
          selecionada={selecionada}
          onSelecionar={(alternativa) => setRespostas((atual) => ({ ...atual, [questao.id]: alternativa }))}
          desabilitado={enviando}
        />
        {mensagemErroEnvio}
      </TelaAtividade>
    );
  }

  const final = resultado ? resultadoDaConclusao(resultado) : null;
  return (
    <TelaAtividade
      passo={totalPassos}
      total={totalPassos}
      rodape={
        resultado ? (
          <button
            type="button"
            className="botao-atividade botao-atividade--escuro"
            onClick={() => router.push(`${ROTAS.mapa}?concluido=1`)}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="botao-atividade botao-atividade--escuro"
            onClick={enviarTudo}
            disabled={enviando}
          >
            {enviando ? 'Salvando...' : erroEnvio ? 'Tentar de novo' : 'Concluir missão'}
          </button>
        )
      }
    >
      <h1 className="atividade-titulo">
        <span className="atividade-titulo__icone" aria-hidden="true">
          🏆
        </span>{' '}
        {atividade.titulo}
      </h1>
      {enviando && <Carregando texto="Salvando suas respostas..." />}
      {final && (
        <FeedbackMascote titulo="Missão concluída! ✅" texto={final.texto || undefined}>
          {final.ganho ? (
            <p className="ganho-moedas">
              Você ganhou <b>{final.ganho}</b> <MoedaBanana tamanho={20} /> moedas!
            </p>
          ) : null}
        </FeedbackMascote>
      )}
      {final && <HistoricoTentativas historico={historico} />}
      {mensagemErroEnvio}
    </TelaAtividade>
  );
}
