import BotaoOuvir from '../ui/BotaoOuvir';

export default function EtapaHistoria({ titulo, texto }) {
  return (
    <>
      <h1 className="atividade-titulo">
        <span className="atividade-titulo__icone" aria-hidden="true">📘</span> {titulo}
      </h1>
      <div className="historia-arte" role="img" aria-label="Ilustração da floresta do Vale do Ribeira" />
      <article className="historia-cartao">
        <BotaoOuvir
          texto={`${titulo}. ${texto}`}
          rotulo="Ouvir história"
          semSuporte={<p className="dica-sem-audio">Peça para um adulto ler a história com você.</p>}
        />
        <p>{texto}</p>
      </article>
    </>
  );
}
