# Proposta para o Zooly-api: histórico de tentativas por missão

> **Situação: implementado.** O Zooly-api passou a ter o histórico de tentativas (ver `docs/tentativas.md` naquele repositório), e o jogo o apresenta (ver "Tentativas das missões" em [INTEGRACAO-API.md](INTEGRACAO-API.md)). Este documento fica como registro da proposta original. Nomes e detalhes podem diferir da implementação final: vale o que está no Zooly-api.
>
> Documento produzido a partir do Zooly-game. As referências de código abaixo foram conferidas em `Zooly-api/src` em 03/11/2026.

## 1. Situação atual

### Como o jogo usa a API hoje

Ao abrir uma missão, `pages/missao/[id].js` chama, em ordem:

1. `GET  /api/progresso/atividades/:id/conteudo`
2. `POST /api/progresso/atividades/:id/iniciar`. Se já existir progresso, a API devolve o mesmo documento (200).
3. `PUT  /api/progresso/atividades/:id/respostas` com `{ respostas: [{ questaoId, alternativasSelecionadas }] }`
4. `PATCH /api/progresso/atividades/:id/concluir`

O mapa (`Home` e `/mapa`) oferece **"Jogar de novo"** em missões concluídas, e o fluxo acima se repete.

### O que acontece na API ao repetir

| Item | Onde | Comportamento |
|---|---|---|
| Progresso | `models/ProgressoAtividade.js` | **Um único documento** por `(aluno, atividade)` (índice único). |
| Respostas | `progressoService.salvarRespostas` | `progresso.respostas` é **substituído** e `respostasRegistradasEm` recebe a data atual, mesmo com `status: "concluida"`. |
| Moedas | `moedaService.concluirAtividadeComRecompensa` + índice `uma_recompensa_por_atividade_aluno` em `MovimentacaoMoeda` | **Já correto**: com o progresso concluído, devolve `movimentacao: null`. O índice único também impede uma segunda recompensa em caso de concorrência. |
| Desempenho do professor | `desempenhoService.consolidarDesempenho` | Lê `progresso.respostas` e filtra o período por `respostasRegistradasEm`. |

### Consequências

- As respostas da primeira tentativa (a que vale para a avaliação) **são perdidas** quando a criança joga de novo.
- O percentual de acerto da turma e do aluno **muda** depois de uma repetição, para melhor ou para pior.
- No relatório semanal, a missão **muda de semana**, porque `respostasRegistradasEm` passa a ser a data da repetição.
- O professor não vê quantas vezes a criança tentou.

O Zooly-game **não contorna isso no front-end**: continua enviando as respostas como a API espera. Esconder o envio ou guardar tentativas no navegador seria simular uma regra que pertence à API.

## 2. Requisitos

1. Histórico de tentativas por aluno e missão.
2. Respostas registradas de forma independente em cada tentativa.
3. Respostas anteriores preservadas: nenhuma tentativa altera outra.
4. Moedas concedidas **uma única vez** por missão (manter o comportamento atual).
5. Consulta do histórico pelo professor.
6. Compatibilidade com o Zooly-game atual: os contratos existentes continuam funcionando.

## 3. Modelo de dados proposto

### Nova coleção `TentativaAtividade`

```js
{
  aluno:       ObjectId (ref Aluno, obrigatório),
  atividade:   ObjectId (ref Atividade, obrigatório),
  progresso:   ObjectId (ref ProgressoAtividade, obrigatório),
  numero:      Number   (1, 2, 3...; sequencial por aluno+atividade),
  status:      "em_andamento" | "finalizada",
  iniciadaEm:  Date,
  finalizadaEm: Date | null,
  respostas:   [respostaSchema],   // mesmo subesquema de hoje
  respostasRegistradasEm: Date | null,
  oficial:     Boolean  // true só na tentativa que conta para o desempenho
}
```

Índices:

- `{ aluno: 1, atividade: 1, numero: 1 }` **único**: numeração sem duplicatas.
- `{ aluno: 1, atividade: 1 }` **único parcial** com `status: "em_andamento"`: no máximo uma tentativa aberta por vez.
- `{ atividade: 1, aluno: 1, iniciadaEm: -1 }`: consultas do professor.

### `ProgressoAtividade` vira o resumo

Mantém `status`, `iniciadaEm` e `concluidaEm` (o mapa e o desbloqueio sequencial continuam iguais) e ganha:

```js
totalTentativas:   Number (default 0),
tentativaOficial:  ObjectId | null,   // primeira tentativa finalizada
ultimaTentativaEm: Date | null
```

`respostas` e `respostasRegistradasEm` continuam existindo durante a transição, como **cópia da tentativa oficial**. Assim o `desempenhoService` atual segue correto até ser migrado.

### Regra de negócio sugerida (a validar com a equipe pedagógica)

- **A primeira tentativa finalizada é a oficial** e é a única usada no desempenho e no relatório semanal.
- As demais tentativas são **prática**: ficam visíveis para o professor, mas não alteram indicadores nem dão moedas.
- Se a equipe preferir "melhor tentativa" ou "última tentativa", basta mudar quem recebe `oficial: true`. O resto da proposta continua igual.

## 4. Contratos

Todos os endpoints existentes **mantêm caminho, corpo e campos de resposta**. Só são acrescentados campos.

| Endpoint | Mudança |
|---|---|
| `POST /api/progresso/atividades/:id/iniciar` | Cria o progresso (se não existir) **e** abre uma tentativa, ou reaproveita a que estiver `em_andamento`. Resposta: `{ progresso, tentativa: { id, numero, oficial } }`. |
| `PUT /api/progresso/atividades/:id/respostas` | Grava as respostas **na tentativa aberta**. Sem tentativa aberta: `404 atividade-nao-iniciada` (mesmo código de hoje). Nunca altera tentativas finalizadas. Se for a tentativa oficial, também copia para `progresso.respostas`. |
| `PATCH /api/progresso/atividades/:id/concluir` | Finaliza a tentativa aberta. Na primeira conclusão, marca `oficial: true`, conclui o progresso e concede a recompensa (fluxo atual de `concluirAtividadeComRecompensa`). Nas repetições, `movimentacao: null`. Resposta: `{ progresso, tentativa, movimentacao, saldo }`. |
| **Novo** `GET /api/progresso/atividades/:id/tentativas` (aluno) | Lista resumida das próprias tentativas (`numero`, datas, `oficial`), **sem gabarito**. Opcional para o jogo. |
| **Novo** `GET /api/desempenho/alunos/:alunoId/atividades/:atividadeId/tentativas` (professor) | Tentativas com respostas e correção por questão, autorizado como as demais rotas de `/api/desempenho` (turma do professor). |
| `GET /api/desempenho/turmas/:turmaId` e `/alunos/:alunoId` | Passam a ler a tentativa oficial e acrescentam `totalTentativas` por atividade. |

Tudo deve rodar dentro de `comTransacaoDeAluno` (já usado nas moedas), para que abrir, finalizar e recompensar sejam atômicos.

## 5. Migração

Script idempotente, no padrão de `scripts/` (com modo de verificação sem escrita):

1. Para cada `ProgressoAtividade` com `respostas.length > 0` ou `status: "concluida"`, criar a `TentativaAtividade` `numero: 1`, com `oficial` igual a `status === "concluida"`, respostas copiadas, `iniciadaEm` do progresso e `finalizadaEm` igual a `concluidaEm` (ou `null`).
2. Preencher `totalTentativas`, `tentativaOficial` e `ultimaTentativaEm`.
3. Progresso apenas iniciado e sem respostas: criar a tentativa 1 `em_andamento`.

Os dados de antes da migração já sofreram sobrescritas e **não podem ser recuperados**. O histórico vale a partir da implantação.

## 6. Testes sugeridos no Zooly-api

- Repetir uma missão concluída não altera `progresso.respostas`, `respostasRegistradasEm` nem o percentual de acerto.
- A segunda conclusão devolve `movimentacao: null` e o saldo não muda (inclusive com duas chamadas simultâneas).
- Duas chamadas simultâneas de `iniciar` abrem uma única tentativa.
- O professor de outra turma recebe 403 no histórico.
- O aluno nunca recebe `respostasCorretas`.
- Migração: rodar duas vezes produz o mesmo resultado.

## 7. Impacto no Zooly-game

Nenhuma mudança é **obrigatória**: o fluxo atual continua funcionando com os contratos estendidos. Depois da implantação, mudanças opcionais:

- Mostrar "Tentativa 2 · treino" na missão repetida, usando `tentativa.oficial` e `tentativa.numero`.
- Trocar o texto "Você já tinha concluído esta missão antes" por uma mensagem baseada em `tentativa.oficial`.
- ~~Atualizar o modo demonstração~~ (o modo demonstração foi removido do jogo).
