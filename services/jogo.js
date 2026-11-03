import api from './api';
import { obterUsuario } from './sessao';

/*
 * Chamadas do jogo à Zooly API (token JWT do aluno, adicionado em services/api.js).
 * Não existe modo demonstração nem dado fictício: se a API falhar, o erro chega à tela,
 * que mostra uma mensagem amigável e "Tentar de novo".
 */

const atividade = (atividadeId) => `/api/progresso/atividades/${encodeURIComponent(atividadeId)}`;

export async function buscarPerfil() {
  const { data } = await api.get('/api/alunos/me');
  return data.aluno;
}

export async function selecionarAvatar(avatarId) {
  const { data } = await api.put('/api/alunos/me/avatar', { avatarId });
  return data.avatarSelecionado;
}

export async function buscarSaldo() {
  const { data } = await api.get('/api/moedas/saldo');
  return data.saldo;
}

export async function buscarMovimentacoes({ pagina = 1, limite = 10 } = {}) {
  const { data } = await api.get('/api/moedas/movimentacoes', { params: { pagina, limite } });
  return data.movimentacoes;
}

/** Missões do mapa da turma. Sem turma informada, usa a do aluno da sessão. */
export async function buscarMissoes(turmaId) {
  const turma = turmaId || obterUsuario()?.turma;
  if (!turma) throw new Error('Turma do aluno não identificada.');
  const id = typeof turma === 'object' ? turma.id || turma._id : turma;
  const { data } = await api.get(`/api/progresso/turma/${encodeURIComponent(id)}/mapa`);
  return data.mapaMissoes;
}

export async function buscarProgresso() {
  const { data } = await api.get('/api/progresso');
  return data.progresso;
}

export async function buscarConteudo(atividadeId) {
  const { data } = await api.get(`${atividade(atividadeId)}/conteudo`);
  return data.atividade;
}

/**
 * Abre a próxima tentativa da missão ou retoma a que está em andamento (a API decide).
 * `tentativa` traz número, se é a oficial e as respostas já salvas (sem gabarito).
 */
export async function iniciarAtividade(atividadeId) {
  const { data } = await api.post(`${atividade(atividadeId)}/iniciar`);
  return {
    progresso: data.progresso,
    tentativa: data.tentativa ?? null,
    tentativaRetomada: Boolean(data.tentativaRetomada)
  };
}

/** Histórico das próprias tentativas (número, datas, se foi a oficial). Sem gabarito. */
export async function buscarTentativas(atividadeId) {
  const { data } = await api.get(`${atividade(atividadeId)}/tentativas`);
  return {
    total: data.totalTentativas ?? 0,
    tentativaOficial: data.tentativaOficial ?? null,
    tentativas: data.tentativas ?? []
  };
}

export async function enviarRespostas(atividadeId, respostas) {
  const { data } = await api.put(`${atividade(atividadeId)}/respostas`, { respostas });
  return data.progresso;
}

export async function concluirAtividade(atividadeId) {
  const { data } = await api.patch(`${atividade(atividadeId)}/concluir`);
  return {
    progresso: data.progresso,
    tentativa: data.tentativa ?? null,
    movimentacao: data.movimentacao,
    saldo: data.saldo
  };
}

export async function buscarAvatares() {
  const { data } = await api.get('/api/loja/avatares');
  return data.avatares;
}

export async function comprarAvatar(avatarId) {
  const { data } = await api.post(`/api/loja/avatares/${encodeURIComponent(avatarId)}/comprar`);
  return { avatar: data.avatar, saldo: data.saldo };
}
