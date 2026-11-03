import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cenario from '../components/layout/Cenario';
import Marca from '../components/marca/Marca';
import { ROTAS } from '../config/rotas';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const temporizador = setTimeout(() => router.replace(ROTAS.login), 2400);
    return () => clearTimeout(temporizador);
  }, [router]);

  return (
    <Cenario classe="tela-splash">
      <div className="splash__centro">
        <Marca />
        <p className="splash__mensagem">Uma aventura pelo Vale do Ribeira!</p>
        <div className="splash__pontos" aria-label="Carregando">
          <span />
          <span />
          <span />
        </div>
        <button type="button" className="link-pular" onClick={() => router.push(ROTAS.login)}>
          Ir para o login
        </button>
      </div>
    </Cenario>
  );
}
