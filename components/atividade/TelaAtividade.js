import GameHeader from '../layout/GameHeader';
import BarraProgresso from '../ui/BarraProgresso';

export default function TelaAtividade({ passo, total, selo, onSair, children, rodape }) {
  return (
    <div className="tela-atividade">
      <GameHeader />
      {selo && (
        <p className="tela-atividade__selo">
          {selo}
          {onSair && (
            <button type="button" className="tela-atividade__sair" onClick={onSair}>
              Sair do treino
            </button>
          )}
        </p>
      )}
      {total > 0 && (
        <div className="atividade-progresso">
          <b>Progresso</b>
          <b>
            {passo}/{total}
          </b>
          <BarraProgresso valor={(passo / total) * 100} rotulo={`Etapa ${passo} de ${total}`} />
        </div>
      )}
      <main className="tela-atividade__conteudo">{children}</main>
      {rodape && <div className="tela-atividade__rodape">{rodape}</div>}
    </div>
  );
}
