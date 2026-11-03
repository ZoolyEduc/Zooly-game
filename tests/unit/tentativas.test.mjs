// Testes unitários da apresentação das tentativas (utils/tentativas.js). Sem rede.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  passoInicial,
  respostasParaApi,
  respostasSalvas,
  resultadoDaConclusao,
  rotuloVez,
  situacaoTentativa
} from '../../utils/tentativas.js';

const questoes = [
  { id: 'q1', alternativas: [{ id: 'a1' }, { id: 'a2' }] },
  { id: 'q2', alternativas: [{ id: 'b1' }, { id: 'b2' }] },
  { id: 'q3', alternativas: [{ id: 'c1' }, { id: 'c2' }] }
];

test('respostas salvas: só as de questões e alternativas que existem', () => {
  const tentativa = {
    respostas: [
      { questaoId: 'q1', alternativasSelecionadas: ['a2'] },
      { questaoId: 'q2', alternativasSelecionadas: ['nao-existe'] },
      { questaoId: 'qx', alternativasSelecionadas: ['a1'] }
    ]
  };
  assert.deepEqual(respostasSalvas(tentativa, questoes), { q1: 'a2' });
  assert.deepEqual(respostasSalvas(null, questoes), {});
});

test('passo inicial: começo normal e retomada na primeira questão sem resposta', () => {
  assert.equal(passoInicial({ temHistoria: true, questoes, respostas: {}, retomada: false }), 0);
  // Retomada sem respostas: começa do início (história).
  assert.equal(passoInicial({ temHistoria: true, questoes, respostas: {}, retomada: true }), 0);
  // q1 respondida: pula a história e vai para q2 (passo 2 = história + q1).
  assert.equal(passoInicial({ temHistoria: true, questoes, respostas: { q1: 'a1' }, retomada: true }), 2);
  assert.equal(passoInicial({ temHistoria: false, questoes, respostas: { q1: 'a1' }, retomada: true }), 1);
  // Todas respondidas: última questão, para confirmar e concluir.
  assert.equal(
    passoInicial({ temHistoria: true, questoes, respostas: { q1: 'a1', q2: 'b1', q3: 'c1' }, retomada: true }),
    3
  );
  // Respostas sem retomada (não deveria acontecer) não mudam o começo.
  assert.equal(passoInicial({ temHistoria: true, questoes, respostas: { q1: 'a1' }, retomada: false }), 0);
});

test('situação: primeira vez, repetição e retomada', () => {
  assert.equal(situacaoTentativa({ tentativa: { numeroTentativa: 1 }, retomada: false, respondidas: 0 }).tipo, 'primeira');
  const repeticao = situacaoTentativa({ tentativa: { numeroTentativa: 2 }, retomada: false, respondidas: 0 });
  assert.equal(repeticao.tipo, 'repeticao');
  assert.equal(repeticao.titulo, 'Vamos tentar novamente!');
  assert.equal(repeticao.repeticao, true);
  const retomada = situacaoTentativa({ tentativa: { numeroTentativa: 3 }, retomada: true, respondidas: 1 });
  assert.equal(retomada.tipo, 'retomada');
  assert.equal(retomada.numero, 3);
  assert.equal(retomada.repeticao, true);
  // Retomada sem respostas salvas: só mostra o aviso se for repetição.
  assert.equal(situacaoTentativa({ tentativa: { numeroTentativa: 1 }, retomada: true, respondidas: 0 }).tipo, 'primeira');
  // API antiga, sem tentativa: comportamento de primeira vez.
  assert.equal(situacaoTentativa({ tentativa: null, retomada: false, respondidas: 0 }).tipo, 'primeira');
});

test('respostas para a API: formato do PUT e só as respondidas', () => {
  assert.deepEqual(respostasParaApi(questoes, { q1: 'a2', q3: 'c1' }), [
    { questaoId: 'q1', alternativasSelecionadas: ['a2'] },
    { questaoId: 'q3', alternativasSelecionadas: ['c1'] }
  ]);
  assert.deepEqual(respostasParaApi(questoes, {}), []);
});

test('tela final: moedas só da API; repetição sem moedas com a vez', () => {
  assert.deepEqual(resultadoDaConclusao({ movimentacao: { quantidade: 30 }, tentativa: { oficial: true } }), {
    ganho: 30,
    texto: ''
  });
  const repeticao = resultadoDaConclusao({ movimentacao: null, tentativa: { oficial: false, numeroTentativa: 2 } });
  assert.equal(repeticao.ganho, 0);
  assert.match(repeticao.texto, /2ª vez/);
  assert.match(resultadoDaConclusao({ movimentacao: null }).texto, /já tinha concluído/);
  assert.equal(rotuloVez(1), '1ª vez');
});
