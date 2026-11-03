import api from './api';
import { salvarSessao } from './sessao';

export async function loginAluno({ ra, senha }) {
  const { data } = await api.post('/api/auth/aluno/login', { ra, senha });
  salvarSessao(data);
  return data;
}

// Primeiro acesso: cadastro sem senha. A API não devolve token; para entrar,
// o aluno usa o login normal (RA + senha da turma).
export async function cadastrarAluno({ ra, codigoPermanente, nomeCompleto, sexo }) {
  const { data } = await api.post('/api/auth/aluno/cadastro', { ra, codigoPermanente, nomeCompleto, sexo });
  return data;
}

export async function concluirCadastroInicial({ nomeCompleto, codigoPermanente, sexo }) {
  const { data } = await api.patch('/api/alunos/cadastro-inicial', { nomeCompleto, codigoPermanente, sexo });
  return data;
}
