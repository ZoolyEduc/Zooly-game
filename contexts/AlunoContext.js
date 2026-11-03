import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { buscarPerfil, buscarSaldo } from '../services/jogo';
import { mensagemErroApi } from '../services/erros';
import { atualizarUsuario, obterUsuario } from '../services/sessao';
import { mascoteDoAluno } from '../config/mascotes';

const AlunoContext = createContext(null);

// Mantém o resumo do login atualizado com o perfil mais recente da API.
function lembrarPerfil(perfil) {
  const salvo = obterUsuario() || {};
  atualizarUsuario({
    ...salvo,
    id: perfil.id,
    ra: perfil.ra,
    nome: perfil.nomeCompleto,
    turma: perfil.turma?.id || salvo.turma,
    tipo: 'aluno'
  });
}

export function AlunoProvider({ children }) {
  const [aluno, setAluno] = useState(null);
  const [saldo, setSaldo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const recarregarSaldo = useCallback(async () => {
    try {
      setSaldo(await buscarSaldo());
    } catch {
      setSaldo(null);
    }
  }, []);

  const recarregar = useCallback(async () => {
    setErro('');

    // Enquanto o perfil chega, mostra o nome salvo no login.
    const salvo = obterUsuario();
    if (salvo) setAluno((atual) => atual || { nomeCompleto: salvo.nome, ra: salvo.ra });

    try {
      const perfil = await buscarPerfil();
      setAluno(perfil);
      if (perfil) lembrarPerfil(perfil);
    } catch (error) {
      setErro(mensagemErroApi(error, 'Não foi possível carregar seus dados.'));
    } finally {
      setCarregando(false);
    }
    await recarregarSaldo();
  }, [recarregarSaldo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial a partir da API
    recarregar();
  }, [recarregar]);

  const definirAvatar = useCallback((avatarSelecionado) => {
    setAluno((atual) => ({ ...atual, avatarSelecionado }));
  }, []);

  const valor = useMemo(
    () => ({
      aluno,
      saldo,
      carregando,
      erro,
      mascote: mascoteDoAluno(aluno),
      definirSaldo: setSaldo,
      definirAvatar,
      recarregar,
      recarregarSaldo
    }),
    [aluno, saldo, carregando, erro, definirAvatar, recarregar, recarregarSaldo]
  );

  return <AlunoContext.Provider value={valor}>{children}</AlunoContext.Provider>;
}

export function useAluno() {
  const contexto = useContext(AlunoContext);
  if (!contexto) throw new Error('useAluno deve ser usado dentro de AlunoProvider.');
  return contexto;
}
