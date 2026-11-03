import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ROTAS, ehRotaPublica } from '../../config/rotas';
import { obterEstadoSessao } from '../../services/sessao';
import Carregando from '../ui/Carregando';

export function destinoParaRota(pathname, estado) {
  if (ehRotaPublica(pathname)) return null;
  if (estado.expirada) return `${ROTAS.login}?sessao=expirada`;
  if (!estado.modo) return ROTAS.login;
  if (estado.modo === 'real' && estado.cadastroPendente) return ROTAS.cadastro;
  if (estado.introPendente && pathname !== ROTAS.introducao) return ROTAS.introducao;
  return null;
}

export default function GuardaSessao({ children }) {
  const router = useRouter();
  const publica = ehRotaPublica(router.pathname);
  const [liberada, setLiberada] = useState(false);

  // A sessão fica no localStorage, então a decisão só pode ser tomada no navegador.
  useEffect(() => {
    if (!router.isReady || publica) return;
    const destino = destinoParaRota(router.pathname, obterEstadoSessao());
    /* eslint-disable react-hooks/set-state-in-effect */
    setLiberada(!destino);
    /* eslint-enable react-hooks/set-state-in-effect */
    if (destino) router.replace(destino);
  }, [router, publica]);

  if (publica || liberada) return children;
  return <Carregando telaCheia texto="Preparando sua aventura..." />;
}
