export default function Carregando({ texto = 'Carregando...', telaCheia = false }) {
  return (
    <div className={`carregando ${telaCheia ? 'carregando--tela' : ''}`} role="status" aria-live="polite">
      <div className="carregando__pontos" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p>{texto}</p>
    </div>
  );
}
