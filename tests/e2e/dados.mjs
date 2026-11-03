// Valores compartilhados entre o servidor de teste e os cenários.
export const PORTA_API = Number(process.env.E2E_PORTA_API || 4100);
export const PORTA_JOGO = Number(process.env.E2E_PORTA_JOGO || 3005);
export const URL_API = `http://localhost:${PORTA_API}`;
export const URL_JOGO = `http://localhost:${PORTA_JOGO}`;

export const SENHA_TURMA = 'senha-e2e';
export const TURMA = { nome: '1º Ano E2E', codigo: 'E2E-1A', periodo: 'Manhã' };
// Turma em que a professora ainda não definiu a senha de acesso.
export const TURMA_SEM_SENHA = { nome: '2º Ano E2E', codigo: 'E2E-2A', periodo: 'Tarde' };

// RA dos alunos usados por cada spec (cadastro completo, sem progresso no início).
export const ALUNOS = { tentativas: 'E2E-0002', semDemo: 'E2E-0003' };
