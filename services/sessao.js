const CHAVES = {
  token: 'zooly_token',
  usuario: 'zooly_usuario',
  cadastroPendente: 'zooly_cadastro_pendente',
  introPendente: 'zooly_intro_pendente'
};

// Versões antigas guardavam o RA e a senha da turma nesta chave do sessionStorage.
// Hoje o cadastro não usa senha; a chave só é apagada caso ainda exista na aba.
const CHAVE_PRIMEIRO_ACESSO_LEGADO = 'zooly_primeiro_acesso';

// Restos do antigo modo demonstração (removido). São apagados ao abrir o jogo:
// nunca ativam dados fictícios.
const CHAVES_DEMO_LEGADO = ['zooly_modo_demo', 'zooly_demo_estado'];
const TOKEN_DEMO_LEGADO = 'demo-local';
const ID_ALUNO_DEMO_LEGADO = 'demo-aluno';

const noNavegador = () => typeof window !== 'undefined';

// O armazenamento pode estar bloqueado (aba anônima, política do navegador).
// Nesses casos a sessão simplesmente não é lembrada, sem quebrar a tela.
function ler(armazenamento, chave) {
  try {
    return armazenamento.getItem(chave);
  } catch {
    return null;
  }
}

function gravar(armazenamento, chave, valor) {
  try {
    armazenamento.setItem(chave, valor);
  } catch {
    /* armazenamento indisponível */
  }
}

function remover(armazenamento, chave) {
  try {
    armazenamento.removeItem(chave);
  } catch {
    /* armazenamento indisponível */
  }
}

function lerJson(chave, padrao = null, armazenamento) {
  if (!noNavegador()) return padrao;
  try {
    const valor = ler(armazenamento || window.localStorage, chave);
    return valor ? JSON.parse(valor) : padrao;
  } catch {
    return padrao;
  }
}

function limparResiduosDemoLegado() {
  const ls = window.localStorage;
  CHAVES_DEMO_LEGADO.forEach((chave) => remover(ls, chave));
  const usuario = lerJson(CHAVES.usuario);
  if (ler(ls, CHAVES.token) === TOKEN_DEMO_LEGADO || usuario?.id === ID_ALUNO_DEMO_LEGADO) {
    limparSessao();
  }
}

/* ---------- Sessão real ---------- */

/**
 * Lê a data de expiração do JWT apenas para não abrir o jogo com uma sessão
 * vencida. A assinatura não é verificada aqui: quem valida o token é a API.
 */
function tokenExpirado(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(window.atob(base64));
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

export function salvarSessao(resposta) {
  if (!noNavegador()) return;
  const ls = window.localStorage;
  if (resposta?.token) gravar(ls, CHAVES.token, resposta.token);
  if (resposta?.usuario) gravar(ls, CHAVES.usuario, JSON.stringify(resposta.usuario));
  if (typeof resposta?.cadastroInicialPendente === 'boolean') {
    gravar(ls, CHAVES.cadastroPendente, String(resposta.cadastroInicialPendente));
  }
}

export function atualizarUsuario(usuario) {
  if (!noNavegador() || !usuario) return;
  gravar(window.localStorage, CHAVES.usuario, JSON.stringify(usuario));
}

export function obterUsuario() {
  return lerJson(CHAVES.usuario);
}

export function obterToken() {
  if (!noNavegador()) return null;
  const token = ler(window.localStorage, CHAVES.token);
  if (!token || token === TOKEN_DEMO_LEGADO || tokenExpirado(token)) return null;
  return token;
}

function tokenSalvoExpirado() {
  const token = ler(window.localStorage, CHAVES.token);
  return Boolean(token) && token !== TOKEN_DEMO_LEGADO && tokenExpirado(token);
}

export function cadastroPendente() {
  if (!noNavegador()) return false;
  return ler(window.localStorage, CHAVES.cadastroPendente) === 'true';
}

export function marcarCadastroConcluido() {
  if (!noNavegador()) return;
  gravar(window.localStorage, CHAVES.cadastroPendente, 'false');
}

function introPendente() {
  return ler(window.localStorage, CHAVES.introPendente) === 'true';
}

export function definirIntroPendente(pendente) {
  if (!noNavegador()) return;
  if (pendente) gravar(window.localStorage, CHAVES.introPendente, 'true');
  else remover(window.localStorage, CHAVES.introPendente);
}

export function limparSessao() {
  if (!noNavegador()) return;
  const ls = window.localStorage;
  remover(ls, CHAVES.token);
  remover(ls, CHAVES.usuario);
  remover(ls, CHAVES.cadastroPendente);
  remover(ls, CHAVES.introPendente);
}

/* ---------- Estado consolidado ---------- */

/**
 * Modo atual e pendências de navegação.
 * modo: 'real' | null (o jogo só funciona com a sessão real da API). `expirada` indica que havia uma sessão real vencida.
 */
export function obterEstadoSessao() {
  const vazio = { modo: null, cadastroPendente: false, introPendente: false, expirada: false };
  if (!noNavegador()) return vazio;
  limparResiduosDemoLegado();
  remover(window.sessionStorage, CHAVE_PRIMEIRO_ACESSO_LEGADO);

  if (obterToken()) {
    return { ...vazio, modo: 'real', cadastroPendente: cadastroPendente(), introPendente: introPendente() };
  }

  if (tokenSalvoExpirado()) {
    limparSessao();
    return { ...vazio, expirada: true };
  }

  return vazio;
}

export function sairDeTudo() {
  limparSessao();
  if (noNavegador()) remover(window.sessionStorage, CHAVE_PRIMEIRO_ACESSO_LEGADO);
}
