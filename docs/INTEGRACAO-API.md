# Integração com a Zooly API

API: `https://zooly-api.onrender.com` (padrão). Para outro endereço, configure `NEXT_PUBLIC_API_URL`.

Os contratos abaixo foram conferidos no código de `Zooly-api/src` (rotas, controllers e services).
O jogo usa somente endpoints que já existem no Zooly-api (inclusive o histórico de tentativas, implementado lá). Nenhum contrato foi inventado no front-end.

Todas as chamadas do jogo passam por `services/jogo.js` (token JWT do aluno, adicionado em `services/api.js`). **Não há modo demonstração:** ele foi removido, e nenhuma tela troca uma resposta da API por dados fictícios.

## Endpoints em uso

| Funcionalidade | Método e rota | Corpo | Resposta usada | Tela |
|---|---|---|---|---|
| Login do aluno | `POST /api/auth/aluno/login` | `{ ra, senha }` | `token`, `cadastroInicialPendente`, `usuario` | `/login` |
| Primeiro acesso (sem senha, não devolve token) | `POST /api/auth/aluno/cadastro` | `{ ra, codigoPermanente, nomeCompleto, sexo }` | `mensagem` | `/cadastro` |
| Cadastro pendente (aluno criado pela professora) | `PATCH /api/alunos/cadastro-inicial` | `{ nomeCompleto, codigoPermanente, sexo }` | `aluno` | `/cadastro` |
| Perfil | `GET /api/alunos/me` | — | `aluno` (nome, RA, `avatarSelecionado`, `turma { id, nome, mascote }`) | cabeçalho, Configurações |

O RA é enviado sempre como texto, preservando zeros à esquerda. Novos cadastros (primeiro acesso, ou entrada na turma que cria o aluno) exigem exatamente 13 dígitos. Alunos já cadastrados com RA em outro formato continuam podendo fazer login, entrar na turma e concluir o cadastro pendente; o RA deles nunca é alterado automaticamente.
| Trocar avatar | `PUT /api/alunos/me/avatar` | `{ avatarId }` | `avatarSelecionado` | `/avatar`, `/loja` |
| Saldo | `GET /api/moedas/saldo` | — | `saldo` | cabeçalho |
| Extrato | `GET /api/moedas/movimentacoes?pagina=1&limite=5` | — | `movimentacoes` | `/loja` |
| Mapa de missões | `GET /api/progresso/turma/:turmaId/mapa` | — | `mapaMissoes [{ id, titulo, ordem, desbloqueada, concluida, atrasada, prazo }]` | Home, Mapa, Painel |
| Progresso do aluno | `GET /api/progresso` | — | `progresso [{ atividade, status, concluidaEm, updatedAt }]` | Home, Painel |
| Conteúdo da missão | `GET /api/progresso/atividades/:id/conteudo` | — | `atividade { titulo, historia, questoes[alternativas] }` | `/missao/[id]` |
| Iniciar missão | `POST /api/progresso/atividades/:id/iniciar` | **sem corpo** | `progresso`, `tentativa`, `tentativaRetomada` | `/missao/[id]` |
| Enviar respostas | `PUT /api/progresso/atividades/:id/respostas` | `{ respostas: [{ questaoId, alternativasSelecionadas: [id] }] }` | `progresso` | `/missao/[id]` (a cada resposta confirmada e no fim) |
| Concluir missão | `PATCH /api/progresso/atividades/:id/concluir` | **sem corpo** | `progresso`, `tentativa`, `movimentacao`, `saldo` | `/missao/[id]` |
| Histórico da missão | `GET /api/progresso/atividades/:id/tentativas` | — | `totalTentativas`, `tentativas [{ id, numeroTentativa, status, oficial, ... }]` (sem gabarito) | tela final da missão |
| Catálogo de avatares | `GET /api/loja/avatares` | — | `avatares [{ id, nome, preco, imagem, adquirido }]` | `/loja`, `/avatar` |
| Comprar avatar | `POST /api/loja/avatares/:avatarId/comprar` | **sem corpo** | `avatar`, `saldo` | `/loja` |

### Regras da API respeitadas pelo front-end

- O `turmaId` do mapa vem de `GET /api/alunos/me` (`turma.id`) ou, como alternativa, do `usuario.turma` do login.
- As missões seguem o desbloqueio sequencial da API (`desbloqueada`). Missões bloqueadas não são abertas.
- A API **não devolve o gabarito** ao aluno. Por isso, `/missao/[id]` não mostra "certo/errado" nas missões reais: registra as respostas e conclui.
- As moedas ganhas aparecem a partir de `movimentacao.quantidade`. Repetir uma missão concluída não gera moedas (`movimentacao: null`).
- Só é possível usar um avatar comprado (`409 O avatar ainda não foi adquirido`).
- `401` em rota autenticada (token expirado ou inválido) limpa a sessão real e volta ao login (`/login?sessao=expirada`). As rotas `/api/auth/*` não disparam esse redirecionamento.

## Decisões de apresentação (sem alterar contratos)

| Diferença | Solução no front-end |
|---|---|
| A API tem 6 avatares genéricos (`avatar-01` a `avatar-06`, `imagem: null`); o Figma tem 4 mascotes | `config/mascotes.js` associa `avatar-01` → Saruê, `avatar-02` → Papagaio, `avatar-03` → Lagarto e `avatar-04` → Cobra. IDs e preços continuam vindo da API. `avatar-05` e `avatar-06` aparecem como **"Em breve"** até existir arte para eles. |
| Avatar ainda não escolhido | Usa o `turma.mascote` da API; sem ele, o Lagarto (o mesmo do cabeçalho do Figma). |
| As missões não têm cidade | `config/mapa.js` e `utils/missoes.js` associam pela ordem: 1 Eldorado, 2 Sete Barras, 3 Iporanga, 4 Registro, 5 Iguape, 6 Cananéia. Com mais de 6 missões, o mapa mostra o "trecho" de seis cidades que contém a próxima missão. |
| Preço 500 no Figma | São usados os preços reais da API (10, 20 e 30). |
| O Figma fala em "pontos" | O app usa "moedas", como na API. |

## Funcionalidades que dependem de endpoints inexistentes

Estas funcionalidades **não foram simuladas como reais**:

| Funcionalidade (Figma) | Situação na API | O que o app faz hoje |
|---|---|---|
| Painel dos responsáveis com login próprio | Não há autenticação, vínculo nem rotas para responsáveis | O painel abre a partir do perfil do aluno e mostra só dados reais (missões concluídas e atividades recentes). |
| Meta semanal | Não existe | Não é exibida. No lugar, aparece "Missões da turma" (dado real). |
| Desempenho por habilidade ("Sons iniciais", "Rimas e sons") | `/api/desempenho/*` é exclusivo do professor | Aviso de indisponível. |
| Nível e título ("Nível 5 • Explorador da Selva") | Não existe | Não é exibido. Mostra turma e RA. |
| Pontos por missão na Home (+50, +120) | O mapa não traz recompensa | A Home mostra a situação da missão (Concluída, Disponível, Bloqueada) e o botão JOGAR. |
| Áudio gravado da história e "Tocar som" | Não há arquivos de áudio na API | Leitura em voz alta pela **Web Speech API do navegador** (recurso real, sem gravação). Sem suporte, aparece a orientação de pedir a um adulto. |
| Gravação/reconhecimento de voz ("Fale a palavra") | A API não recebe áudio | **Não grava a voz.** A criança fala em voz alta e toca em "Falei a palavra". A tela informa que o Zooly não grava a voz. |
| Tipos de questão "Escute", "Complete a palavra" e "Fale" | A API só tem `multipla_escolha` | As 4 fases do Figma ficam em `/atividade/1-4` (aventura ilustrada). As missões reais (`/missao/[id]`) usam história + múltipla escolha. |
| Imagem por avatar | `imagem: null` no catálogo | Arte local de `public/images/mascotes`. |

## Introdução guiada e missão de treino (`/introducao` e `/atividade/[fase]`)

Fluxo depois do cadastro (ou ao tocar em "Aprenda a jogar" na Home):

1. `/introducao`: boas-vindas → mascotes → proposta → **como usar o mapa** (legenda: disponível, trancada, feita) → **como funcionam as missões** (história, perguntas, moedas).
2. A criança escolhe **"Treinar uma missão"** (`/atividade/1-4`) ou **"Pular o treino e ver minhas missões"**.
3. O treino termina em "Ver minhas missões", que leva ao mapa com as missões publicadas pelo professor.

A missão de treino ("O Rio que Contava Histórias", 4 fases do Figma) é conteúdo **fixo no front-end** e **não é missão oficial**, em nenhum modo:

- não chama a API: nenhum `iniciar`, `respostas` ou `concluir` (verificado nos testes pela ausência de requisições de escrita e pela consulta à API depois do treino);
- não concede moedas, não registra progresso e não abre tentativa;
- fica fora da lista "Suas missões", em um cartão próprio com o aviso "O treino não vale moedas";
- mostra o selo "Missão de treino · não vale moedas" e o botão "Sair do treino".

O único estado guardado é a marca local `zooly_intro_pendente`, que já existia e só decide se a introdução abre automaticamente. **Nenhuma mudança na API foi necessária.**


**Para o futuro (depende do back-end):** registrar no servidor que o aluno já fez o treino (ex.: `PATCH /api/alunos/me/introducao`) permitiria abrir a introdução só uma vez por aluno, em qualquer aparelho. Hoje a marca é por navegador.

## Tentativas das missões

A API registra cada vez que a criança joga uma missão (`TentativaAtividade`). A 1ª conclusão é a **oficial**: só ela dá moedas e vale para o desempenho que a professora vê. O jogo (`pages/missao/[id].js` e `utils/tentativas.js`) apenas apresenta essas regras:

| Situação (resposta de `iniciar`) | O que a criança vê |
|---|---|
| 1ª tentativa (`numeroTentativa: 1`) | A missão normal, com "Esta missão vale N moedas". |
| Repetição (`numeroTentativa > 1`) | Aviso **"Vamos tentar novamente!"** com a vez ("2ª vez") e "Sua primeira vez continua valendo". A recompensa não é prometida. |
| Retomada (`tentativaRetomada: true` com respostas salvas) | Aviso **"Que bom que você voltou!"**. A missão abre na primeira pergunta sem resposta, com as respostas anteriores já marcadas. |

- **Salvar e retomar:** a cada "Confirmar", o jogo envia `PUT .../respostas` com todas as respostas dadas até ali. Os envios ficam numa fila, e o envio final espera por eles, para uma resposta antiga nunca chegar depois da última. Se um envio parcial falhar por rede, nada se perde, porque todas as respostas vão de novo no fim. Abrir a missão de novo nunca cria outra tentativa enquanto houver uma em andamento (regra da API).
- **Tela final:** as moedas vêm de `movimentacao.quantidade`. Numa repetição, aparece "Você terminou a 2ª vez!". Quando há mais de uma vez, `GET .../tentativas` mostra "Suas vezes nesta missão", com a oficial marcada com ⭐. O histórico só traz número, status e datas, **nunca** gabarito nem correção.
- **Recompensa única e progresso oficial:** garantidos pela API (transação e índices únicos). Os testes `4-tentativas.spec.mjs` confirmam que o saldo e as respostas oficiais não mudam ao repetir.

## Necessidades no back-end (levantadas na auditoria de 03/11/2026)

O jogo **não simula** nenhum dos itens abaixo. Cada um depende de uma alteração no Zooly-api.

| # | Necessidade | O que falta na API | Comportamento esperado |
|---|---|---|---|
| 1 | Feedback "certo/errado" nas missões reais | `PUT /api/progresso/atividades/:id/respostas` não devolve correção | Devolver, após registrar as respostas, `[{ questaoId, correta }]` (sem expor o gabarito antes da resposta). O jogo já tem `FeedbackMascote` para exibir. |
| 2 | ~~Histórico de tentativas ("jogar de novo")~~ | **Implementado no Zooly-api** e integrado ao jogo (ver "Tentativas das missões") | — |
| 3 | Recompensa visível na Home e no mapa | `GET /api/progresso/turma/:turmaId/mapa` não traz `recompensaMoedas` | Incluir `recompensaMoedas` em cada item do mapa. Hoje o valor só aparece dentro da missão (vem do conteúdo). |
| 4 | Cidade da missão | A atividade não tem cidade | Campo opcional `cidade` (ex.: `registro`) para não depender da ordem. |
| 5 | Extrato legível | O motivo da compra é gravado como `Compra de avatar: avatar-03` | Gravar o nome do avatar ou devolver `avatarId` em campo separado. O jogo converte o id no nome do mascote (`utils/moedas.js`). |
| 6 | Arte dos avatares | Catálogo com `imagem: null`; `avatar-05`/`avatar-06` sem arte | Preencher `imagem` (ou acordar novos mascotes) para sair do "Em breve". |
| 7 | Responsáveis | Sem autenticação, vínculo ou rotas para responsáveis | Login do responsável, vínculo com aluno(s) e leitura do progresso e do desempenho por habilidade. |
| 8 | Metas semanais, níveis e conquistas | Não existem | Modelos e endpoints próprios (meta por turma/aluno, cálculo de nível, medalhas). |
| 9 | Novos tipos de questão (escutar, completar palavra, falar) | Só `multipla_escolha`; as `etapasMissao` já preveem `completar_palavras`, `escutar_escrever`, `identificar_sons` | Tipos de questão com conteúdo e validação próprios (ex.: áudio de referência). |
| 10 | Gravação e reconhecimento de voz | A API não recebe áudio | Endpoint de envio de áudio com consentimento dos responsáveis, retenção definida e conformidade com a LGPD para dados de crianças. |
