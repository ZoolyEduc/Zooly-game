import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiCheckCircle } from 'react-icons/fi';
import GameFrame from '../components/layout/GameFrame';
import CartaoAvatarLoja from '../components/loja/CartaoAvatarLoja';
import ModalCompra from '../components/loja/ModalCompra';
import Carregando from '../components/ui/Carregando';
import MensagemEstado from '../components/ui/MensagemEstado';
import { IMAGENS } from '../config/imagens';
import { ROTAS } from '../config/rotas';
import { useAluno } from '../contexts/AlunoContext';
import { useAvatares } from '../hooks/useAvatares';
import { useCarregamento } from '../hooks/useCarregamento';
import { buscarMovimentacoes } from '../services/jogo';
import { descreverMovimentacao } from '../utils/moedas';

const buscarExtrato = () => buscarMovimentacoes({ limite: 5 });

export default function Loja() {
  const { aluno, saldo } = useAluno();
  const { avatares, carregando, erro, recarregar, marcarAdquirido } = useAvatares();
  const { dados: extrato, recarregar: recarregarExtrato } = useCarregamento(buscarExtrato);
  const [escolhido, setEscolhido] = useState(null);
  const [mensagem, setMensagem] = useState('');

  function aoComprar(avatar) {
    marcarAdquirido(avatar.id);
    recarregarExtrato();
  }

  function aoFecharCompra(resumo) {
    setEscolhido(null);
    if (resumo) setMensagem(resumo);
  }

  return (
    <GameFrame ativo="loja">
      <section className="loja-banner">
        <Image src={IMAGENS.moedas.banana} alt="" width={58} height={62} />
        <p>Use suas moedas para comprar novos avatares!</p>
      </section>

      {mensagem && (
        <p className="mensagem-sucesso" role="status">
          <FiCheckCircle aria-hidden="true" /> {mensagem}
        </p>
      )}

      {carregando && <Carregando texto="Abrindo a loja..." />}
      {!carregando && erro && (
        <MensagemEstado tipo="erro" titulo="A loja não abriu" texto={erro} onTentarNovamente={recarregar} />
      )}

      {!carregando && !erro && (
        <>
          <ul className="grade-avatares">
            {avatares.map((avatar) => (
              <CartaoAvatarLoja
                key={avatar.id}
                avatar={avatar}
                emUso={aluno?.avatarSelecionado === avatar.id}
                saldo={saldo}
                onEscolher={(item) => {
                  setMensagem('');
                  setEscolhido(item);
                }}
              />
            ))}
          </ul>
          <p className="loja-link-avatar">
            Já tem avatares? <Link href={ROTAS.avatar}>Trocar meu avatar</Link>
          </p>
        </>
      )}

      {extrato?.length > 0 && (
        <section className="extrato" aria-label="Últimas moedas">
          <h2>Últimas moedas</h2>
          <ul>
            {extrato.map((item) => (
              <li key={item._id || `${item.createdAt}-${item.motivo}`}>
                <span>{descreverMovimentacao(item)}</span>
                <b className={item.tipo === 'ganho' ? 'extrato__ganho' : 'extrato__gasto'}>
                  {item.tipo === 'ganho' ? '+' : '−'}
                  {item.quantidade}
                </b>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ModalCompra avatar={escolhido} onComprado={aoComprar} onFechar={aoFecharCompra} />
    </GameFrame>
  );
}
