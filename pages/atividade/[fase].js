import { useState } from "react";
import { useRouter } from "next/router";
import { FiCheckCircle, FiMic, FiVolume2 } from "react-icons/fi";
import TelaAtividade from "../../components/atividade/TelaAtividade";
import EtapaHistoria from "../../components/atividade/EtapaHistoria";
import Alternativas from "../../components/atividade/Alternativas";
import FeedbackMascote from "../../components/atividade/FeedbackMascote";
import BotaoOuvir from "../../components/ui/BotaoOuvir";
import { useLeitorVoz } from "../../hooks/useLeitorVoz";
import { ROTAS } from "../../config/rotas";
import { rotaDoTreino } from "../../utils/rotasMissao";

const TOTAL_FASES = 4;
const PALAVRA = "RIO";
const LETRAS = [
  { id: "R", texto: "R" },
  { id: "S", texto: "S" },
  { id: "L", texto: "L" },
];
const HISTORIA =
  "O rio corria devagar entre as árvores e parecia conversar com quem prestava atenção. Quando a água batia nas pedras, sons misteriosos ecoavam: plim... ploc... RRRR...";
const TEXTO_FINAL =
  "Agora você já sabe jogar! As missões de verdade ficam no mapa: seu professor libera cada uma e elas dão moedas para a loja.";

/*
 * Missão de treino (aventura ilustrada do Figma), parte da introdução guiada.
 * É conteúdo local e NÃO é missão oficial: não chama a API, não registra
 * progresso, não abre tentativa e não concede moedas.
 */
export default function AventuraIlustrada() {
  const router = useRouter();
  const fase = Math.max(1, Math.min(TOTAL_FASES, Number(router.query.fase) || 1));
  // A key reinicia as escolhas da criança a cada fase.
  return <Fase key={fase} fase={fase} />;
}

function Fase({ fase }) {
  const router = useRouter();
  const { suportado, falar } = useLeitorVoz();

  const [escolha, setEscolha] = useState("");
  const [resultado, setResultado] = useState(""); // '', 'certo', 'errado'
  const [falou, setFalou] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  const irPara = (proxima) => router.push(rotaDoTreino(proxima));
  const sairDoTreino = () => router.push(ROTAS.inicio);

  function confirmarLetra() {
    if (escolha) setResultado(escolha === "R" ? "certo" : "errado");
  }

  function aoEscolher(letra) {
    setEscolha(letra);
    setResultado("");
  }

  const selo = "Missão de treino · não vale moedas";

  /* ---------- Fase 1: História ---------- */
  if (fase === 1) {
    return (
      <TelaAtividade
        passo={1}
        total={TOTAL_FASES}
        selo={selo}
        onSair={sairDoTreino}
        rodape={
          <button
            type="button"
            className="botao-atividade"
            onClick={() => irPara(2)}
          >
            Entendi
          </button>
        }
      >
        <EtapaHistoria titulo="O Rio que Contava Histórias" texto={HISTORIA} />
      </TelaAtividade>
    );
  }

  /* ---------- Fases 2 e 3: escolha da letra ---------- */
  if (fase === 2 || fase === 3) {
    const certo = resultado === "certo";
    const palavraMostrada = fase === 3 && escolha ? `${escolha}IO` : "_IO";
    return (
      <TelaAtividade
        passo={fase}
        total={TOTAL_FASES}
        selo={selo}
        onSair={sairDoTreino}
        rodape={
          certo ? (
            <button
              type="button"
              className="botao-atividade botao-atividade--escuro"
              onClick={() => irPara(fase + 1)}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className={`botao-atividade ${escolha ? "botao-atividade--escuro" : ""}`}
              disabled={!escolha}
              onClick={confirmarLetra}
            >
              Confirmar
            </button>
          )
        }
      >
        {fase === 2 ? (
          <>
            <h1 className="atividade-titulo">
              <span className="atividade-titulo__icone" aria-hidden="true">
                🎧
              </span>{" "}
              Escute com atenção
            </h1>
            <p className="atividade-subtitulo">
              O rio fez um som... escute com atenção!
            </p>
            <div className="cartao-som">
              <h2>Qual som você ouviu?</h2>
              {suportado ? (
                <>
                  <button
                    type="button"
                    className="botao-som"
                    onClick={() =>
                      falar("Rrrrrrr... Rrrrrrio!", { velocidade: 0.7 })
                    }
                    aria-label="Tocar som"
                  >
                    <FiVolume2 />
                  </button>
                  <b>TOCAR SOM</b>
                </>
              ) : (
                <p className="dica-sem-audio">
                  Este aparelho não reproduz o som. Peça para um adulto fazer o
                  som do rio: &quot;Rrrrr...&quot;
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className="atividade-titulo">
              <span className="atividade-titulo__icone" aria-hidden="true">
                🧩
              </span>{" "}
              Complete a palavra
            </h1>
            <p className="atividade-subtitulo">O rio escondeu uma pista...</p>
            <div
              className={`palavra-pista ${certo ? "palavra-pista--certa" : ""}`}
              aria-live="polite"
            >
              {certo ? PALAVRA : palavraMostrada}
            </div>
          </>
        )}

        <Alternativas
          opcoes={LETRAS}
          selecionada={escolha}
          onSelecionar={aoEscolher}
          desabilitado={certo}
        />

        {certo && (
          <FeedbackMascote
            titulo="Isso mesmo! ✅"
            texto={fase === 2 ? "O rio faz o som do R!" : "A palavra é RIO!"}
          />
        )}
        {resultado === "errado" && (
          <FeedbackMascote
            tipo="tentar"
            titulo="Quase!"
            texto={
              fase === 2
                ? "Ouça o som de novo e tente outra letra."
                : "Tente outra letra."
            }
          />
        )}
      </TelaAtividade>
    );
  }

  /* ---------- Fase 4: Fala ---------- */
  return (
    <TelaAtividade
      passo={4}
      total={TOTAL_FASES}
      selo={selo}
      onSair={sairDoTreino}
      rodape={
        confirmado ? (
          <button
            type="button"
            className="botao-atividade botao-atividade--escuro"
            onClick={() => router.push(ROTAS.mapa)}
          >
            Ver minhas missões
          </button>
        ) : (
          <button
            type="button"
            className={`botao-atividade ${falou ? "botao-atividade--escuro" : ""}`}
            disabled={!falou}
            onClick={() => setConfirmado(true)}
          >
            Confirmar
          </button>
        )
      }
    >
      <h1 className="atividade-titulo">
        <span className="atividade-titulo__icone" aria-hidden="true">
          🎤
        </span>{" "}
        Fale a Palavra
      </h1>
      <p className="atividade-subtitulo">
        Agora fale a palavra que o rio revelou!
      </p>
      <div className="palavra-pista palavra-pista--certa">
        {PALAVRA}
        {suportado && (
          <button
            type="button"
            className="palavra-pista__ouvir"
            onClick={() => falar("Rio")}
            aria-label="Ouvir a palavra"
          >
            <FiVolume2 />
          </button>
        )}
      </div>

      {/*
        O Zooly ainda não grava nem reconhece voz (a API não recebe áudio).
        A criança fala em voz alta e toca no botão para avisar que falou.
      */}
      <button
        type="button"
        className={`botao-falei ${falou ? "botao-falei--ok" : ""}`}
        onClick={() => setFalou(true)}
        disabled={confirmado}
        aria-pressed={falou}
      >
        {falou ? (
          <FiCheckCircle aria-hidden="true" />
        ) : (
          <FiMic aria-hidden="true" />
        )}
        {falou ? "Você falou!" : "Falei a palavra"}
      </button>
      {!falou && (
        <p className="dica-sem-audio">
          Fale &quot;RIO&quot; bem alto e depois toque no botão. O Zooly não
          grava a sua voz.
        </p>
      )}

      {confirmado && (
        <FeedbackMascote titulo="Treino concluído! ✅" texto={TEXTO_FINAL}>
          <BotaoOuvir texto={`Treino concluído! ${TEXTO_FINAL}`} />
        </FeedbackMascote>
      )}
    </TelaAtividade>
  );
}
