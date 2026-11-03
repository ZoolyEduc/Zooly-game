import axios from 'axios';
import { limparSessao, obterToken } from './sessao';
import { ROTAS } from '../config/rotas';

const API_PADRAO = 'https://zooly-api.onrender.com';
const API_URL = (process.env.NEXT_PUBLIC_API_URL || API_PADRAO).replace(/\/+$/, '');

// A API fica no plano gratuito do Render: a primeira chamada pode levar
// quase um minuto enquanto o servidor "acorda".
const TEMPO_LIMITE_MS = 60000;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: TEMPO_LIMITE_MS
});

api.interceptors.request.use((config) => {
  const token = obterToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let redirecionandoParaLogin = false;

api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const status = erro?.response?.status;
    const url = erro?.config?.url || '';
    const enviouToken = Boolean(erro?.config?.headers?.Authorization);
    // Várias chamadas em paralelo podem receber 401 juntas; basta um redirecionamento.
    if (status === 401 && enviouToken && !url.startsWith('/api/auth') && typeof window !== 'undefined') {
      if (!redirecionandoParaLogin) {
        redirecionandoParaLogin = true;
        limparSessao();
        window.location.replace(`${ROTAS.login}?sessao=expirada`);
      }
    }
    return Promise.reject(erro);
  }
);

export default api;
