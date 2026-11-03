export default function Alternativas({ opcoes, selecionada, onSelecionar, desabilitado = false, rotulo = 'Alternativas' }) {
  const curtas = opcoes.every((opcao) => String(opcao.texto).length <= 3);
  return (
    <div
      className={`alternativas ${curtas ? 'alternativas--curtas' : 'alternativas--lista'}`}
      role="radiogroup"
      aria-label={rotulo}
    >
      {opcoes.map((opcao) => (
        <button
          type="button"
          role="radio"
          aria-checked={selecionada === opcao.id}
          key={opcao.id}
          className={selecionada === opcao.id ? 'selecionada' : ''}
          onClick={() => onSelecionar(opcao.id)}
          disabled={desabilitado}
        >
          {opcao.texto}
        </button>
      ))}
    </div>
  );
}
