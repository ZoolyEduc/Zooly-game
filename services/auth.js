import api from './api';
import { salvarSessao } from './sessao';

export async function loginAluno({ ra, senha }) {
  const { data } = await api.post('/api/auth/aluno/login', { ra, senha });
  salvarSessao(data);
  return data;
}

export async function entrarNaTurma({ ra, codigoPermanente, senha }) {
  const { data } = await api.post('/api/auth/aluno/entrar-turma', { ra, codigoPermanente, senha });
  salvarSessao(data);
  return data;
}

export async function concluirCadastroInicial({ nomeCompleto, codigoPermanente, sexo }) {
  const { data } = await api.patch('/api/alunos/cadastro-inicial', { nomeCompleto, codigoPermanente, sexo });
  return data;
}
