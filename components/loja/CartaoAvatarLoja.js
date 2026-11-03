import { FiCheckCircle } from 'react-icons/fi';
import RetratoMascote from '../ui/RetratoMascote';
import { MoedaBanana } from '../ui/MoedaBanana';

// avatar-05 e avatar-06 existem na API, mas ainda não têm arte: aparecem como "Em breve".
export default function CartaoAvatarLoja({ avatar, emUso, saldo, onEscolher }) {
  const semArte = !avatar.mascote;
  const faltam = typeof saldo === 'number' ? avatar.preco - saldo : 0;

  let acao;
  if (semArte) {
    acao = <span className="cartao-avatar__estado">Em breve</span>;
  } else if (avatar.adquirido) {
    acao = (
      <span className="cartao-avatar__estado cartao-avatar__estado--ok">
        <FiCheckCircle aria-hidden="true" /> {emUso ? 'Em uso' : 'Adquirido'}
      </span>
    );
  } else {
    acao = (
      <button
        type="button"
        className="botao-preco"
        onClick={() => onEscolher(avatar)}
        aria-label={`Comprar ${avatar.mascote.nome} por ${avatar.preco} moedas`}
      >
        <MoedaBanana tamanho={22} /> {avatar.preco}
      </button>
    );
  }

  return (
    <li className="cartao-avatar">
      <RetratoMascote mascote={avatar.mascote} tamanho={128} bloqueado={semArte} />
      <b>{avatar.mascote?.nome || 'Novo amigo'}</b>
      {acao}
      {!semArte && !avatar.adquirido && faltam > 0 && <small className="cartao-avatar__falta">Faltam {faltam}</small>}
    </li>
  );
}
