import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FiChevronRight, FiLogOut, FiSmile, FiUsers } from 'react-icons/fi';
import GameFrame from '../components/layout/GameFrame';
import Modal from '../components/ui/Modal';
import { ROTAS } from '../config/rotas';
import { useAluno } from '../contexts/AlunoContext';
import { sairDeTudo } from '../services/sessao';

function CartaoConfig({ icone: Icone, titulo, descricao, onClick, className = '' }) {
  return (
    <button type="button" className={`cartao-config ${className}`} onClick={onClick}>
      <span className="cartao-config__icone" aria-hidden="true">
        <Icone />
      </span>
      <span className="cartao-config__texto">
        <b>{titulo}</b>
        <small>{descricao}</small>
      </span>
      <FiChevronRight aria-hidden="true" />
    </button>
  );
}

function detalhesDoAluno(aluno) {
  const turma = aluno?.turma;
  const nomeTurma = turma?.nome && (turma.periodo ? `${turma.nome} • ${turma.periodo}` : turma.nome);
  return [nomeTurma, aluno?.ra ? `RA ${aluno.ra}` : null].filter(Boolean);
}

export default function Configuracoes() {
  const router = useRouter();
  const { aluno, mascote, erro } = useAluno();
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  function sair() {
    sairDeTudo();
    router.replace(ROTAS.login);
  }

  return (
    <GameFrame ativo="config">
      <section className="perfil">
        <div className="perfil__avatar">
          <Image src={mascote.imagem} alt={`Avatar: ${mascote.nome}`} width={112} height={112} />
        </div>
        <b>{aluno?.nomeCompleto || 'Aventureiro'}</b>
        {detalhesDoAluno(aluno).map((linha) => (
          <span key={linha}>{linha}</span>
        ))}
        {erro && <small className="perfil__erro">{erro}</small>}
      </section>

      <CartaoConfig
        icone={FiSmile}
        titulo="Alterar Avatar"
        descricao="Escolha seu animal favorito"
        onClick={() => router.push(ROTAS.avatar)}
      />
      <CartaoConfig
        icone={FiUsers}
        titulo="Supervisão dos Pais"
        descricao="Controle de progresso"
        className="cartao-config--pais"
        onClick={() => router.push(ROTAS.painelPais)}
      />

      <button type="button" className="botao-sair" onClick={() => setConfirmandoSaida(true)}>
        <FiLogOut aria-hidden="true" /> SAIR DO APP
      </button>

      <Modal
        aberto={confirmandoSaida}
        onFechar={() => setConfirmandoSaida(false)}
        titulo="Sair do Zooly"
        className="modal-compra"
      >
        <h2>Quer mesmo sair?</h2>
        <p>
          Para voltar, você vai precisar do seu RA e da senha da turma. Peça ajuda a um adulto.
        </p>
        <div className="acoes-modal">
          <button type="button" className="botao-pilula botao-pilula--claro" onClick={() => setConfirmandoSaida(false)}>
            Ficar
          </button>
          <button type="button" className="botao-pilula botao-pilula--perigo" onClick={sair}>
            Sair
          </button>
        </div>
      </Modal>
    </GameFrame>
  );
}
