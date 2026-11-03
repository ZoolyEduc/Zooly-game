import { useCallback, useEffect, useRef, useState } from 'react';
import { mensagemErroApi } from '../services/erros';

/**
 * Padroniza o ciclo "carregando → dados ou erro → tentar de novo" das telas.
 *
 * @param {() => Promise<any>} buscar  Função estável (useCallback) que busca os dados.
 * @param {object} opcoes
 * @param {boolean} opcoes.ativo        Só busca quando true (ex.: aguardando o perfil ou a rota).
 * @param {string}  opcoes.mensagemErro Texto usado quando o erro não traz mensagem da API.
 */
export function useCarregamento(buscar, { ativo = true, mensagemErro } = {}) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const ultimaChamada = useRef(0);

  const recarregar = useCallback(async () => {
    const chamada = ++ultimaChamada.current;
    setCarregando(true);
    setErro('');
    try {
      const resultado = await buscar();
      if (chamada === ultimaChamada.current) setDados(resultado);
    } catch (error) {
      if (chamada === ultimaChamada.current) setErro(mensagemErroApi(error, mensagemErro));
    } finally {
      if (chamada === ultimaChamada.current) setCarregando(false);
    }
  }, [buscar, mensagemErro]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca de dados ao montar a tela
    if (ativo) recarregar();
  }, [ativo, recarregar]);

  return { dados, definirDados: setDados, carregando, erro, recarregar };
}
