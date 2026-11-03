import { useState } from 'react';
import { useRouter } from 'next/router';
import { FiCheck, FiCheckCircle, FiLock } from 'react-icons/fi';
import GameFrame from '../components/layout/GameFrame';
import PageTitle from '../components/layout/PageTitle';
import Carregando from '../components/ui/Carregando';
import MensagemEstado from '../components/ui/MensagemEstado';
import RetratoMascote from '../components/ui/RetratoMascote';
import { ROTAS } from '../config/rotas';
import { useAluno } from '../contexts/AlunoContext';
import { useAvatares } from '../hooks/useAvatares';
import { selecionarAvatar } from '../services/jogo';
import { mensagemErroApi } from '../services/erros';

export default function EditarAvatar() {
  const router = useRouter();
  const { aluno, definirAvatar } = useAluno();
  const { avatares, carregando, erro, recarregar } = useAvatares();
  const [escolha, setEscolha] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erroSalvar, setErroSalvar] = useState('');

  const selecionado = escolha ?? aluno?.avatarSelecionado ?? '';
  const comArte = avatares.filter((avatar) => avatar.mascote);
  const adquiridos = comArte.filter((avatar) => avatar.adquirido);
  const mudou = selecionado && selecionado !== aluno?.avatarSelecionado;

  function escolher(avatar) {
    if (!avatar.adquirido) {
      router.push(ROTAS.loja);
      return;
    }
    setEscolha(avatar.id);
    setMensagem('');
  }

  async function confirmar() {
    setSalvando(true);
    setErroSalvar('');
    setMensagem('');
    try {
      const avatarId = await selecionarAvatar(selecionado);
      definirAvatar(avatarId);
      setMensagem('Pronto! Seu novo companheiro já está com você.');
    } catch (error) {
      setErroSalvar(mensagemErroApi(error, 'Não foi possível trocar o avatar.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <GameFrame ativo="config">
      <PageTitle voltarPara={ROTAS.configuracoes}>Alterar Avatar</PageTitle>
      <p className="avatar-instrucao">Escolha seu companheiro de aventura!</p>

      {carregando && <Carregando texto="Buscando seus avatares..." />}
      {!carregando && erro && (
        <MensagemEstado tipo="erro" titulo="Ops!" texto={erro} onTentarNovamente={recarregar} />
      )}

      {!carregando && !erro && adquiridos.length === 0 && (
        <MensagemEstado titulo="Você ainda não tem avatares" texto="Junte moedas nas missões e escolha um amigo na loja!">
          <button type="button" className="botao-texto" onClick={() => router.push(ROTAS.loja)}>
            Ir para a loja
          </button>
        </MensagemEstado>
      )}

      {!carregando && !erro && (
        <ul className="grade-avatares grade-avatares--editar" role="radiogroup" aria-label="Avatares">
          {comArte.map((avatar) => {
            const ativo = selecionado === avatar.id;
            return (
              <li key={avatar.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  className={`opcao-avatar ${ativo ? 'opcao-avatar--ativo' : ''}`}
                  onClick={() => escolher(avatar)}
                >
                  <RetratoMascote mascote={avatar.mascote} tamanho={124} bloqueado={!avatar.adquirido} />
                  <b>{avatar.mascote.nome}</b>
                  {ativo && (
                    <span className="selo-selecionado">
                      <FiCheckCircle aria-hidden="true" /> Selecionado
                    </span>
                  )}
                  {!avatar.adquirido && (
                    <span className="selo-loja">
                      <FiLock aria-hidden="true" /> Na loja
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {mensagem && (
        <p className="mensagem-sucesso" role="status">
          {mensagem}
        </p>
      )}
      {erroSalvar && (
        <p className="mensagem-erro" role="alert">
          {erroSalvar}
        </p>
      )}

      {!carregando && !erro && adquiridos.length > 0 && (
        <button type="button" className="botao-confirmar-escolha" onClick={confirmar} disabled={!mudou || salvando}>
          <FiCheck aria-hidden="true" /> {salvando ? 'Salvando...' : 'Confirmar Escolha'}
        </button>
      )}
    </GameFrame>
  );
}
