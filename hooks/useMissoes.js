import { useCallback } from 'react';
import { buscarMissoes, buscarProgresso } from '../services/jogo';
import { useAluno } from '../contexts/AlunoContext';
import { ordenarMissoes } from '../utils/missoes';
import { useCarregamento } from './useCarregamento';

const SEM_DADOS = { missoes: [], progresso: {} };

// O progresso complementa o mapa (ex.: "Em andamento"); se falhar, o mapa ainda aparece.
async function buscarProgressoPorAtividade() {
  try {
    const itens = await buscarProgresso();
    return Object.fromEntries(itens.map((item) => [String(item.atividade), item]));
  } catch {
    return {};
  }
}

export function useMissoes({ comProgresso = false } = {}) {
  const { aluno, carregando: carregandoAluno } = useAluno();
  const turmaId = aluno?.turma?.id;

  const buscar = useCallback(async () => {
    const [lista, progresso] = await Promise.all([
      buscarMissoes(turmaId),
      comProgresso ? buscarProgressoPorAtividade() : {}
    ]);
    return { missoes: ordenarMissoes(lista), progresso };
  }, [turmaId, comProgresso]);

  const { dados, carregando, erro, recarregar } = useCarregamento(buscar, {
    ativo: !carregandoAluno,
    mensagemErro: 'Não foi possível carregar suas missões.'
  });

  const { missoes, progresso } = dados || SEM_DADOS;
  return { missoes, progresso, carregando: carregando || carregandoAluno, erro, recarregar };
}
