import { useCallback } from 'react';
import { buscarAvatares } from '../services/jogo';
import { mascoteDoAvatar } from '../config/mascotes';
import { useCarregamento } from './useCarregamento';

async function buscarCatalogo() {
  const lista = await buscarAvatares();
  return lista.map((avatar) => ({ ...avatar, mascote: mascoteDoAvatar(avatar.id) }));
}

export function useAvatares() {
  const { dados, definirDados, carregando, erro, recarregar } = useCarregamento(buscarCatalogo, {
    mensagemErro: 'Não foi possível carregar os avatares.'
  });

  const marcarAdquirido = useCallback(
    (avatarId) => {
      definirDados((atual) =>
        (atual || []).map((avatar) => (avatar.id === avatarId ? { ...avatar, adquirido: true } : avatar))
      );
    },
    [definirDados]
  );

  return { avatares: dados || [], carregando, erro, recarregar, marcarAdquirido };
}
