import { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

export default function Modal({ aberto, onFechar, titulo, children, className = '', escurecer = true }) {
  const caixa = useRef(null);
  const fecharRef = useRef(onFechar);

  useEffect(() => {
    fecharRef.current = onFechar;
  }, [onFechar]);

  useEffect(() => {
    if (!aberto) return undefined;
    // Ao fechar, o foco volta para o botão que abriu o modal.
    const focoAnterior = document.activeElement;
    caixa.current?.focus();
    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') fecharRef.current?.();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => {
      window.removeEventListener('keydown', aoTeclar);
      if (focoAnterior instanceof HTMLElement) focoAnterior.focus();
    };
  }, [aberto]);

  if (!aberto) return null;

  return (
    <div className={`modal ${escurecer ? 'modal--escuro' : ''}`} onClick={onFechar}>
      <div
        className={`modal__caixa ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        ref={caixa}
        onClick={(evento) => evento.stopPropagation()}
      >
        {onFechar && (
          <button type="button" className="modal__fechar" onClick={onFechar} aria-label="Fechar">
            <FiX />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
