import Image from "next/image";
import GameFrame from "../components/layout/GameFrame";
import PageTitle from "../components/layout/PageTitle";
import BarraProgresso from "../components/ui/BarraProgresso";
import Carregando from "../components/ui/Carregando";
import MensagemEstado from "../components/ui/MensagemEstado";
import { IMAGENS } from "../config/imagens";
import { ROTAS } from "../config/rotas";
import { useAluno } from "../contexts/AlunoContext";
import { useMissoes } from "../hooks/useMissoes";
import { resumoProgresso } from "../utils/missoes";

function formatarQuando(dataIso) {
  if (!dataIso) return "";
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return "";
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);
  const hora = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (data.toDateString() === hoje.toDateString()) return `Hoje, ${hora}`;
  if (data.toDateString() === ontem.toDateString()) return `Ontem, ${hora}`;
  return `${data.toLocaleDateString("pt-BR")}, ${hora}`;
}

const ICONES = [
  IMAGENS.icones.quebraCabeca,
  IMAGENS.icones.livro,
  IMAGENS.icones.musica,
];

function ListaRecentes({ itens }) {
  return (
    <ul className="lista-recentes">
      {itens.map((item, indice) => (
        <li key={`${item.titulo}-${indice}`}>
          <span className="lista-recentes__icone">
            <Image
              src={item.icone || ICONES[indice % ICONES.length]}
              alt=""
              width={22}
              height={22}
            />
          </span>
          <div>
            <b>{item.titulo}</b>
            <small>{item.quando}</small>
          </div>
          <em className={item.concluido ? "status--ok" : "status--andamento"}>
            {item.status}
          </em>
        </li>
      ))}
    </ul>
  );
}

function PainelProgresso() {
  const { saldo } = useAluno();
  const { missoes, progresso, carregando, erro, recarregar } = useMissoes({
    comProgresso: true,
  });
  if (carregando) return <Carregando texto="Buscando o progresso..." />;
  if (erro) {
    return (
      <MensagemEstado
        tipo="erro"
        titulo="Não foi possível carregar"
        texto={erro}
        onTentarNovamente={recarregar}
      />
    );
  }

  const resumo = resumoProgresso(missoes);
  const atrasadas = missoes.filter((missao) => missao.atrasada && !missao.concluida).length;
  const titulos = Object.fromEntries(
    missoes.map((missao) => [String(missao.id), missao.titulo]),
  );
  const recentes = Object.values(progresso)
    .filter((item) => titulos[String(item.atividade)])
    .sort((a, b) =>
      String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")),
    )
    .slice(0, 5)
    .map((item) => ({
      titulo: titulos[String(item.atividade)],
      quando: formatarQuando(
        item.concluidaEm || item.updatedAt || item.createdAt,
      ),
      status: item.status === "concluida" ? "Concluído" : "Em progresso",
      concluido: item.status === "concluida",
    }));

  return (
    <>
      <section className="cartao-pais cartao-pais--meta">
        <b>Missões da turma</b>
        <p>
          {resumo.concluidas} de {resumo.total} concluídas ({resumo.percentual}
          %)
        </p>
        <BarraProgresso valor={resumo.percentual} rotulo="Missões concluídas" />
        {atrasadas > 0 && (
          <small className="cartao-pais__alerta">
            {atrasadas === 1 ? '1 missão está' : `${atrasadas} missões estão`} com o prazo encerrado.
          </small>
        )}
        {typeof saldo === "number" && <small>Saldo de moedas: {saldo}</small>}
      </section>

      <h3 className="titulo-recentes">Atividades Recentes</h3>
      {recentes.length > 0 ? (
        <ListaRecentes itens={recentes} />
      ) : (
        <p className="texto-vazio">Nenhuma atividade iniciada ainda.</p>
      )}

      <section className="cartao-pais cartao-pais--desempenho">
        <h3>
          <Image
            src={IMAGENS.interface.graficoDesempenho}
            alt=""
            width={20}
            height={20}
          />{" "}
          Desempenho
        </h3>
        <p className="texto-vazio">
          O desempenho por habilidade ainda não está disponível para
          responsáveis. A professora acompanha esses dados no Zooly Web.
        </p>
      </section>
    </>
  );
}

export default function PainelPais() {
  return (
    <GameFrame ativo="config">
      <PageTitle voltarPara={ROTAS.configuracoes}>
        Supervisão dos Pais
      </PageTitle>
      <PainelProgresso />
    </GameFrame>
  );
}
