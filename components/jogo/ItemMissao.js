import { FiCalendar, FiCheck, FiClock, FiLock, FiPlay } from "react-icons/fi";
import { TEXTO_SITUACAO } from "../../utils/missoes";

const ICONES = {
  concluida: FiCheck,
  andamento: FiClock,
  disponivel: FiPlay,
  bloqueada: FiLock,
};

export default function ItemMissao({ missao, situacao, cidade, onAbrir }) {
  const Icone = ICONES[situacao] || FiCalendar;
  return (
    <li>
      <button
        type="button"
        className={`missao missao--${situacao}`}
        onClick={() => onAbrir(missao, situacao)}
        aria-label={`${missao.titulo}: ${TEXTO_SITUACAO[situacao]}`}
      >
        <span className="missao__icone" aria-hidden="true">
          <Icone />
        </span>
        <span className="missao__titulo">
          <b>{missao.titulo}</b>
          <small>
            {TEXTO_SITUACAO[situacao]}
            {cidade ? ` · ${cidade.nome}` : ""}
            {missao.atrasada && !missao.concluida ? " · prazo encerrado" : ""}
          </small>
        </span>
        <span className="missao__acao" aria-hidden="true">
          {situacao === "concluida"
            ? "FEITA"
            : situacao === "bloqueada"
              ? ""
              : "JOGAR"}
        </span>
      </button>
    </li>
  );
}
