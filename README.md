# Zooly Mobile Web

Aplicativo web mobile do **Zooly — com a Turma Animal**, um jogo de leitura para crianças de 4 a 8 anos ambientado no Vale do Ribeira.

- Next.js 16 (Pages Router), React 18 e JavaScript (Node.js 20.9 ou superior)
- Axios para a [Zooly API](https://zooly-api.onrender.com) (Node.js + Express + MongoDB Atlas)
- Painel de professores e administração: [Zooly Web](https://zooly-web.vercel.app/) (projeto separado)

## Como rodar

```bash
npm install
cp .env.example .env.local   # opcional: por padrão usa https://zooly-api.onrender.com
npm run dev                  # http://localhost:3001
```

Outros comandos: `npm run lint` (ESLint 9, configurado em `eslint.config.mjs`), `npm run build`, `npm start` e `npm run test:e2e` (ver [Testes de ponta a ponta](#testes-de-ponta-a-ponta)).

### Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://zooly-api.onrender.com` | URL da Zooly API, sem barra no final |

A API só aceita origens listadas em `CORS_ORIGINS` (configurado no back-end). Para usar a API publicada a partir do `localhost`, a origem local precisa estar nessa lista. Se não estiver, use uma API local (por exemplo, a mesma usada pelos testes de ponta a ponta).

## Somente dados reais

O jogo funciona **somente com a Zooly API**: é preciso entrar com RA e senha (token JWT no `localStorage`). O antigo modo de demonstração foi removido, e com ele os dados fictícios, o botão "Entrar em modo demonstração", o selo e o guia `README-MODO-DEMO.md`. Se algum navegador ainda guardar as chaves antigas do demo (`zooly_modo_demo`, `zooly_demo_estado` ou o token `demo-local`), elas são apagadas ao abrir o jogo e nunca ativam dados fictícios.

Quando a API falha, cada tela mostra uma mensagem amigável com "Tentar de novo". Nenhuma resposta é trocada por dados inventados.

A **missão de treino** (`/atividade/1-4`) **não é demonstração**: faz parte da introdução guiada e continua disponível. Ela não chama a API, não cria progresso nem tentativa e não dá moedas.

## Tentativas das missões

As regras são da API (histórico de tentativas do Zooly-api). O jogo só mostra o que ela devolve:

- **1ª vez:** a missão abre normalmente, mostra quantas moedas vale e, ao concluir, mostra as moedas que a API concedeu. Essa é a tentativa **oficial**, a que vale para a professora.
- **Jogar de novo:** o aviso "**Vamos tentar novamente!**" mostra a vez (ex.: "2ª vez") e explica que a primeira continua valendo. A recompensa não é prometida e, no fim, aparece "Você terminou a 2ª vez!" com a lista "Suas vezes nesta missão" (a 1ª marcada com ⭐). Não há moedas novas.
- **Continuar de onde parou:** cada resposta confirmada é salva na tentativa em andamento. Se a criança sair e voltar, a API retoma a **mesma** tentativa, o jogo mostra "**Que bom que você voltou!**" e abre direto na primeira pergunta sem resposta. As respostas já dadas são preservadas.
- O histórico (`GET /api/progresso/atividades/:id/tentativas`) mostra só número, datas e qual vez é a oficial. **Nunca** mostra gabarito.

Detalhes em [docs/INTEGRACAO-API.md](docs/INTEGRACAO-API.md#tentativas-das-missões).

## Fluxo de acesso

1. `/` Splash → `/login`.
2. **Login** (`POST /api/auth/aluno/login`):
   - cadastro pendente → `/cadastro`;
   - introdução pendente → `/introducao`;
   - senão → `/aventura`.
3. **Primeiro acesso**: RA + senha da turma no login → "Primeiro acesso? Cadastre-se" → `/cadastro`. Ao salvar, chama `POST /api/auth/aluno/entrar-turma` e depois `PATCH /api/alunos/cadastro-inicial`. A senha fica só no `sessionStorage` da aba e é apagada após a entrada na turma. Se o segundo passo falhar, a nova tentativa envia apenas o cadastro.
4. **Introdução guiada** (5 etapas) é exibida uma vez após o cadastro: boas-vindas, mascotes, proposta, como usar o mapa e como funcionam as missões. No fim, a criança escolhe fazer a **missão de treino** (`/atividade/1-4`) ou pular direto para as missões do professor. O guia e o treino podem ser revistos pelo cartão "Aprenda a jogar" da Home.

### Proteção de rotas

`components/layout/GuardaSessao.js` protege todas as rotas do jogo:

- sem sessão → `/login`;
- sessão real com cadastro pendente → `/cadastro`;
- introdução pendente → `/introducao`;
- token vencido (campo `exp` do JWT, conferido antes de abrir o jogo) ou recusado pela API (401) → limpa a sessão e volta para `/login?sessao=expirada`. A leitura do `exp` é só para a experiência da criança: quem valida o token é a API.

## Rotas

| Rota | Tela | Dados (modo real) |
|---|---|---|
| `/` | Splash | — |
| `/login` | Login da criança | API |
| `/cadastro` | Primeiro acesso e cadastro inicial | API |
| `/introducao` | Introdução guiada (5 etapas) | — |
| `/aventura` | Home: saudação, saldo, missões e progresso | API |
| `/mapa` | Mapa com cidades, mascote, balões e modal de fase | API |
| `/missao/[id]` | Missão publicada pelo professor (história + perguntas) | API |
| `/atividade/1` a `/atividade/4` | Missão de treino (aventura ilustrada do Figma). Não é missão oficial: não chama a API nem dá moedas, em nenhum modo | — |
| `/loja` | Loja de avatares e extrato de moedas | API |
| `/avatar` | Alterar avatar | API |
| `/configuracoes` | Perfil, avatar, supervisão e sair | API |
| `/painel-pais` | Supervisão dos pais (parcial: ver limitações) | API (parcial) |

## Estrutura

```
pages/                 Rotas (Pages Router)
components/
  layout/              GameFrame, GameHeader, BottomNav, PageTitle, Cenario, GuardaSessao
  marca/               Marca (logo)
  ui/                  BarraProgresso, BotaoOuvir, Modal, MoedaBanana, RetratoMascote, Carregando, MensagemEstado
  jogo/                ItemMissao
  mapa/                MapaCena, BalaoMascote, ConteudoCidade
  loja/                CartaoAvatarLoja, ModalCompra
  atividade/           TelaAtividade, EtapaHistoria, PerguntaMissao, Alternativas, FeedbackMascote
contexts/AlunoContext.js  Perfil e saldo compartilhados
hooks/                 useCarregamento (carregando/erro/tentar de novo), useMissoes, useAvatares, useLeitorVoz
services/
  api.js               Axios, token e tratamento de sessão expirada (401)
  erros.js             Mensagens de erro amigáveis para a criança
  sessao.js            Chaves de armazenamento, validade do token e estado da sessão (limpa restos do antigo demo)
  auth.js              Login, entrada na turma e cadastro inicial
  jogo.js              Chamadas do jogo à API (perfil, moedas, missões, tentativas, loja)
config/                imagens, mascotes, mapa (cidades) e rotas
utils/                 Situação das missões, tentativas (retomada e avisos), rotas de missão, nomes e extrato
styles/
  base/                tokens.css, base.css
  componentes/         ui.css, layout-jogo.css
  telas/               um arquivo por área (importados no _app)
public/images/         marca, mascotes, cenarios, mapas, moedas, icones, interface
referencias-figma/     Telas de referência (originais) + INDEX.md
docs/                  INTEGRACAO-API.md e IMAGENS.md
```

## Testes de ponta a ponta

A suíte fica em `tests/e2e` e usa [Playwright](https://playwright.dev). Os cenários rodam contra a **Zooly API de verdade** (o código do repositório Zooly-api, sem alterações), servida localmente sobre um **MongoDB em memória** com dados de teste próprios. Nenhum banco do Atlas é usado.

| Arquivo | O que cobre | Tipo |
|---|---|---|
| `1-jogo-real.spec.mjs` | Login, primeiro acesso, cadastro pendente, rotas, sessão, mapa, missões, moedas, loja, avatar, configurações, painel, introdução guiada e treino | Integração real com a API |
| `2-sem-demo-e-treino.spec.mjs` | Ausência do modo demo (botão, selo, código e chaves antigas no navegador) e treino completo (fases 1–4) sem gravar nada | Integração real com a API |
| `3-responsividade.spec.mjs` | Rolagem horizontal de 320px a 1366px (inclui uma missão real e o treino), imagens e erros de console | Layout, com login real |
| `4-tentativas.spec.mjs` | 1ª tentativa oficial, "Vamos tentar novamente!", retomada de onde parou, recompensa única, histórico sem gabarito | Integração real com a API |

Cada spec usa um aluno próprio (`tests/e2e/dados.mjs`), para os cenários não dependerem uns dos outros.

Testes unitários (sem rede) das regras de tentativa: `npm test` (`tests/unit`).

### Preparar (uma vez)

1. Clone o **Zooly-api** ao lado deste repositório (`../Zooly-api`) e rode `npm install` nele. Para outro local, defina `ZOOLY_API_DIR`.
2. Neste repositório: `npm install` e `npx playwright install chromium`.
3. Na primeira execução, o `mongodb-memory-server` baixa o binário do MongoDB (~100 MB, fica em cache).

### Executar

```bash
npm run test:e2e              # suíte completa (sobe a API de teste e o jogo sozinho)
npm run test:e2e -- --grep "Loja"   # só os cenários que combinam com o nome
npm run test:e2e:ui           # modo interativo do Playwright
npm run test:e2e:relatorio    # abre o relatório HTML da última execução
```

O Playwright inicia dois servidores (`playwright.config.mjs`):

- `tests/e2e/servidor/api-local.mjs`: Zooly API real + MongoDB em memória, porta **4100**;
- `next dev` do jogo com `NEXT_PUBLIC_API_URL=http://localhost:4100`, porta **3005**.

As portas precisam estar livres (`E2E_PORTA_API` e `E2E_PORTA_JOGO` permitem trocá-las). Cada execução começa com um banco novo. Os cenários do modo real rodam **em sequência** e dependem do estado deixado pelo anterior.

O `next dev` cria um `AGENTS.md` na raiz. Ele está no `.gitignore`.

## Documentação

- [docs/INTEGRACAO-API.md](docs/INTEGRACAO-API.md): endpoints usados, decisões de apresentação e o que depende de endpoints inexistentes.
- [docs/PROPOSTA-HISTORICO-TENTATIVAS.md](docs/PROPOSTA-HISTORICO-TENTATIVAS.md): proposta para o Zooly-api guardar o histórico de tentativas de cada missão.
- [docs/IMAGENS.md](docs/IMAGENS.md): organização das imagens e nomes originais.
- [referencias-figma/INDEX.md](referencias-figma/INDEX.md): referência do Figma → tela.

## Limitações conhecidas

- O painel dos responsáveis, a meta semanal, o nível e o desempenho por habilidade ainda não têm endpoints. Aparecem como indisponíveis, sem dados inventados. Ver [docs/INTEGRACAO-API.md](docs/INTEGRACAO-API.md).
- O áudio usa a leitura em voz alta do navegador. O app **não grava** a voz da criança.
- `avatar-05` e `avatar-06` da API aparecem como "Em breve" porque não têm arte.
- Dependências: Next.js 16.4.4 e React 18.3.1 (a versão `peer` do Next 16 aceita React 18). O `package.json` usa `overrides` para forçar `minimatch@^11.0.4` nas ferramentas de lint (corrige o aviso GHSA-g3hv-75wg-m249). A regra `react-hooks/set-state-in-effect` (nova no React Compiler) está como aviso; ver `eslint.config.mjs`. As únicas exceções (carga de dados em `useCarregamento`/`AlunoContext` e leitura do `localStorage` em `GuardaSessao`/`cadastro`) estão marcadas com comentário.
