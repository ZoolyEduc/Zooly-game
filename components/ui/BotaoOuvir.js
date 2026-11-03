import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import { useLeitorVoz } from '../../hooks/useLeitorVoz';

/**
 * Lê um texto em voz alta para crianças que ainda não leem com facilidade.
 * Sem suporte do navegador, mostra `semSuporte` (ex.: "Peça para um adulto ler").
 * `compacto` mostra só o ícone, para espaços pequenos como o balão do mapa.
 */
export default function BotaoOuvir({ texto, rotulo = 'Ouvir', semSuporte = null, compacto = false, className = '' }) {
  const { suportado, falando, falar, parar } = useLeitorVoz();
  if (!suportado) return semSuporte;

  const legenda = falando ? 'Parar' : rotulo;
  return (
    <button
      type="button"
      className={`botao-ouvir ${compacto ? 'botao-ouvir--compacto' : ''} ${className}`}
      onClick={() => (falando ? parar() : falar(texto))}
      aria-pressed={falando}
      aria-label={compacto ? legenda : undefined}
    >
      {falando ? <FiVolumeX aria-hidden="true" /> : <FiVolume2 aria-hidden="true" />}
      {!compacto && legenda}
    </button>
  );
}
