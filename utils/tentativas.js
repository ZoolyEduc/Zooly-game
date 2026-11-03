/*
 * Regras de apresentação do histórico de tentativas (a regra de negócio é da API):
 * - a 1ª vez concluída é a oficial e é a única que dá moedas;
 * - jogar de novo abre uma nova tentativa, que não muda o resultado oficial;
 * - uma tentativa em andamento é retomada com as respostas já salvas.
 * Sem dependências: testado com node:test (tests/unit).
 */

/** "1ª vez", "2ª vez"... */
export function rotuloVez(numero) {
  return `${numero}ª vez`;
}

/**
 * Respostas já salvas na tentativa ({ questaoId: alternativaId }), só das questões e
 * alternativas que existem no conteúdo atual da missão.
 */
export function respostasSalvas(tentativa, questoes) {
  const validas = {};
  const porId = new Map((questoes ?? []).map((questao) => [String(questao.id), questao]));
  for (const resposta of tentativa?.respostas ?? []) {
    const questao = porId.get(String(resposta.questaoId));
    const escolhida = String(resposta.alternativasSelecionadas?.[0] ?? '');
    if (questao && questao.alternativas?.some((alternativa) => String(alternativa.id) === escolhida)) {
      validas[String(questao.id)] = escolhida;
    }
  }
  return validas;
}

/**
 * Em qual passo a missão abre. Passos: [história?] + questões + tela final.
 * Na retomada com respostas salvas, vai direto para a primeira questão sem resposta
 * (ou para a última, se todas já foram respondidas, para a criança confirmar e concluir).
 */
export function passoInicial({ temHistoria, questoes, respostas, retomada }) {
  const lista = questoes ?? [];
  const respondidas = lista.filter((questao) => respostas?.[String(questao.id)]).length;
  if (!retomada || respondidas === 0 || lista.length === 0) return 0;
  const offset = temHistoria ? 1 : 0;
  const pendente = lista.findIndex((questao) => !respostas[String(questao.id)]);
  return offset + (pendente === -1 ? lista.length - 1 : pendente);
}

/**
 * Situação da tentativa ao abrir a missão, para o aviso amigável.
 * tipo: 'primeira' | 'retomada' | 'repeticao'.
 */
export function situacaoTentativa({ tentativa, retomada, respondidas }) {
  const numero = tentativa?.numeroTentativa ?? 1;
  const repeticao = numero > 1;
  if (retomada && respondidas > 0) {
    return {
      tipo: 'retomada',
      numero,
      repeticao,
      titulo: 'Que bom que você voltou!',
      texto: 'Vamos continuar de onde você parou. Suas respostas foram guardadas.'
    };
  }
  if (repeticao) {
    return {
      tipo: 'repeticao',
      numero,
      repeticao,
      titulo: 'Vamos tentar novamente!',
      texto: 'Sua primeira vez continua valendo. Agora é para praticar: as moedas desta missão você já ganhou.'
    };
  }
  return { tipo: 'primeira', numero, repeticao, titulo: '', texto: '' };
}

/** Respostas no formato de PUT /api/progresso/atividades/:id/respostas (só as respondidas). */
export function respostasParaApi(questoes, respostas) {
  return (questoes ?? [])
    .filter((questao) => respostas?.[String(questao.id)])
    .map((questao) => ({
      questaoId: String(questao.id),
      alternativasSelecionadas: [String(respostas[String(questao.id)])]
    }));
}

/** Mensagem da tela final, a partir do que a API devolveu na conclusão. */
export function resultadoDaConclusao(conclusao) {
  const ganho = conclusao?.movimentacao?.quantidade ?? 0;
  const tentativa = conclusao?.tentativa;
  if (ganho > 0) return { ganho, texto: '' };
  if (tentativa && !tentativa.oficial) {
    return {
      ganho: 0,
      texto: `Você terminou a ${rotuloVez(tentativa.numeroTentativa)}! Sua primeira vez continua valendo. Que bom praticar de novo!`
    };
  }
  return { ganho: 0, texto: 'Você já tinha concluído esta missão antes. Que bom jogar de novo!' };
}
