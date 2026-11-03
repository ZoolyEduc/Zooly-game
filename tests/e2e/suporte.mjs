import { expect } from '@playwright/test';
import { SENHA_TURMA, URL_API } from './dados.mjs';

export async function login(pagina, ra, senha = SENHA_TURMA) {
  await pagina.goto('/login');
  await pagina.fill('#raLogin', ra);
  await pagina.fill('#senhaLogin', senha);
  await pagina.click('button[type=submit]');
}

export const tokenDe = (pagina) => pagina.evaluate(() => localStorage.getItem('zooly_token'));

// Consulta direta à API para confirmar o que o jogo gravou de verdade.
export async function apiGet(token, rota) {
  const resposta = await fetch(`${URL_API}${rota}`, { headers: { Authorization: `Bearer ${token}` } });
  return resposta.json();
}

export const saldoNoCabecalho = (pagina) => pagina.locator('.saldo-moedas > span').first();

/**
 * Registra imagens que falharam e erros de console de todas as páginas do contexto.
 * Erros esperados (respostas 401/409 provocadas pelos próprios cenários) são ignorados.
 */
export function vigiarContexto(contexto) {
  const imagensQuebradas = new Set();
  const errosConsole = new Set();

  const vigiar = (pagina) => {
    pagina.on('console', (mensagem) => {
      if (mensagem.type() === 'error' && !/401|409|Failed to load resource/.test(mensagem.text())) {
        errosConsole.add(mensagem.text());
      }
    });
    pagina.on('response', (resposta) => {
      if (/\/images\/|_next\/image/.test(resposta.url()) && resposta.status() >= 400) {
        imagensQuebradas.add(`${resposta.status()} ${resposta.url()}`);
      }
    });
  };
  contexto.pages().forEach(vigiar);
  contexto.on('page', vigiar);

  return {
    async conferirImagens(pagina) {
      const quebradas = await pagina.$$eval('img', (imgs) =>
        imgs.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.src)
      );
      quebradas.forEach((src) => imagensQuebradas.add(`naturalWidth=0 ${src}`));
    },
    verificarSemFalhas() {
      expect([...imagensQuebradas], 'imagens com falha').toEqual([]);
      expect([...errosConsole], 'erros de console').toEqual([]);
    }
  };
}

// Joga as quatro fases da missão de treino (história, som, palavra e fala).
export async function jogarTreino(pagina) {
  await pagina.getByRole('button', { name: 'Entendi' }).click();
  await pagina.waitForURL(/atividade\/2/);
  await pagina.getByRole('radio', { name: 'R' }).click();
  await pagina.getByRole('button', { name: 'Confirmar' }).click();
  await pagina.getByRole('button', { name: 'Continue' }).click();
  await pagina.waitForURL(/atividade\/3/);
  await pagina.getByRole('radio', { name: 'R' }).click();
  await pagina.getByRole('button', { name: 'Confirmar' }).click();
  await pagina.getByRole('button', { name: 'Continue' }).click();
  await pagina.waitForURL(/atividade\/4/);
  await pagina.getByRole('button', { name: 'Falei a palavra' }).click();
  await pagina.getByRole('button', { name: 'Confirmar' }).click();
}
