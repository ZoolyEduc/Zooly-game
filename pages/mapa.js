import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import GameFrame from '../components/layout/GameFrame';
import MapaCena from '../components/mapa/MapaCena';
import BalaoMascote from '../components/mapa/BalaoMascote';
import ConteudoCidade from '../components/mapa/ConteudoCidade';
import Modal from '../components/ui/Modal';
import Carregando from '../components/ui/Carregando';
import MensagemEstado from '../components/ui/MensagemEstado';
import { ROTAS } from '../config/rotas';
import { useMissoes } from '../hooks/useMissoes';
import { cidadesComMissoes, missaoDisponivel } from '../utils/missoes';
import { rotaDaMissao } from '../utils/rotasMissao';

export default function Mapa() {
  const router = useRouter();
  const { missoes, carregando, erro, recarregar } = useMissoes();
  const [cidadeAberta, setCidadeAberta] = useState(null);
  const [balaoFechado, setBalaoFechado] = useState(false);
  // A tela de missão volta para /mapa?concluido=1 ao terminar uma missão.
  const acabouDeConcluir = router.isReady && Boolean(router.query.concluido);

  const { cidades, trecho, totalTrechos } = useMemo(() => cidadesComMissoes(missoes), [missoes]);
  const proxima = missaoDisponivel(missoes);
  const cidadeProxima = proxima ? cidades.find((cidade) => cidade.missao?.id === proxima.id) || null : null;
  const ultimaConcluida = [...cidades].reverse().find((cidade) => cidade.missao?.concluida) || null;
  const cidadeFoco = cidadeProxima || ultimaConcluida;

  function jogar(missao) {
    router.push(rotaDaMissao(missao));
  }

  function fecharConclusao() {
    router.replace(ROTAS.mapa, undefined, { shallow: true });
  }

  function balao() {
    if (acabouDeConcluir) {
      return (
        <BalaoMascote
          titulo="Missão concluída!"
          texto={
            proxima
              ? `Muito bem! A próxima aventura te espera${cidadeProxima ? ` em ${cidadeProxima.nome}` : ''}.`
              : 'Muito bem! Aguarde a próxima aventura que seu professor vai liberar.'
          }
          acao={proxima ? 'Ver próxima aventura' : undefined}
          onAcao={fecharConclusao}
          onFechar={fecharConclusao}
        />
      );
    }
    if (balaoFechado) return null;
    if (missoes.length === 0) {
      return (
        <BalaoMascote
          escurecer
          titulo="Ainda não há aventuras"
          texto="Seu professor vai liberar a primeira missão em breve!"
          onFechar={() => setBalaoFechado(true)}
        />
      );
    }
    if (!proxima) {
      return (
        <BalaoMascote
          escurecer
          titulo="Você ajudou todas as cidades!"
          texto="Aguarde a próxima aventura que seu professor vai liberar."
          onFechar={() => setBalaoFechado(true)}
        />
      );
    }
    return (
      <BalaoMascote
        titulo={`Vamos para ${cidadeProxima?.nome || 'a próxima aventura'}!`}
        texto={`Uma nova aventura espera por você: ${proxima.titulo}`}
        acao="Começar aventura"
        onAcao={() => jogar(proxima)}
        onFechar={() => setBalaoFechado(true)}
      />
    );
  }

  return (
    <GameFrame ativo="mapa" variante="mapa">
      {carregando && <Carregando texto="Abrindo o mapa..." />}

      {!carregando && erro && (
        <div className="mapa-erro">
          <MensagemEstado
            tipo="erro"
            titulo="Não foi possível abrir o mapa"
            texto={erro}
            onTentarNovamente={recarregar}
          />
        </div>
      )}

      {!carregando && !erro && (
        <MapaCena
          cidades={cidades}
          cidadeFoco={cidadeFoco}
          onCidade={(cidade, situacao) => setCidadeAberta({ ...cidade, situacao })}
        >
          {totalTrechos > 1 && (
            <span className="mapa-trecho">
              Trecho {trecho} de {totalTrechos}
            </span>
          )}
          {!cidadeAberta && balao()}
        </MapaCena>
      )}

      <Modal
        aberto={Boolean(cidadeAberta)}
        onFechar={() => setCidadeAberta(null)}
        titulo={cidadeAberta?.nome}
        className="modal-fase"
      >
        {cidadeAberta && <ConteudoCidade cidade={cidadeAberta} onJogar={jogar} />}
      </Modal>
    </GameFrame>
  );
}
