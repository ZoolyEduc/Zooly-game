/*
 * Layout em vários tamanhos de tela, navegando com login real (aluno próprio desta
 * spec, ALUNOS.semDemo) por todas as telas, inclusive uma missão publicada e o treino.
 */
import { expect, test } from '@playwright/test';
import { ALUNOS } from './dados.mjs';
import { apiGet, login, tokenDe, vigiarContexto } from './suporte.mjs';

const TELAS = [
  ['320x568', { width: 320, height: 568 }],
  ['375x667', { width: 375, height: 667 }],
  ['412x915', { width: 412, height: 915 }],
  ['768x1024', { width: 768, height: 1024 }],
  ['1366x768', { width: 1366, height: 768 }]
];

const ROTAS_DO_JOGO = ['/aventura', '/mapa', '/loja', '/avatar', '/configuracoes', '/painel-pais', '/atividade/2'];

const excessoHorizontal = (pagina) =>
  pagina.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

for (const [nome, viewport] of TELAS) {
  test(`Responsividade ${nome}: sem rolagem horizontal nas telas principais`, async ({ browser }) => {
    const excessos = [];

    const contextoLogin = await browser.newContext({ viewport });
    const paginaLogin = await contextoLogin.newPage();
    await paginaLogin.goto('/login');
    await paginaLogin.locator('#raLogin').waitFor();
    const excessoLogin = await excessoHorizontal(paginaLogin);
    if (excessoLogin > 1) excessos.push(`/login:+${excessoLogin}px`);
    await contextoLogin.close();

    const contexto = await browser.newContext({ viewport });
    const monitor = vigiarContexto(contexto);
    const pagina = await contexto.newPage();
    await login(pagina, ALUNOS.semDemo);
    await pagina.waitForURL(/\/aventura/);
    // Inclui a primeira missão publicada pelo professor (dados reais da API).
    const token = await tokenDe(pagina);
    const { aluno } = await apiGet(token, '/api/alunos/me');
    const { mapaMissoes } = await apiGet(token, `/api/progresso/turma/${aluno.turma.id}/mapa`);

    for (const rota of [...ROTAS_DO_JOGO, `/missao/${mapaMissoes[0].id}`]) {
      await pagina.goto(rota);
      await pagina.waitForLoadState('networkidle');
      await monitor.conferirImagens(pagina);
      const excesso = await excessoHorizontal(pagina);
      if (excesso > 1) excessos.push(`${rota}:+${excesso}px`);
    }

    monitor.verificarSemFalhas();
    await contexto.close();
    expect(excessos).toEqual([]);
  });
}
