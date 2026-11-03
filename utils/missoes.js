import { CIDADES } from '../config/mapa';

// A ordenação é estável: em empate de `ordem`, mantém a posição vinda da API.
export function ordenarMissoes(missoes = []) {
  return [...missoes].sort((a, b) => Number(a.ordem) - Number(b.ordem));
}

// A próxima aventura: liberada pela API e ainda não concluída.
export function missaoDisponivel(missoes = []) {
  return ordenarMissoes(missoes).find((missao) => missao.desbloqueada && !missao.concluida) || null;
}

export function resumoProgresso(missoes = []) {
  const total = missoes.length;
  const concluidas = missoes.filter((missao) => missao.concluida).length;
  return {
    total,
    concluidas,
    percentual: total ? Math.round((concluidas / total) * 100) : 0
  };
}

/**
 * Situação exibida para a criança, derivada apenas dos campos da API
 * (`concluida`, `desbloqueada`) e do status do progresso, quando disponível.
 */
export function situacaoMissao(missao, progresso) {
  if (!missao) return 'vazia';
  if (missao.concluida) return 'concluida';
  if (!missao.desbloqueada) return 'bloqueada';
  if (progresso?.status === 'iniciada') return 'andamento';
  return 'disponivel';
}

export const TEXTO_SITUACAO = {
  concluida: 'Concluída',
  andamento: 'Em andamento',
  disponivel: 'Disponível',
  bloqueada: 'Bloqueada',
  vazia: 'Sem aventura'
};

/*
 * Associa cada missão a uma cidade do mapa pela ordem.
 * Com mais de seis missões, o mapa mostra o "trecho" de seis cidades que
 * contém a próxima missão disponível (ou o último trecho, se tudo estiver concluído).
 */
export function cidadesComMissoes(missoes = []) {
  const ordenadas = ordenarMissoes(missoes);
  const alvo = missaoDisponivel(ordenadas) || ordenadas[ordenadas.length - 1];
  const trecho = alvo ? Math.floor(ordenadas.indexOf(alvo) / CIDADES.length) : 0;
  const inicio = trecho * CIDADES.length;
  const doTrecho = ordenadas.slice(inicio, inicio + CIDADES.length);

  return {
    trecho: trecho + 1,
    totalTrechos: Math.max(1, Math.ceil(ordenadas.length / CIDADES.length)),
    cidades: CIDADES.map((cidade, indice) => ({ ...cidade, missao: doTrecho[indice] || null }))
  };
}

export function cidadeDaMissao(missoes = [], missaoId) {
  const indice = ordenarMissoes(missoes).findIndex((missao) => String(missao.id) === String(missaoId));
  return indice >= 0 ? CIDADES[indice % CIDADES.length] : null;
}
