const MENSAGEM_PADRAO = 'Algo não deu certo. Vamos tentar de novo?';
const MENSAGEM_SEM_CONEXAO = 'Não conseguimos falar com o Zooly. Confira a internet e tente de novo.';
const MENSAGEM_DEMORA = 'O Zooly está demorando para responder. Espere um pouquinho e tente de novo.';
const MENSAGEM_SERVIDOR = 'O Zooly está com um probleminha agora. Tente de novo daqui a pouco.';

/**
 * Converte um erro do Axios
 * em uma frase que a criança ou o adulto ao lado consiga entender.
 * As mensagens de regra de negócio continuam vindo da API; só os erros
 * técnicos (rede, tempo esgotado, falha do servidor) são reescritos aqui.
 */
export function mensagemErroApi(erro, padrao = MENSAGEM_PADRAO) {
  const status = erro?.response?.status;
  if (status >= 500) return MENSAGEM_SERVIDOR;
  if (erro?.response?.data?.mensagem) return erro.response.data.mensagem;
  if (erro?.code === 'ECONNABORTED') return MENSAGEM_DEMORA;
  if (erro?.code === 'ERR_NETWORK' || erro?.message === 'Network Error') return MENSAGEM_SEM_CONEXAO;
  return padrao;
}

export function statusDoErro(erro) {
  return erro?.response?.status ?? null;
}
