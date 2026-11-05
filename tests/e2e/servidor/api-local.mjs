/*
 * Sobe a Zooly API REAL (código de ../Zooly-api/src, sem alterações) sobre um
 * MongoDB em memória, com dados de teste próprios. Nada é gravado no Atlas nem
 * em bancos compartilhados: o banco some quando o processo termina.
 *
 * Usado pelo Playwright (webServer em playwright.config.mjs). Variáveis:
 *   ZOOLY_API_DIR   pasta do Zooly-api (padrão: ../Zooly-api, ao lado deste repositório)
 *   E2E_PORTA_API   porta da API (padrão 4100)
 *   E2E_ORIGEM_JOGO origem liberada no CORS (padrão http://localhost:3005)
 */
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { ALUNOS, SENHA_TURMA, TURMA, TURMA_SEM_SENHA } from '../dados.mjs';

const RAIZ_JOGO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const DIR_API = path.resolve(process.env.ZOOLY_API_DIR || path.join(RAIZ_JOGO, '..', 'Zooly-api'));
const PORTA = Number(process.env.E2E_PORTA_API || 4100);
const ORIGEM_JOGO = process.env.E2E_ORIGEM_JOGO || 'http://localhost:3005';

if (!existsSync(path.join(DIR_API, 'src', 'app.js')) || !existsSync(path.join(DIR_API, 'node_modules'))) {
  console.error(
    `Zooly-api não encontrado ou sem dependências em "${DIR_API}". ` +
      'Clone o Zooly-api ao lado deste repositório, rode "npm install" nele ou defina ZOOLY_API_DIR.'
  );
  process.exit(1);
}

// Transações de moedas exigem replica set.
const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
process.env.MONGODB_URI = replSet.getUri();
process.env.MONGODB_DB_NAME = 'zooly_e2e';
process.env.JWT_SECRET = 'segredo-somente-teste-e2e';
process.env.JWT_EXPIRES_IN_ALUNO = '2h';
process.env.CORS_ORIGINS = ORIGEM_JOGO;
delete process.env.ZOOLY_AMBIENTE;

const importarDaApi = (relativo) => import(pathToFileURL(path.join(DIR_API, relativo)).href);
const exigirDaApi = createRequire(path.join(DIR_API, 'package.json'));
const bcrypt = exigirDaApi('bcryptjs');
const { Types } = exigirDaApi('mongoose');

const { default: app } = await importarDaApi('src/app.js');
const { connectDatabase } = await importarDaApi('src/config/database.js');
await connectDatabase();

const modelos = {};
for (const nome of ['Escola', 'Professor', 'Turma', 'Aluno', 'Historia', 'Atividade']) {
  modelos[nome] = (await importarDaApi(`src/models/${nome}.js`)).default;
  await modelos[nome].init();
}
const { Escola, Professor, Turma, Aluno, Historia, Atividade } = modelos;

function questao(enunciado, certa, errada) {
  const idCerta = new Types.ObjectId();
  return {
    _id: new Types.ObjectId(),
    tipo: 'multipla_escolha',
    enunciado,
    pontos: 5,
    alternativas: [
      { _id: idCerta, texto: certa },
      { _id: new Types.ObjectId(), texto: errada }
    ],
    respostasCorretas: [idCerta]
  };
}

const escola = await Escola.create({
  nome: 'Escola E2E',
  codigoPermanente: 'E2E-ESCOLA',
  municipio: 'Registro',
  endereco: 'Rua Teste, 1',
  email: 'escola@e2e.example',
  contato: '(00) 0000-0000'
});
const professora = await Professor.create({
  nome: 'Professora E2E',
  email: 'prof@e2e.example',
  senha: await bcrypt.hash('nao-usada', 4),
  escolas: [escola._id]
});
const turma = await Turma.create({
  nome: TURMA.nome,
  codigoPermanente: TURMA.codigo,
  periodo: TURMA.periodo,
  mascote: 'sarue',
  anoEscolar: new Date().getFullYear(),
  escola: escola._id,
  professorResponsavel: professora._id,
  senhaAcessoHash: await bcrypt.hash(SENHA_TURMA, 4)
});
await Turma.create({
  nome: TURMA_SEM_SENHA.nome,
  codigoPermanente: TURMA_SEM_SENHA.codigo,
  periodo: TURMA_SEM_SENHA.periodo,
  mascote: 'sarue',
  anoEscolar: new Date().getFullYear(),
  escola: escola._id,
  professorResponsavel: professora._id
});
await Aluno.create([
  { ra: '0000000000001', nomeCompleto: 'Lia Teste', sexo: 'feminino', turma: turma._id, cadastroInicialConcluido: true },
  { ra: '0000000000004', turma: turma._id },
  // Alunos próprios de cada spec, para os cenários não dependerem uns dos outros.
  { ra: ALUNOS.tentativas, nomeCompleto: 'Theo Teste', sexo: 'masculino', turma: turma._id, cadastroInicialConcluido: true },
  { ra: ALUNOS.semDemo, nomeCompleto: 'Bia Teste', sexo: 'feminino', turma: turma._id, cadastroInicialConcluido: true }
]);

const historia = await Historia.create({
  titulo: 'O passeio da capivara',
  conteudo: 'A capivara passeou pela margem do rio.'
});
const base = {
  professorCriador: professora._id,
  turma: turma._id,
  status: 'publicada',
  publicadoEm: new Date(),
  missao: { etapas: ['ler_texto', 'responder_perguntas'] }
};
await Atividade.create([
  {
    ...base,
    titulo: 'Aventura no rio',
    ordem: 1,
    recompensaMoedas: 30,
    historia: { tipo: 'oficial', historiaId: historia._id },
    questoes: [
      questao('Quem passeou pelo rio?', 'A capivara', 'O elefante'),
      questao('Qual palavra começa com C?', 'Capivara', 'Rio')
    ]
  },
  {
    ...base,
    titulo: 'Eco das vogais',
    ordem: 2,
    recompensaMoedas: 15,
    historia: { tipo: 'propria', texto: 'Vamos ouvir as vogais.' },
    questoes: [questao('Qual é vogal?', 'A', 'B')]
  },
  {
    ...base,
    titulo: 'Sons da caverna',
    ordem: 3,
    recompensaMoedas: 10,
    historia: { tipo: 'propria', texto: 'Ploc, ploc!' },
    questoes: [questao('Que som a gota faz?', 'Ploc', 'Miau')]
  }
]);

const servidor = app.listen(PORTA, () => {
  console.log(`API de teste pronta em http://localhost:${PORTA} (CORS: ${ORIGEM_JOGO})`);
});

async function encerrar() {
  servidor.close();
  await replSet.stop();
  process.exit(0);
}
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
