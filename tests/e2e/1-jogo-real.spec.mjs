/*
 * Integração REAL: cada cenário usa a Zooly API local (código do Zooly-api) e
 * confere o que foi gravado consultando a própria API.
 * Os cenários rodam em sequência e dependem do estado deixado pelo anterior.
 */
import { expect, test } from '@playwright/test';
import { SENHA_TURMA, TURMA, URL_API } from './dados.mjs';
import { apiGet, jogarTreino, login, saldoNoCabecalho, tokenDe, vigiarContexto } from './suporte.mjs';

test.describe.configure({ mode: 'serial' });

let contexto;
let p;
let monitor;
let idMissao1;

test.beforeAll(async ({ browser }) => {
  contexto = await browser.newContext({ viewport: { width: 390, height: 844 } });
  monitor = vigiarContexto(contexto);
  p = await contexto.newPage();
});

test.afterAll(async () => {
  monitor.verificarSemFalhas();
  await contexto.close();
});

test('Proteção de rotas: /aventura sem sessão vai para /login', async () => {
  await p.goto('/aventura');
  await p.waitForURL(/\/login/);
});

test('Login real com senha errada mostra mensagem amigável (401 da API)', async () => {
  await login(p, 'E2E-0001', 'errada');
  await expect(p.getByText('RA ou senha não conferem')).toBeVisible();
});

test('Login real válido leva à Home com saudação, saldo e missões da API', async () => {
  await login(p, 'E2E-0001');
  await p.waitForURL(/\/aventura/);
  await expect(p.getByRole('heading', { name: 'Olá, Lia!' })).toBeVisible();
  await expect(p.getByText('Sua próxima aventura é "Aventura no rio"')).toBeVisible();
  await expect(saldoNoCabecalho(p)).toHaveText('0');
  const missoes = p.locator('.lista-missoes .missao');
  await expect(missoes).toHaveCount(3);
  await expect(missoes.nth(0)).toContainText('Disponível');
  await expect(missoes.nth(1)).toContainText('Bloqueada');
  await monitor.conferirImagens(p);
});

test('Missão bloqueada não abre e mostra orientação', async () => {
  await p.locator('.lista-missoes .missao').nth(1).click();
  await expect(p.getByText('ainda está trancada')).toBeVisible();
  expect(p.url()).toMatch(/\/aventura/);
});

test('Mapa: cidades com situação vinda da API e modal de cidade bloqueada', async () => {
  await p.goto('/mapa');
  await expect(p.locator('.mapa-cidade')).toHaveCount(6);
  await expect(p.locator('.mapa-cidade--disponivel')).toHaveCount(1);
  await expect(p.locator('.mapa-cidade--bloqueada')).toHaveCount(2);
  await expect(p.locator('.mapa-cidade--vazia')).toHaveCount(3);
  await p.getByRole('button', { name: /Sete Barras/ }).click();
  await expect(p.getByText('ainda está trancada')).toBeVisible();
  await expect(p.locator('.modal-fase .botao-pilula')).toHaveCount(0);
  await monitor.conferirImagens(p);
  await p.keyboard.press('Escape');
});

test('Missão real: história, recompensa da API, perguntas, conclusão e moedas', async () => {
  await p.goto('/aventura');
  await p.locator('.lista-missoes .missao').first().click();
  await p.waitForURL(/\/missao\//);
  idMissao1 = decodeURIComponent(p.url().split('/missao/')[1]);
  await expect(p.getByText('O passeio da capivara').first()).toBeVisible();
  await expect(p.locator('.recompensa-missao')).toContainText('30');
  await p.getByRole('button', { name: 'Entendi' }).click();
  await expect(p.getByText('Pergunta 1 de 2')).toBeVisible();
  await expect(p.getByRole('button', { name: 'Confirmar' })).toBeDisabled();
  await p.getByRole('radio', { name: 'A capivara' }).click();
  await p.getByRole('button', { name: 'Confirmar' }).click();
  await expect(p.getByText('Pergunta 2 de 2')).toBeVisible();
  await p.getByRole('radio', { name: 'Capivara' }).click();
  await p.getByRole('button', { name: 'Confirmar' }).click();
  await expect(p.getByText('Missão concluída!')).toBeVisible();
  await expect(p.locator('.ganho-moedas')).toContainText('30');
  await expect(saldoNoCabecalho(p)).toHaveText('30');
  await p.getByRole('button', { name: 'Continue' }).click();
  await p.waitForURL(/\/mapa\?concluido=1/);
  await expect(p.getByText('A próxima aventura te espera em Sete Barras')).toBeVisible();
});

test('Persistência: progresso, respostas e saldo gravados na API', async () => {
  const token = await tokenDe(p);
  expect((await apiGet(token, '/api/moedas/saldo')).saldo).toBe(30);
  const { progresso } = await apiGet(token, `/api/progresso/atividades/${idMissao1}`);
  expect(progresso.status).toBe('concluida');
  expect(progresso.respostas).toHaveLength(2);
  await p.goto('/aventura');
  const missoes = p.locator('.lista-missoes .missao');
  await expect(missoes.nth(0)).toContainText('Concluída');
  await expect(missoes.nth(1)).toContainText('Disponível');
});

test('Jogar de novo missão concluída não gera moedas (movimentacao null da API)', async () => {
  await p.goto(`/missao/${idMissao1}`);
  // Repetição: aviso amigável com o número da vez (tentativa vinda da API).
  await expect(p.locator('.aviso-tentativa')).toContainText('Vamos tentar novamente!');
  await expect(p.locator('.aviso-tentativa')).toContainText('2ª vez');
  await p.getByRole('button', { name: 'Entendi' }).click();
  await p.getByRole('radio', { name: 'O elefante' }).click();
  await p.getByRole('button', { name: 'Confirmar' }).click();
  await p.getByRole('radio', { name: 'Rio' }).click();
  await p.getByRole('button', { name: 'Confirmar' }).click();
  await expect(p.getByText('Você terminou a 2ª vez!')).toBeVisible();
  await expect(p.locator('.ganho-moedas')).toHaveCount(0);
  expect((await apiGet(await tokenDe(p), '/api/moedas/saldo')).saldo).toBe(30);
});

test('Loja: compra do Saruê atualiza saldo, extrato amigável e permite usar agora', async () => {
  await p.goto('/loja');
  await p.getByRole('button', { name: 'Comprar Saruê por 10 moedas' }).click();
  await expect(p.getByText('Você tem 30 moedas')).toBeVisible();
  await p.locator('.modal-compra').getByRole('button', { name: 'Comprar' }).click();
  await expect(p.getByText('Saruê agora é seu amigo!')).toBeVisible();
  await expect(saldoNoCabecalho(p)).toHaveText('20');
  await p.getByRole('button', { name: 'Usar agora' }).click();
  await expect(p.getByText('Saruê agora é o seu avatar!')).toBeVisible();
  await expect(p.getByText('Novo amigo: Saruê')).toBeVisible();
  await expect(p.getByText('avatar-01')).toHaveCount(0);
  expect((await apiGet(await tokenDe(p), '/api/alunos/me')).aluno.avatarSelecionado).toBe('avatar-01');
});

test('Loja: segunda compra e bloqueio por saldo insuficiente', async () => {
  await p.getByRole('button', { name: 'Comprar Lagarto por 20 moedas' }).click();
  await p.locator('.modal-compra').getByRole('button', { name: 'Comprar' }).click();
  await expect(p.getByText('Lagarto agora é seu amigo!')).toBeVisible();
  await p.getByRole('button', { name: 'Depois' }).click();
  await expect(saldoNoCabecalho(p)).toHaveText('0');
  await p.getByRole('button', { name: 'Comprar Cobra por 20 moedas' }).click();
  await expect(p.getByText('Faltam 20 moedas')).toBeVisible();
  await expect(p.locator('.modal-compra').getByRole('button', { name: 'Comprar' })).toBeDisabled();
  await p.keyboard.press('Escape');
});

test('Troca de avatar pela tela /avatar é gravada na API', async () => {
  await p.goto('/avatar');
  await p.getByRole('radio', { name: /Lagarto/ }).click();
  await p.getByRole('button', { name: /Confirmar Escolha/ }).click();
  await expect(p.getByText('Pronto! Seu novo companheiro')).toBeVisible();
  expect((await apiGet(await tokenDe(p), '/api/alunos/me')).aluno.avatarSelecionado).toBe('avatar-03');
  await expect(p.getByRole('img', { name: 'Avatar: Lagarto' }).first()).toBeVisible();
});

test('Configurações: dados reais do aluno e da turma', async () => {
  await p.goto('/configuracoes');
  await expect(p.locator('.perfil').getByText('Lia Teste')).toBeVisible();
  await expect(p.getByText(`${TURMA.nome} • ${TURMA.periodo}`)).toBeVisible();
  await expect(p.getByText('RA E2E-0001')).toBeVisible();
});

test('Painel dos responsáveis (modo real) mostra só dados da API', async () => {
  await p.goto('/painel-pais');
  await expect(p.getByText('1 de 3 concluídas')).toBeVisible();
  await expect(p.getByText('Saldo de moedas: 0')).toBeVisible();
  await expect(p.getByText('Aventura no rio')).toBeVisible();
  await expect(p.getByText('Meta Semanal')).toHaveCount(0);
  await expect(p.getByText('Dados fictícios')).toHaveCount(0);
});

test('Persistência da sessão: nova aba abre o jogo sem novo login', async () => {
  const outra = await contexto.newPage();
  await outra.goto('/mapa');
  await expect(outra.locator('.mapa-cidade').first()).toBeVisible();
  expect(outra.url()).toMatch(/\/mapa/);
  await outra.close();
});

test('Sair pede confirmação e encerra a sessão', async () => {
  await p.goto('/configuracoes');
  await p.getByRole('button', { name: 'SAIR DO APP' }).click();
  await expect(p.getByText('Quer mesmo sair?')).toBeVisible();
  await p.getByRole('button', { name: 'Ficar' }).click();
  expect(p.url()).toMatch(/configuracoes/);
  await p.getByRole('button', { name: 'SAIR DO APP' }).click();
  await p.locator('.modal').getByRole('button', { name: 'Sair' }).click();
  await p.waitForURL(/\/login/);
  expect(await tokenDe(p)).toBeNull();
  await p.goto('/loja');
  await p.waitForURL(/\/login/);
});

test('Token vencido (exp no passado) volta ao login com aviso, sem abrir o jogo', async () => {
  const payload = Buffer.from(JSON.stringify({ sub: 'x', exp: Math.floor(Date.now() / 1000) - 60 })).toString('base64url');
  await p.evaluate((token) => localStorage.setItem('zooly_token', token), `e.${payload}.s`);
  await p.goto('/aventura');
  await p.waitForURL(/\/login\?sessao=expirada/);
  await expect(p.getByText('Sua sessão terminou')).toBeVisible();
  expect(await tokenDe(p)).toBeNull();
});

test('Token recusado pela API (401) limpa a sessão e volta ao login', async () => {
  await p.evaluate(() => localStorage.setItem('zooly_token', 'token-invalido'));
  await p.goto('/aventura');
  await p.waitForURL(/\/login\?sessao=expirada/);
  expect(await tokenDe(p)).toBeNull();
});

test('Primeiro acesso com código errado mostra o erro da API', async () => {
  await p.goto('/login');
  await p.fill('#raLogin', 'E2E-NOVO');
  await p.fill('#senhaLogin', SENHA_TURMA);
  await p.getByRole('button', { name: 'Primeiro acesso? Cadastre-se' }).click();
  await p.waitForURL(/\/cadastro/);
  await p.getByRole('button', { name: /SALVAR/ }).click();
  await expect(p.getByText('Escreva o seu nome.')).toBeVisible();
  await p.fill('#cadNome', 'Rafa Novo');
  await p.locator('label.opcao-sexo.masculino').click();
  await p.fill('#cadCodigo', 'ERRADO');
  await p.getByRole('button', { name: /SALVAR/ }).click();
  await expect(p.getByText('Código da turma ou senha inválidos.')).toBeVisible();
});

test('Primeiro acesso completo: entrar na turma, cadastro inicial e introdução', async () => {
  await p.fill('#cadCodigo', TURMA.codigo);
  await p.getByRole('button', { name: /SALVAR/ }).click();
  await p.waitForURL(/\/introducao/);
  await concluirIntroducao(p);
  await p.waitForURL(/\/aventura/);
  await expect(p.getByRole('heading', { name: 'Olá, Rafa!' })).toBeVisible();
  const { aluno } = await apiGet(await tokenDe(p), '/api/alunos/me');
  expect(aluno.cadastroInicialConcluido).toBe(true);
  expect(aluno.nomeCompleto).toBe('Rafa Novo');
  expect(await p.evaluate(() => sessionStorage.getItem('zooly_primeiro_acesso'))).toBeNull();
});

test('Cadastro pendente: login redireciona ao cadastro com RA travado', async () => {
  await p.evaluate(() => localStorage.clear());
  await login(p, 'E2E-PEND');
  await p.waitForURL(/\/cadastro/);
  await expect(p.locator('#cadRa')).toHaveValue('E2E-PEND');
  await expect(p.locator('#cadRa')).toHaveAttribute('readonly', '');
  await p.goto('/mapa');
  await p.waitForURL(/\/cadastro/);
  await p.fill('#cadNome', 'Pedro Pendente');
  await p.locator('label.opcao-sexo.masculino').click();
  await p.fill('#cadCodigo', TURMA.codigo.toLowerCase());
  await p.getByRole('button', { name: /SALVAR/ }).click();
  await p.waitForURL(/\/introducao/);
});

test('Introdução guiada apresenta mascotes, mapa e missões e leva à missão de treino', async () => {
  // Continua a partir do cadastro pendente concluído no cenário anterior.
  await expect(p.getByRole('heading', { name: 'Olá, pequeno explorador!' })).toBeVisible();
  await avancarIntroducaoAte(p, 'Estes são seus novos amigos!');
  await expect(p.locator('.amigos-trilha').getByText('Papagaio')).toBeVisible();
  await avancarIntroducaoAte(p, 'Vamos trazer a magia de volta?');
  await avancarIntroducaoAte(p, 'Este é o mapa do Vale');
  await expect(p.getByText('Pode jogar agora')).toBeVisible();
  await expect(p.getByText('Trancada: termine a anterior')).toBeVisible();
  await avancarIntroducaoAte(p, 'Como funcionam as missões');
  await expect(p.getByText('Responda as perguntas')).toBeVisible();
  await p.getByRole('button', { name: /Treinar uma missão/ }).click();
  await p.waitForURL(/\/atividade\/1/);
  await expect(p.getByText('Missão de treino · não vale moedas')).toBeVisible();
});

test('Missão de treino no modo real não grava nada na API e termina nas missões do professor', async () => {
  const escritasNaApi = [];
  const registrar = (requisicao) => {
    if (requisicao.url().startsWith(URL_API) && requisicao.method() !== 'GET') {
      escritasNaApi.push(`${requisicao.method()} ${requisicao.url()}`);
    }
  };
  p.on('request', registrar);

  await jogarTreino(p);
  await expect(p.getByText('Treino concluído!')).toBeVisible();
  await p.getByRole('button', { name: 'Ver minhas missões' }).click();
  await p.waitForURL(/\/mapa$/);
  await expect(p.locator('.mapa-cidade--disponivel')).toHaveCount(1);
  p.off('request', registrar);

  expect(escritasNaApi).toEqual([]);
  const token = await tokenDe(p);
  expect((await apiGet(token, '/api/moedas/saldo')).saldo).toBe(0);
  expect((await apiGet(token, '/api/progresso')).progresso).toEqual([]);
  expect((await apiGet(token, '/api/moedas/movimentacoes')).movimentacoes).toEqual([]);
});

test('Home separa o treino das missões oficiais e o treino pode ser refeito', async () => {
  await p.goto('/aventura');
  await expect(p.locator('.lista-missoes .missao')).toHaveCount(3);
  await expect(p.locator('.lista-missoes')).not.toContainText('treino');
  const cartao = p.locator('.cartao-treino');
  await expect(cartao).toContainText('O treino não vale moedas');
  await cartao.getByRole('button', { name: 'Missão de treino' }).click();
  await p.waitForURL(/\/atividade\/1/);
  await p.getByRole('button', { name: 'Sair do treino' }).click();
  await p.waitForURL(/\/aventura/);
  await p.locator('.cartao-treino').getByRole('button', { name: 'Como jogar' }).click();
  await p.waitForURL(/\/introducao/);
  await expect(p.getByRole('heading', { name: 'Olá, pequeno explorador!' })).toBeVisible();
});

async function avancarIntroducaoAte(pagina, titulo) {
  await pagina.getByRole('button', { name: /^Continuar/ }).click();
  await expect(pagina.getByRole('heading', { name: titulo })).toBeVisible();
}

// Percorre todas as etapas da introdução e pula o treino.
async function concluirIntroducao(pagina) {
  for (let i = 0; i < 10; i += 1) {
    const continuar = pagina.getByRole('button', { name: /^Continuar/ });
    if (!(await continuar.isVisible())) break;
    await continuar.click();
  }
  await pagina.getByRole('button', { name: /Pular o treino/ }).click();
}

