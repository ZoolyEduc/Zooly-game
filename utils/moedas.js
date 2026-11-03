import { mascoteDoAvatar } from '../config/mascotes';

const PREFIXO_COMPRA_AVATAR = 'Compra de avatar: ';

/**
 * A API grava o motivo das compras com o id técnico do avatar
 * ("Compra de avatar: avatar-03"). Para a criança, mostramos o nome do mascote.
 * Outros motivos aparecem exatamente como vieram da API.
 */
export function descreverMovimentacao(movimentacao) {
  const motivo = String(movimentacao?.motivo || '');
  if (!motivo.startsWith(PREFIXO_COMPRA_AVATAR)) return motivo;
  const avatarId = motivo.slice(PREFIXO_COMPRA_AVATAR.length).trim();
  const mascote = mascoteDoAvatar(avatarId);
  return mascote ? `Novo amigo: ${mascote.nome}` : 'Novo avatar';
}
