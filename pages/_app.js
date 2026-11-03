import Head from "next/head";
import { useRouter } from "next/router";
import GuardaSessao from "../components/layout/GuardaSessao";
import { AlunoProvider } from "../contexts/AlunoContext";
import { ehRotaPublica } from "../config/rotas";

import "../styles/base/tokens.css";
import "../styles/base/base.css";
import "../styles/componentes/ui.css";
import "../styles/componentes/layout-jogo.css";
import "../styles/telas/acesso.css";
import "../styles/telas/inicio.css";
import "../styles/telas/mapa.css";
import "../styles/telas/atividade.css";
import "../styles/telas/loja-avatar.css";
import "../styles/telas/configuracoes.css";
import "../styles/telas/painel-pais.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const publica = ehRotaPublica(router.pathname);

  return (
    <>
      <Head>
        <title>Zooly — com a Turma Animal</title>
        <meta
          name="description"
          content="Uma aventura de leitura pelo Vale do Ribeira."
        />
        {/* Sem maximum-scale: o zoom continua permitido (acessibilidade). */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#16833b" />
      </Head>
      <GuardaSessao>
        {publica ? (
          <Component {...pageProps} />
        ) : (
          <AlunoProvider
            key={router.pathname === "/introducao" ? "intro" : "jogo"}
          >
            <Component {...pageProps} />
          </AlunoProvider>
        )}
      </GuardaSessao>
    </>
  );
}
