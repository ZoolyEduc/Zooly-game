export default function BarraProgresso({ valor = 0, cor = 'verde', rotulo, className = '' }) {
  const percentual = Math.max(0, Math.min(100, Math.round(valor)));
  return (
    <div
      className={`barra-progresso barra-progresso--${cor} ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentual}
      aria-label={rotulo}
    >
      <i style={{ width: `${percentual}%` }} />
    </div>
  );
}
