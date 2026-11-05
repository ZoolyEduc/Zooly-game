import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiCreditCard, FiLock } from 'react-icons/fi';
import Cenario from '../components/layout/Cenario';
import Marca from '../components/marca/Marca';
import { ROTAS } from '../config/rotas';
import { loginAluno } from '../services/auth';
import { mensagemErroApi, statusDoErro } from '../services/erros';
import { obterEstadoSessao } from '../services/sessao';
import { destinoParaRota } from '../components/layout/GuardaSessao';

export default function Login() {
  const [ra, setRa] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();
  const sessaoExpirada = router.isReady && router.query.sessao === 'expirada';
  // Volta do cadastro: /login?cadastro=ok&ra=... (o RA já vem preenchido).
  const cadastroConcluido = router.isReady && router.query.cadastro === 'ok';
  const raDoCadastro = router.isReady && typeof router.query.ra === 'string' ? router.query.ra : '';

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (raDoCadastro) setRa(raDoCadastro);
  }, [raDoCadastro]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!router.isReady || sessaoExpirada) return;
    const estado = obterEstadoSessao();
    if (estado.modo) router.replace(destinoParaRota(ROTAS.inicio, estado) || ROTAS.inicio);
  }, [router, sessaoExpirada]);

  async function entrar(evento) {
    evento.preventDefault();
    setErro('');

    const raLimpo = ra.trim();
    // Alunos antigos podem ter RA em outro formato: o login aceita qualquer RA preenchido.
    if (!raLimpo || !senha) {
      setErro('Informe seu RA e sua senha para entrar.');
      return;
    }

    setCarregando(true);
    try {
      const resposta = await loginAluno({ ra: raLimpo, senha });
      const destino = destinoParaRota(ROTAS.inicio, obterEstadoSessao());
      router.push(resposta.cadastroInicialPendente ? ROTAS.cadastro : destino || ROTAS.inicio);
    } catch (error) {
      setErro(
        statusDoErro(error) === 401
          ? 'RA ou senha não conferem. Confira e tente de novo, ou peça ajuda à sua professora.'
          : mensagemErroApi(error, 'Não foi possível entrar. Tente de novo.')
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Cenario classe="tela-formulario tela-login">
      <form className="login-conteudo" onSubmit={entrar} noValidate>
        <Marca compacta />
        <div className="cartao-login">
          <label htmlFor="raLogin">NÚMERO DO RA</label>
          <div className="campo campo-login">
            <FiCreditCard aria-hidden="true" />
            <input
              id="raLogin"
              type="text"
              value={ra}
              onChange={(evento) => setRa(evento.target.value)}
              placeholder="Digite seu RA"
              inputMode="numeric"
              autoComplete="username"
              disabled={carregando}
            />
          </div>

          <label htmlFor="senhaLogin">SENHA</label>
          <div className="campo campo-login">
            <FiLock aria-hidden="true" />
            <input
              id="senhaLogin"
              type="password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              disabled={carregando}
            />
          </div>
          {cadastroConcluido && !erro && (
            <p className="mensagem-aviso" role="status">
              Cadastro feito! Agora digite a senha da turma para entrar.
            </p>
          )}
          {sessaoExpirada && !erro && (
            <p className="mensagem-aviso" role="status">
              Sua sessão terminou. Entre novamente para continuar a aventura.
            </p>
          )}
          {erro && <p className="mensagem-erro" role="alert">{erro}</p>}
        </div>

        <button className="botao-principal botao-entrar" type="submit" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
        <button type="button" className="link-secundario" onClick={() => router.push(ROTAS.cadastro)} disabled={carregando}>
          Primeiro acesso? Cadastre-se
        </button>
      </form>
    </Cenario>
  );
}
