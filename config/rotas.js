export const ROTAS = {
  splash: '/',
  login: '/login',
  cadastro: '/cadastro',
  introducao: '/introducao',
  inicio: '/aventura',
  mapa: '/mapa',
  loja: '/loja',
  avatar: '/avatar',
  configuracoes: '/configuracoes',
  painelPais: '/painel-pais',
  // Aventura ilustrada de treino (introdução guiada); não é missão oficial.
  treino: '/atividade'
};

const ROTAS_PUBLICAS = [ROTAS.splash, ROTAS.login, ROTAS.cadastro];

export function ehRotaPublica(pathname) {
  return ROTAS_PUBLICAS.includes(pathname) || pathname === '/404' || pathname === '/_error';
}
