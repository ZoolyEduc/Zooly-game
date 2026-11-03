import { ROTAS } from '../config/rotas';

// Missões oficiais (publicadas pelo professor) sempre abrem no player de missões.
// A aventura ilustrada é só treino e tem rota própria (ROTAS.treino).
export function rotaDaMissao(missao) {
  return `/missao/${encodeURIComponent(missao.id)}`;
}

export const rotaDoTreino = (fase = 1) => `${ROTAS.treino}/${fase}`;
