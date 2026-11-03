import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

// Leitura em voz alta pela Web Speech API do navegador. Nada é gravado nem enviado.
const naoMuda = () => () => {};
const sinteseDisponivel = () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

export function useLeitorVoz() {
  const suportado = useSyncExternalStore(naoMuda, sinteseDisponivel, () => false);
  const [falando, setFalando] = useState(false);

  useEffect(
    () => () => {
      if (sinteseDisponivel()) window.speechSynthesis.cancel();
    },
    []
  );

  const falar = useCallback(
    (texto, { velocidade = 0.9 } = {}) => {
      if (!suportado || !texto) return;
      const sintese = window.speechSynthesis;
      sintese.cancel();
      const fala = new window.SpeechSynthesisUtterance(texto);
      fala.lang = 'pt-BR';
      fala.rate = velocidade;
      const vozPortugues = sintese.getVoices().find((voz) => voz.lang?.toLowerCase().startsWith('pt'));
      if (vozPortugues) fala.voice = vozPortugues;
      fala.onend = () => setFalando(false);
      fala.onerror = () => setFalando(false);
      setFalando(true);
      sintese.speak(fala);
    },
    [suportado]
  );

  const parar = useCallback(() => {
    if (suportado) window.speechSynthesis.cancel();
    setFalando(false);
  }, [suportado]);

  return { suportado, falando, falar, parar };
}
