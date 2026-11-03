import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiCheckCircle, FiCreditCard, FiUser } from 'react-icons/fi';
import { LuGraduationCap } from 'react-icons/lu';
import Cenario from '../components/layout/Cenario';
import Marca from '../components/marca/Marca';
import { ROTAS } from '../config/rotas';
import {
  atualizarUsuario,
  cadastroPendente,
  definirIntroPendente,
  limparPrimeiroAcesso,
  limparSessao,
  marcarCadastroConcluido,
  obterPrimeiroAcesso,
  obterToken,
  obterUsuario
} from '../services/sessao';
import { concluirCadastroInicial, entrarNaTurma } from '../services/auth';
import { mensagemErroApi, statusDoErro } from '../services/erros';

// Devolve a primeira pendência do formulário, para a criança corrigir um campo por vez.
function validarCadastro({ nome, ra, sexo, codigo }) {
  if (!nome.trim()) return 'Escreva o seu nome.';
  if (!ra.trim()) return 'Escreva o seu RA.';
  if (!sexo) return 'Escolha uma opção em "Sexo".';
  if (!codigo.trim()) return 'Digite o código da sua turma.';
  return '';
}

function lembrarAlunoCadastrado(aluno) {
  if (!aluno) return;
  atualizarUsuario({
    ...(obterUsuario() || {}),
    id: aluno.id,
    ra: aluno.ra,
    nome: aluno.nomeCompleto,
    sexo: aluno.sexo,
    turma: aluno.turma,
    tipo: 'aluno'
  });
}

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [ra, setRa] = useState('');
  const [sexo, setSexo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [origem, setOrigem] = useState('');
  const [credenciais, setCredenciais] = useState(null);
  const router = useRouter();

  // A origem do cadastro depende do armazenamento do navegador (indisponível na pré-renderização).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const primeiroAcesso = obterPrimeiroAcesso();
    if (primeiroAcesso?.ra && primeiroAcesso?.senha) {
      setOrigem('primeiro-acesso');
      setCredenciais(primeiroAcesso);
      setRa(primeiroAcesso.ra);
      return;
    }

    const usuario = obterUsuario();
    if (obterToken() && cadastroPendente() && usuario?.ra) {
      setOrigem('cadastro-pendente');
      setRa(usuario.ra);
      return;
    }

    router.replace(ROTAS.login);
  }, [router]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function voltarAoLogin() {
    if (origem === 'primeiro-acesso') limparPrimeiroAcesso();
    if (origem === 'cadastro-pendente') limparSessao();
    router.push(ROTAS.login);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');

    const pendencia = validarCadastro({ nome, ra, sexo, codigo });
    if (pendencia) {
      setErro(pendencia);
      return;
    }

    setCarregando(true);
    try {
      if (origem === 'primeiro-acesso') {
        if (!credenciais?.senha) {
          setErro('Sua sessão de primeiro acesso expirou. Volte ao login e tente novamente.');
          return;
        }

        const entrada = await entrarNaTurma({
          ra: ra.trim(),
          codigoPermanente: codigo.trim().toUpperCase(),
          senha: credenciais.senha
        });

        limparPrimeiroAcesso();
        setCredenciais(null);

        if (!entrada.cadastroInicialPendente) {
          router.replace(ROTAS.inicio);
          return;
        }

        setOrigem('cadastro-pendente');
      }

      try {
        const resposta = await concluirCadastroInicial({
          nomeCompleto: nome.trim(),
          codigoPermanente: codigo.trim().toUpperCase(),
          sexo
        });
        lembrarAlunoCadastrado(resposta.aluno);
      } catch (error) {
        // 409: a API já registrou o cadastro (ex.: a resposta anterior se perdeu na rede).
        if (statusDoErro(error) !== 409) throw error;
      }

      marcarCadastroConcluido();
      definirIntroPendente(true);
      router.replace(ROTAS.introducao);
    } catch (error) {
      setErro(mensagemErroApi(error, 'Não foi possível concluir seu cadastro. Confira os dados e tente de novo.'));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Cenario classe={`tela-formulario tela-cadastro ${origem === 'primeiro-acesso' ? 'tela-cadastro--primeiro' : ''}`}>
      <div className="formulario-marca">
        <Marca compacta />
      </div>
      <form className="cartao-formulario cartao-cadastro" onSubmit={enviar} noValidate>
        <div className="campo-grupo">
          <label htmlFor="cadNome">
            <span className="campo-numero">1</span> Qual é o seu nome?
            <small>Obrigatório</small>
          </label>
          <div className="campo">
            <FiUser aria-hidden="true" />
            <input
              id="cadNome"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              placeholder="Digite seu nome"
              autoComplete="name"
              disabled={carregando}
              required
            />
          </div>
        </div>

        <div className="campo-grupo">
          <label htmlFor="cadRa">
            <span className="campo-numero">2</span> Seu número de matrícula
            <small className="info">RA Escolar</small>
          </label>
          <div className="campo">
            <FiCreditCard aria-hidden="true" />
            <input
              id="cadRa"
              value={ra}
              onChange={(evento) => setRa(evento.target.value)}
              readOnly={origem === 'cadastro-pendente'}
              placeholder="Digite seu RA"
              inputMode="numeric"
              autoComplete="username"
              disabled={carregando}
            />
          </div>
          <p className="ajuda-campo">
            {origem === 'primeiro-acesso'
              ? 'Confira seu RA. Você pode corrigir o número antes de continuar.'
              : 'Peça seu RA à professora se você ainda não decorou!'}
          </p>
        </div>

        <fieldset className="campo-grupo">
          <legend>
            <span className="campo-numero">3</span> Sexo
            <small>Escolha uma opção</small>
          </legend>
          <div className="opcoes-sexo">
            {['feminino', 'masculino'].map((opcao) => (
              <label key={opcao} className={`opcao-sexo ${opcao} ${sexo === opcao ? 'selecionado' : ''}`}>
                <input
                  type="radio"
                  name="sexo"
                  value={opcao}
                  checked={sexo === opcao}
                  onChange={() => setSexo(opcao)}
                  disabled={carregando}
                />
                <span className="opcao-sexo__icone" aria-hidden="true">{opcao === 'feminino' ? '♀' : '♂'}</span>
                {opcao === 'feminino' ? 'Feminino' : 'Masculino'}
                <i className="opcao-sexo__marca" aria-hidden="true" />
              </label>
            ))}
          </div>
        </fieldset>

        <div className="campo-grupo">
          <label htmlFor="cadCodigo">
            <span className="campo-numero">4</span> Código da sua turma
            <small>Fornecido na escola</small>
          </label>
          <div className="campo">
            <LuGraduationCap aria-hidden="true" />
            <input
              id="cadCodigo"
              value={codigo}
              onChange={(evento) => setCodigo(evento.target.value.toUpperCase())}
              placeholder="DIGITE O CÓDIGO INFORMADO"
              autoCapitalize="characters"
              disabled={carregando}
              required
            />
          </div>
        </div>

        {erro && <p className="mensagem-erro" role="alert">{erro}</p>}
        <button className="botao-salvar" type="submit" disabled={carregando || !origem}>
          <FiCheckCircle aria-hidden="true" />
          {carregando ? 'SALVANDO...' : 'SALVAR'}
        </button>
      </form>
      <button type="button" className="link-secundario" onClick={voltarAoLogin} disabled={carregando}>
        Voltar para o login
      </button>
    </Cenario>
  );
}
