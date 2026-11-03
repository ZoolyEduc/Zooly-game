import { useState } from 'react';
import Modal from '../ui/Modal';
import RetratoMascote from '../ui/RetratoMascote';
import { MoedaBanana } from '../ui/MoedaBanana';
import { useAluno } from '../../contexts/AlunoContext';
import { comprarAvatar, selecionarAvatar } from '../../services/jogo';
import { mensagemErroApi } from '../../services/erros';

/*
 * Confirmação de compra em duas etapas: "Comprar X?" → "X agora é seu amigo! Usar agora?".
 * O saldo mostrado é o da API; o aviso de saldo insuficiente só evita uma
 * tentativa que a API recusaria. Quem decide a compra é sempre a API.
 */
export default function ModalCompra({ avatar, onComprado, onFechar }) {
  const { saldo, definirSaldo, definirAvatar } = useAluno();
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [comprado, setComprado] = useState(false);

  const saldoConhecido = typeof saldo === 'number';
  const saldoInsuficiente = Boolean(avatar) && !comprado && saldoConhecido && saldo < avatar.preco;

  function fechar(resumo) {
    setErro('');
    setComprado(false);
    onFechar(resumo);
  }

  async function executar(acao, mensagemPadrao) {
    setOcupado(true);
    setErro('');
    try {
      await acao();
    } catch (error) {
      setErro(mensagemErroApi(error, mensagemPadrao));
    } finally {
      setOcupado(false);
    }
  }

  const comprar = () =>
    executar(async () => {
      const resposta = await comprarAvatar(avatar.id);
      if (typeof resposta.saldo === 'number') definirSaldo(resposta.saldo);
      setComprado(true);
      onComprado(avatar);
    }, 'Não foi possível comprar este avatar.');

  const usarAgora = () =>
    executar(async () => {
      definirAvatar(await selecionarAvatar(avatar.id));
      fechar(`${avatar.mascote.nome} agora é o seu avatar!`);
    }, 'Não foi possível trocar o avatar.');

  const mensagemErro = erro && (
    <p className="mensagem-erro" role="alert">
      {erro}
    </p>
  );

  return (
    <Modal
      aberto={Boolean(avatar)}
      onFechar={ocupado ? undefined : () => fechar(comprado ? `${avatar.mascote.nome} agora é seu amigo!` : '')}
      titulo="Comprar avatar"
      className="modal-compra"
    >
      {avatar && !comprado && (
        <>
          <RetratoMascote mascote={avatar.mascote} tamanho={120} />
          <h2>Comprar {avatar.mascote.nome}?</h2>
          <p className="modal-compra__preco">
            <MoedaBanana tamanho={24} /> {avatar.preco} moedas
          </p>
          {saldoConhecido && <small>Você tem {saldo} moedas</small>}
          {saldoInsuficiente && (
            <p className="aviso-inline" role="status">
              Faltam {avatar.preco - saldo} moedas. Complete missões para ganhar mais!
            </p>
          )}
          {mensagemErro}
          <div className="acoes-modal">
            <button type="button" className="botao-pilula botao-pilula--claro" onClick={() => fechar('')} disabled={ocupado}>
              Agora não
            </button>
            <button type="button" className="botao-pilula" onClick={comprar} disabled={ocupado || saldoInsuficiente}>
              {ocupado ? 'Comprando...' : 'Comprar'}
            </button>
          </div>
        </>
      )}
      {avatar && comprado && (
        <>
          <RetratoMascote mascote={avatar.mascote} tamanho={120} />
          <h2>{avatar.mascote.nome} agora é seu amigo!</h2>
          {mensagemErro}
          <div className="acoes-modal">
            <button
              type="button"
              className="botao-pilula botao-pilula--claro"
              onClick={() => fechar(`${avatar.mascote.nome} agora é seu amigo!`)}
              disabled={ocupado}
            >
              Depois
            </button>
            <button type="button" className="botao-pilula" onClick={usarAgora} disabled={ocupado}>
              {ocupado ? 'Trocando...' : 'Usar agora'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
