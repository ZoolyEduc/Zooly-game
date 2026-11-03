# Zooly Game — Mobile Web

<p align="center">
  <strong>Zooly — com a Turma Animal</strong>
</p>

<p align="center">
  Jogo educativo de leitura desenvolvido para crianças de 4 a 8 anos, ambientado no Vale do Ribeira.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Status-Em%20desenvolvimento-blue" alt="Status" />
</p>

## Sobre o projeto

O Zooly Game é uma aplicação Mobile Web desenvolvida para auxiliar crianças no desenvolvimento da leitura por meio de uma experiência lúdica e interativa.

Ambientado no Vale do Ribeira, o jogo utiliza histórias, personagens, missões e recompensas para tornar o aprendizado mais envolvente.

A aplicação permite que os alunos acessem atividades disponibilizadas pelos professores, acompanhem seu progresso, acumulem moedas e personalizem seus avatares.

O projeto faz parte do ecossistema Zooly, composto por três aplicações independentes.

## Aplicações e links oficiais

| Aplicação | Descrição | Endereço |
|---|---|---|
| Zooly Game | Jogo educativo para os alunos. | https://zooly-game.vercel.app |
| Zooly Web | Painel de gerenciamento para professores. | https://zooly-web.vercel.app |
| Zooly API | Backend e gerenciamento dos dados. | https://zooly-api.onrender.com |

## Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| Next.js 16 | Framework utilizado na aplicação web. |
| React 18 | Construção das interfaces e componentes. |
| JavaScript | Linguagem principal do projeto. |
| Axios | Comunicação com a API. |
| CSS | Estilização e responsividade das telas. |
| Playwright | Testes automatizados de ponta a ponta. |
| Node.js | Ambiente de execução do projeto. |

A aplicação utiliza o Pages Router do Next.js e se comunica com a Zooly API, desenvolvida com Node.js, Express e MongoDB.

## Funcionalidades

- Login de alunos por RA e senha de acesso da turma.
- Primeiro acesso com cadastro de dados do aluno.
- Cadastro inicial de alunos.
- Introdução guiada ao jogo.
- Mapa interativo com cidades e mascotes.
- Missões educativas disponibilizadas pelos professores.
- Histórias e perguntas interativas.
- Sistema de progresso das atividades.
- Histórico de tentativas das missões.
- Sistema de moedas e recompensas.
- Loja de avatares.
- Personalização do avatar.
- Configurações de perfil.
- Leitura em voz alta utilizando o navegador.
- Área de supervisão dos responsáveis, parcialmente implementada.

## Arquitetura e integração

O Zooly Game é um projeto independente do painel administrativo e da API.

A comunicação com o backend acontece por meio de requisições HTTP utilizando Axios.

```text
Zooly Game (Next.js + React)
          |
          | Requisições HTTP / JSON
          v
       Zooly API
   (Node.js + Express)
          |
          v
      MongoDB Atlas
```

A API é responsável pela autenticação, validação dos dados, regras de negócio, progresso, moedas e gerenciamento das atividades.

O Game é responsável pela apresentação das informações e pela interação da criança com as atividades.

## Configuração do projeto

### Pré-requisitos

- Node.js 20.9 ou superior.
- npm.
- Acesso à Zooly API.

### Instalação

Clone o repositório:

```bash
git clone https://github.com/ZoolyEduc/Zooly-game.git
```

Entre na pasta:

```bash
cd Zooly-game
```

Instale as dependências:

```bash
npm install
```

### Variáveis de ambiente

O projeto utiliza a variável `NEXT_PUBLIC_API_URL` para definir o endereço da API.

Crie um arquivo `.env.local` na raiz do projeto.

Exemplo:

```env
NEXT_PUBLIC_API_URL=https://zooly-api.onrender.com
```

Para desenvolvimento local, caso esteja utilizando uma API executando na porta 3000:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

A variável possui como padrão o endereço da API publicada:

`https://zooly-api.onrender.com`

**Importante:** a API controla as origens permitidas por meio da variável `CORS_ORIGINS`. Para utilizar uma API publicada a partir do ambiente local, a origem local precisa estar autorizada no backend.

### Executando a aplicação

Para iniciar o ambiente de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em:

`http://localhost:3001`

Para gerar a versão de produção:

```bash
npm run build
```

Para iniciar a aplicação em produção:

```bash
npm start
```

Para verificar problemas de código:

```bash
npm run lint
```

## Fluxo de acesso dos alunos

O acesso ao jogo possui etapas específicas para garantir que o aluno seja identificado e vinculado corretamente à sua turma.

### 1. Tela inicial

A aplicação apresenta a tela de abertura e direciona o aluno para o login.

### 2. Primeiro acesso

O aluno que ainda não possui cadastro pode selecionar a opção **Primeiro acesso? Cadastre-se**.

O cadastro solicita:

- Nome;
- RA;
- Sexo;
- Código da turma.

A aplicação envia os dados para:

```http
POST /api/auth/aluno/cadastro
```

A API verifica se a turma existe, se não está arquivada e se possui uma senha de acesso configurada pela professora.

Após o cadastro, o aluno retorna à tela de login com o RA preenchido e uma mensagem de confirmação.

O cadastro inicial não solicita uma senha individual. O aluno utiliza a senha de acesso da turma para entrar no jogo.

### 3. Cadastro pendente

Quando o aluno já foi cadastrado pela professora, mas ainda precisa completar seus dados, o fluxo é diferente.

Ele realiza o login com RA e senha da turma e é direcionado para a tela de cadastro inicial.

Nesse caso, o RA fica bloqueado para edição e o jogo utiliza:

```http
PATCH /api/alunos/cadastro-inicial
```

### 4. Introdução guiada

Após a conclusão do cadastro, o aluno passa por uma introdução guiada composta por cinco etapas:

1. Boas-vindas;
2. Apresentação dos mascotes;
3. Apresentação da proposta do jogo;
4. Como utilizar o mapa;
5. Como funcionam as missões.

Ao finalizar, a criança pode realizar uma missão de treino ou seguir diretamente para as missões disponibilizadas pela professora.

A introdução e o treino podem ser acessados novamente pelo cartão **Aprenda a jogar** na Home.

## Proteção de rotas e sessão

O componente `components/layout/GuardaSessao.js` controla o acesso às rotas do jogo.

As principais regras são:

- Sem sessão: direciona para `/login`.
- Cadastro pendente: direciona para `/cadastro`.
- Introdução pendente: direciona para `/introducao`.
- Token expirado ou recusado pela API: limpa a sessão e retorna para o login.

O token JWT é armazenado no `localStorage`.

A aplicação verifica a validade do token para melhorar a experiência de navegação, mas a validação de autenticação é responsabilidade da API.

## Missões e tentativas

Cada missão realizada pelo aluno é registrada pela Zooly API.

O jogo apresenta as informações de acordo com as respostas recebidas do backend.

### Primeira tentativa

- A missão é iniciada normalmente.
- O jogo apresenta a recompensa disponível.
- Ao concluir, são exibidas as moedas concedidas pela API.
- Essa é a tentativa oficial, utilizada para o desempenho do aluno.

### Repetição de uma missão

Quando o aluno realiza novamente uma missão:

- O jogo informa que se trata de uma nova tentativa.
- A tentativa anterior continua sendo a oficial.
- Não são concedidas novas moedas.
- O histórico apresenta as tentativas realizadas.

### Retomada de atividade

Se a criança sair durante uma missão e retornar posteriormente:

- A API retoma a tentativa que estava em andamento.
- As respostas já confirmadas são preservadas.
- O jogo apresenta uma mensagem de retorno.
- A criança continua a partir da primeira pergunta ainda não respondida.

O histórico disponibilizado ao aluno apresenta números e datas das tentativas, sem revelar o gabarito.

A documentação complementar está em [docs/INTEGRACAO-API.md](docs/INTEGRACAO-API.md#tentativas-das-missões).

## Rotas da aplicação

| Rota | Tela | Integração |
|---|---|---|
| `/` | Splash | — |
| `/login` | Login do aluno | API |
| `/cadastro` | Primeiro acesso e cadastro inicial | API |
| `/introducao` | Introdução guiada | — |
| `/aventura` | Página inicial do jogo | API |
| `/mapa` | Mapa interativo | API |
| `/missao/[id]` | Missão publicada pela professora | API |
| `/atividade/1` até `/atividade/4` | Missão de treino | Local |
| `/loja` | Loja de avatares e moedas | API |
| `/avatar` | Personalização do avatar | API |
| `/configuracoes` | Perfil e configurações | API |
| `/painel-pais` | Supervisão dos responsáveis | Parcial |

A missão de treino é uma experiência guiada e não representa uma atividade oficial da professora. Ela não chama a API, não registra progresso ou tentativa e não concede moedas.

## Estrutura do projeto

```text
pages/
  Rotas da aplicação (Pages Router)

components/
  layout/
  marca/
  ui/
  jogo/
  mapa/
  loja/
  atividade/

contexts/
  AlunoContext.js

hooks/
  useCarregamento
  useMissoes
  useAvatares
  useLeitorVoz

services/
  api.js
  erros.js
  sessao.js
  auth.js
  jogo.js

config/
  Imagens, mascotes, mapa e rotas

utils/
  Situação das missões, tentativas e funções auxiliares

styles/
  base/
  componentes/
  telas/

public/
  images/

referencias-figma/
  Telas de referência do Figma

docs/
  INTEGRACAO-API.md
  IMAGENS.md

tests/
  e2e/
  unit/
```

### Organização dos principais diretórios

- **pages:** páginas e rotas da aplicação.
- **components:** componentes reutilizáveis da interface.
- **contexts:** gerenciamento de informações compartilhadas entre telas.
- **hooks:** funções reutilizáveis para carregamento, missões e leitura.
- **services:** comunicação com a API e gerenciamento de sessão.
- **config:** configurações de imagens, mascotes, mapa e rotas.
- **utils:** funções auxiliares e regras de apresentação.
- **styles:** estilos globais, componentes e telas.
- **public/images:** imagens, personagens, cenários e elementos visuais.
- **referencias-figma:** referências visuais utilizadas no desenvolvimento.
- **docs:** documentação técnica e integração.
- **tests:** testes automatizados.

## Testes automatizados

O projeto utiliza Playwright para executar testes de ponta a ponta e verificar o comportamento da aplicação integrada à API.

Os testes ficam em `tests/e2e`.

| Arquivo | Cobertura |
|---|---|
| `1-jogo-real.spec.mjs` | Login, primeiro acesso, cadastro pendente, rotas, sessão, mapa, missões, moedas, loja, avatar, configurações, painel, introdução e treino. |
| `2-sem-demo-e-treino.spec.mjs` | Verificação da ausência do modo de demonstração e funcionamento do treino. |
| `3-responsividade.spec.mjs` | Responsividade, imagens, rolagem horizontal e erros de console. |
| `4-tentativas.spec.mjs` | Tentativas oficiais, repetição, retomada, recompensas e histórico. |

Os testes utilizam a Zooly API real, executada localmente com um MongoDB em memória. Dessa forma, não dependem do banco de dados de produção ou do MongoDB Atlas.

### Preparação dos testes

1. Clone o repositório `Zooly-api` ao lado deste projeto, na pasta `../Zooly-api`.
2. Execute `npm install` dentro do repositório da API.
3. Execute `npm install` neste projeto.
4. Instale o navegador utilizado pelo Playwright:

```bash
npx playwright install chromium
```

Na primeira execução, o MongoDB em memória pode baixar seu binário automaticamente.

Caso a API esteja em outro diretório, configure a variável `ZOOLY_API_DIR`.

### Executando os testes

Suíte completa:

```bash
npm run test:e2e
```

Executar cenários específicos:

```bash
npm run test:e2e -- --grep "Loja"
```

Abrir a interface interativa:

```bash
npm run test:e2e:ui
```

Abrir o relatório HTML:

```bash
npm run test:e2e:relatorio
```

### Ambiente de testes

O Playwright inicia automaticamente dois servidores:

| Servidor | Porta |
|---|---|
| API de teste | 4100 |
| Aplicação Next.js | 3005 |

A API é iniciada pelo arquivo `tests/e2e/servidor/api-local.mjs`, utilizando um MongoDB em memória.

As portas podem ser alteradas pelas variáveis `E2E_PORTA_API` e `E2E_PORTA_JOGO`.

Cada execução começa com um banco novo. Os cenários que dependem do estado da aplicação são executados em sequência.

### Testes unitários

Os testes unitários das regras de tentativas podem ser executados com:

```bash
npm test
```

Eles ficam organizados em `tests/unit`.

## Documentação complementar

O projeto possui documentação adicional:

| Documento | Descrição |
|---|---|
| [docs/INTEGRACAO-API.md](docs/INTEGRACAO-API.md) | Endpoints utilizados, integração com o backend e decisões de apresentação. |
| [docs/PROPOSTA-HISTORICO-TENTATIVAS.md](docs/PROPOSTA-HISTORICO-TENTATIVAS.md) | Proposta relacionada ao histórico de tentativas das missões. |
| [docs/IMAGENS.md](docs/IMAGENS.md) | Organização das imagens e nomes originais. |
| [referencias-figma/INDEX.md](referencias-figma/INDEX.md) | Relação entre as referências do Figma e as telas implementadas. |

## Limitações conhecidas

Algumas funcionalidades ainda dependem da implementação de novos endpoints ou recursos no backend:

- **Painel dos responsáveis:** implementação parcial.
- **Meta semanal:** ainda não possui endpoint disponível.
- **Nível do aluno:** ainda não possui endpoint disponível.
- **Desempenho por habilidade:** ainda não possui endpoint disponível.
- **Leitura em voz alta:** utiliza o recurso de síntese de voz do navegador. O aplicativo não grava a voz da criança.
- **Avatares:** `avatar-05` e `avatar-06` aparecem como "Em breve", pois ainda não possuem arte disponível.

Quando uma informação não está disponível na API, o jogo apresenta o recurso como indisponível, sem utilizar dados fictícios.

## Dados reais e modo de demonstração

O Zooly Game funciona exclusivamente com a Zooly API.

O antigo modo de demonstração foi removido, incluindo:

- Botão de entrada em modo de demonstração;
- Dados fictícios;
- Selo de demonstração;
- Guia `README-MODO-DEMO.md`.

Chaves antigas relacionadas ao modo de demonstração são removidas ao abrir o jogo. Elas não ativam dados fictícios.

Quando a API apresenta uma falha, as telas exibem mensagens amigáveis e a opção de tentar novamente.

A missão de treino continua disponível, pois faz parte da introdução guiada e não utiliza dados fictícios.

## Deploy

O Zooly Game está publicado na Vercel.

**Aplicação em produção:** https://zooly-game.vercel.app

A aplicação utiliza a variável `NEXT_PUBLIC_API_URL` para se comunicar com a API publicada no Render.
## Acesso para avaliação

O Zooly Game está disponível para avaliação por meio do ambiente publicado.

**Endereço:** https://zooly-game.vercel.app

### Conta de aluno para testes

Uma conta de aluno exclusiva para avaliação será disponibilizada para que professores e avaliadores possam explorar as funcionalidades do jogo.

| Campo | Informação |
|---|---|
| RA do aluno | 112750450sp |
| Senha de acesso da turma | 12345 |
| Código da turma | TUR-6E2772697D59 |

**Funcionalidades disponíveis para avaliação:**
- Acesso ao jogo.
- Introdução guiada.
- Mapa interativo.
- Missões educativas.
- Histórias e perguntas.
- Sistema de moedas e recompensas.
- Loja e personalização de avatares.
- Acompanhamento do progresso.

> As credenciais serão disponibilizadas após a criação e validação dos dados de teste. Utilize exclusivamente a conta de avaliação fornecida.

## Status do projeto

O Zooly é um projeto acadêmico desenvolvido no curso de **Desenvolvimento de Software Multiplataforma (DSM)** da **FATEC Registro**.

**Equipe:** KofiTech.

O projeto está em desenvolvimento contínuo, com melhorias na experiência dos alunos, integração com o backend, testes automatizados e evolução das funcionalidades educativas.

---

<p align="center">
  Desenvolvido pela equipe KofiTech.
</p>
