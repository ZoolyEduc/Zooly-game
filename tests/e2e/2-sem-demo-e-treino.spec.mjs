/*
 * Ausência do modo demonstração e missão de treino: INTEGRAÇÃO REAL com a Zooly API.
 * Substitui a antiga spec do modo demo. O treino (que NÃO é demo) continua coberto nas
 * 4 fases, agora com login real, e prova que não grava nada na API.
 */
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { ALUNOS, URL_API } from './dados.mjs';
import { apiGet, login, saldoNoCabecalho, tokenDe, vigiarContexto } from './suporte.mjs';

test.describe.configure({ mode: 'serial' });

let contexto;
let p;
let monitor;

test.beforeAll(async ({ browser }) => {
  contexto = await browser.newContext({ viewport: { width: 390, height: 844 } });
  monitor = vigiarContexto(contexto);
  p = await contexto.newPage();
});

test.afterAll(async () => {
  monitor.verificarSemFalhas();
  await contexto.close();
});

test('Login não tem botão nem selo de demonstração', async () => {
  await p.goto('/login');
  await p.locator('#raLogin').waitFor();
  await expect(p.getByText(/demonstra/i)).toHaveCount(0);
});

test('Restos antigos do demo no navegador não abrem o jogo e são apagados', async () => {
  await p.evaluate(() => {
    localStorage.setItem('zooly_modo_demo', 'true');
    localStorage.setItem('zooly_demo_estado', JSON.stringify({ aluno: { nomeCompleto: 'Sarah' }, saldo: 850 }));
    localStorage.setItem('zooly_token', 'demo-local');
    localStorage.setItem('zooly_usuario', JSON.stringify({ id: 'demo-aluno', nome: 'Sarah' }));
  });
  await p.goto('/aventura');
  await p.waitForURL(/\/login/);
  await expect(p.getByText(/Sarah|850/)).toHaveCount(0);
  const chaves = await p.evaluate(() => Object.keys(localStorage));
  for (const chave of ['zooly_modo_demo', 'zooly_demo_estado', 'zooly_token', 'zooly_usuario']) {
    expect(chaves, chave).not.toContain(chave);
  }
});

test('O código não tem mais serviço, selo nem guia do modo demo', async () => {
  for (const arquivo of [
    'services/demo/dadosDemo.js',
    'services/demo/armazenamentoDemo.js',
    'components/layout/SeloDemo.js',
    'README-MODO-DEMO.md'
  ]) {
    expect(existsSync(arquivo), arquivo).toBe(false);
  }
  const jogo = await readFile('services/jogo.js', 'utf8');
  expect(jogo).not.toMatch(/demo\//);
  const sessao = await readFile('services/sessao.js', 'utf8');
  expect(sessao).not.toMatch(/modoDemoAtivo|iniciarDemo|ativarFlagDemo/);
});

test('Treino completo (fases 1–4) com feedback de erro e acerto, sem gravar nada na API', async () => {
  await login(p, ALUNOS.semDemo);
  await p.waitForURL(/\/aventura/);
  await expect(p.getByText(/demonstra/i)).toHaveCount(0);

  const escritasNaApi = [];
  const registrar = (requisicao) => {
    if (requisicao.url().startsWith(URL_API) && requisicao.method() !== 'GET') {
      escritasNaApi.push(`${requisicao.method()} ${requisicao.url()}`);
    }
  };
  p.on('request', registrar);

  await p.locator('.cartao-treino').getByRole('button', { name: 'Missão de treino' }).click();
  await p.waitForURL(/\/atividade\/1/);
  await expect(p.getByText('Missão de treino · não vale moedas')).toBeVisible();
  await p.getByRole('button', { name: 'Entendi' }).click();
  await p.waitForURL(/atividade\/2/);
  await p.getByRole('radio', { name: 'S' }).click();
  await p.getByRole('button', { name: 'Confirmar' }).click();
  await expect(p.getByText('Quase!')).toBeVisible();
  await p.getByRole('radio', { name: 'R' }).click();
  await p.getByRole('button', { name: 'Confirmar' }).click();
  await expect(p.getByText('Isso mesmo!')).toBeVisible();
  await p.getByRole('button', { name: 'Continue' }).click();
  await p.waitForURL(/atividade\/3/);
  await expect(p.getByText('Isso mesmo!'), 'o estado da fase anterior deve ser reiniciado').toHaveCount(0);
  await p.getByRole('radio', { name: 'R' }).click();
  await p.getByRole('button', { name: 'Confirmar' }).click();
  await p.getByRole('button', { name: 'Continue' }).click();
  await p.waitForURL(/atividade\/4/);
  await p.getByRole('button', { name: 'Falei a palavra' }).click();
  await p.getByRole('button', { name: 'Confirmar' }).click();
  await expect(p.getByText('Treino concluído!')).toBeVisible();
  await p.getByRole('button', { name: 'Ver minhas missões' }).click();
  await p.waitForURL(/\/mapa$/);
  await expect(saldoNoCabecalho(p), 'o treino não pode somar moedas').toHaveText('0');
  p.off('request', registrar);

  expect(escritasNaApi).toEqual([]);
  const token = await tokenDe(p);
  expect((await apiGet(token, '/api/moedas/saldo')).saldo).toBe(0);
  expect((await apiGet(token, '/api/moedas/movimentacoes')).movimentacoes).toEqual([]);
  // Sem progresso, não existe tentativa (oficial ou não) para este aluno.
  expect((await apiGet(token, '/api/progresso')).progresso).toEqual([]);
  const { mapaMissoes } = await apiGet(
    token,
    `/api/progresso/turma/${(await apiGet(token, '/api/alunos/me')).aluno.turma.id}/mapa`
  );
  for (const missao of mapaMissoes) {
    const historico = await apiGet(token, `/api/progresso/atividades/${missao.id}/tentativas`);
    expect(historico.totalTentativas, missao.titulo).toBe(0);
  }
});

test('Sair do treino volta ao jogo normal com as missões do professor', async () => {
  await p.goto('/atividade/2');
  await p.getByRole('button', { name: 'Sair do treino' }).click();
  await p.waitForURL(/\/aventura/);
  await expect(p.locator('.lista-missoes .missao')).toHaveCount(3);
  await expect(p.locator('.lista-missoes .missao').first()).toContainText('Disponível');
});
