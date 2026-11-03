/*
 * Histórico de tentativas no jogo: INTEGRAÇÃO REAL com a Zooly API (MongoDB em memória).
 * Primeira tentativa oficial, repetição, retomada, recompensa única e histórico sem gabarito.
 * Usa um aluno próprio (ALUNOS.tentativas), sem progresso no início.
 */
import { expect, test } from '@playwright/test';
import { ALUNOS } from './dados.mjs';
import { apiGet, login, saldoNoCabecalho, tokenDe, vigiarContexto } from './suporte.mjs';

test.describe.configure({ mode: 'serial' });

let contexto;
let p;
let monitor;
let token;
let idMissao;

const tentativasDaApi = () => apiGet(token, `/api/progresso/atividades/${idMissao}/tentativas`);
const ganhos = async () =>
  (await apiGet(token, '/api/moedas/movimentacoes?limite=50')).movimentacoes.filter((m) => m.tipo === 'ganho');

async function responder(alternativa) {
  await p.getByRole('radio', { name: alternativa, exact: true }).click();
  await p.getByRole('button', { name: 'Confirmar' }).click();
}

test.beforeAll(async ({ browser }) => {
  contexto = await browser.newContext({ viewport: { width: 390, height: 844 } });
  monitor = vigiarContexto(contexto);
  p = await contexto.newPage();
  await login(p, ALUNOS.tentativas);
  await p.waitForURL(/\/aventura/);
  token = await tokenDe(p);
});

test.afterAll(async () => {
  monitor.verificarSemFalhas();
  await contexto.close();
});

test('Primeira tentativa: abre normalmente, vale moedas e vira a oficial', async () => {
  await p.locator('.lista-missoes .missao').first().click();
  await p.waitForURL(/\/missao\//);
  idMissao = decodeURIComponent(p.url().split('/missao/')[1]);
  await expect(p.getByText('O passeio da capivara').first()).toBeVisible();
  await expect(p.locator('.aviso-tentativa')).toHaveCount(0);
  await expect(p.locator('.recompensa-missao')).toContainText('30');
  await p.getByRole('button', { name: 'Entendi' }).click();
  await responder('A capivara');
  await responder('Capivara');
  await expect(p.locator('.ganho-moedas')).toContainText('30');
  await expect(saldoNoCabecalho(p)).toHaveText('30');
  // Só uma vez: o histórico não aparece na primeira.
  await expect(p.locator('.historico-tentativas')).toHaveCount(0);

  const historico = await tentativasDaApi();
  expect(historico.totalTentativas).toBe(1);
  expect(historico.tentativas[0]).toMatchObject({ numeroTentativa: 1, oficial: true, status: 'concluida' });
});

test('Segunda tentativa: "Vamos tentar novamente!", sem moedas e sem mudar o resultado oficial', async () => {
  const { progresso: antes } = await apiGet(token, `/api/progresso/atividades/${idMissao}`);

  await p.goto(`/missao/${idMissao}`);
  const aviso = p.locator('.aviso-tentativa');
  await expect(aviso).toContainText('Vamos tentar novamente!');
  await expect(aviso).toContainText('2ª vez');
  await expect(aviso).toContainText('Sua primeira vez continua valendo');
  await expect(p.locator('.recompensa-missao'), 'repetição não promete moedas').toHaveCount(0);
  await p.getByRole('button', { name: 'Entendi' }).click();
  await expect(p.locator('.aviso-tentativa'), 'o aviso some depois do primeiro passo').toHaveCount(0);
  await responder('O elefante');
  await responder('Rio');

  await expect(p.getByText('Você terminou a 2ª vez!')).toBeVisible();
  await expect(p.locator('.ganho-moedas')).toHaveCount(0);
  const historicoNaTela = p.locator('.historico-tentativas');
  await expect(historicoNaTela).toContainText('1ª vez');
  await expect(historicoNaTela).toContainText('2ª vez');
  await expect(historicoNaTela.locator('.historico-tentativas__oficial')).toContainText('1ª vez');
  await expect(saldoNoCabecalho(p)).toHaveText('30');

  const { progresso: depois } = await apiGet(token, `/api/progresso/atividades/${idMissao}`);
  expect(depois.respostas).toEqual(antes.respostas);
  expect(depois.concluidaEm).toBe(antes.concluidaEm);
  const historico = await tentativasDaApi();
  expect(historico.tentativas.map((t) => [t.numeroTentativa, t.oficial])).toEqual([
    [1, true],
    [2, false]
  ]);
  // A 1ª tentativa guarda as respostas certas; a 2ª, as erradas. Nenhuma sobrescreve a outra.
  expect(historico.tentativas[0].respostas).toEqual(antes.respostas);
  expect(historico.tentativas[1].respostas).not.toEqual(antes.respostas);
});

test('Retomada: a resposta confirmada fica salva e a missão continua de onde parou', async () => {
  await p.goto(`/missao/${idMissao}`);
  await expect(p.locator('.aviso-tentativa')).toContainText('3ª vez');
  await p.getByRole('button', { name: 'Entendi' }).click();
  const salvou = p.waitForResponse(
    (resposta) => resposta.url().endsWith(`/api/progresso/atividades/${idMissao}/respostas`) && resposta.request().method() === 'PUT'
  );
  await responder('O elefante');
  expect((await salvou).status()).toBe(200);
  await expect(p.getByText('Pergunta 2 de 2')).toBeVisible();

  // A criança sai no meio da missão.
  await p.goto('/aventura');
  let historico = await tentativasDaApi();
  const aberta = historico.tentativas.find((t) => t.status === 'em_andamento');
  expect(aberta.numeroTentativa).toBe(3);
  expect(aberta.respostas).toHaveLength(1);

  // Ao voltar, a API retoma a mesma tentativa e o jogo abre direto na pergunta 2.
  await p.goto(`/missao/${idMissao}`);
  const aviso = p.locator('.aviso-tentativa');
  await expect(aviso).toContainText('Que bom que você voltou!');
  await expect(aviso).toContainText('3ª vez');
  await expect(p.getByText('Pergunta 2 de 2')).toBeVisible();
  historico = await tentativasDaApi();
  expect(historico.totalTentativas, 'retomar não cria outra tentativa').toBe(3);

  await responder('Capivara');
  await expect(p.getByText('Você terminou a 3ª vez!')).toBeVisible();
  historico = await tentativasDaApi();
  expect(historico.tentativas.map((t) => t.status)).toEqual(['concluida', 'concluida', 'concluida']);
  // A resposta dada antes de sair foi preservada e enviada junto com a nova.
  expect(historico.tentativas[2].respostas).toHaveLength(2);
});

test('Recompensa concedida uma única vez, mesmo com três tentativas', async () => {
  expect((await apiGet(token, '/api/moedas/saldo')).saldo).toBe(30);
  const lista = await ganhos();
  expect(lista).toHaveLength(1);
  expect(lista[0].quantidade).toBe(30);
  await p.goto('/loja');
  await expect(p.getByText(/Missão concluída|Conclusão de atividade/).first()).toBeVisible();
});

test('Abrir a missão várias vezes não cria tentativas a mais', async () => {
  await p.goto(`/missao/${idMissao}`);
  await expect(p.locator('.aviso-tentativa')).toContainText('4ª vez');
  await p.goto('/aventura');
  await p.goto(`/missao/${idMissao}`);
  await expect(p.locator('.aviso-tentativa')).toContainText('4ª vez');
  const historico = await tentativasDaApi();
  expect(historico.totalTentativas).toBe(4);
  expect(historico.tentativas.filter((t) => t.status === 'em_andamento')).toHaveLength(1);
});

test('Histórico e conteúdo da missão não revelam o gabarito ao aluno', async () => {
  const historico = await tentativasDaApi();
  const conteudo = await apiGet(token, `/api/progresso/atividades/${idMissao}/conteudo`);
  for (const [nome, corpo] of [
    ['tentativas', historico],
    ['conteudo', conteudo]
  ]) {
    const texto = JSON.stringify(corpo);
    expect(texto, nome).not.toMatch(/respostasCorretas|"correta"|alternativaCorreta|feedback/);
  }
});
