# Imagens do Zooly Mobile Web

Imagens em `public/images/`. Todos os caminhos são centralizados em `config/imagens.js`. Nenhuma imagem original foi apagada: os arquivos foram apenas renomeados e organizados.

| Pasta | Arquivo atual | Nome original | Uso |
|---|---|---|---|
| `marca/` | `logo-zooly-turma-animal.png` | `logo-turma.png` | Logo das telas de acesso |
| `marca/` | `logo-zooly-turma-animal-copia.png` | `mascotes-grupo.png` | Cópia idêntica da logo (preservada, sem uso) |
| `marca/` | `logo-zooly-education.png` | `logo.png` | Logo "Zooly Education" (preservada, sem uso no app do aluno) |
| `mascotes/` | `sarue.png`, `cobra.png`, `lagarto.png`, `papagaio.png` | mesmos nomes | Avatares, loja, introdução, mapa e feedbacks |
| `cenarios/` | `fundo-floresta.png` | `fundo-floresta.png` | Fundo das telas de acesso e ilustração da história |
| `mapas/` | `mapa-vale-do-ribeira.png` | `mapa.png` | Fundo da introdução |
| `mapas/` | `mapa-mobile.png` (493x740) | — | Mapa das missões no celular |
| `mapas/` | `mapa-tablet.png` (900x1351) | — | Mapa das missões no tablet (≥ 600px) |
| `moedas/` | `moeda-banana.png` | `Group (3).png` | Moeda do cabeçalho, da loja e das recompensas |
| `icones/` | `nav-inicio.png` | `Icon.png` | Referência do ícone da navegação (o app usa a versão vetorial equivalente) |
| `icones/` | `nav-mapa.png` | `Icon (1).png` | Idem |
| `icones/` | `nav-loja.png` | `Container.png` | Idem |
| `icones/` | `nav-config.png` | `Icon (2).png` | Idem |
| `icones/` | `atividade-quebra-cabeca.png` | `Icon (3).png` | Painel dos responsáveis |
| `icones/` | `atividade-livro.png` | `Icon (4).png` | Painel dos responsáveis |
| `icones/` | `atividade-musica.png` | `Icon (5).png` | Painel dos responsáveis |
| `interface/` | `grafico-desempenho.png` | `Icon (6).png` | Painel dos responsáveis |
| `interface/` | `seta-voltar.png` | `Icon (7).png` | Referência do botão voltar (o app usa a versão vetorial) |

A ilustração do rio da tela AtividadeFase01 não foi fornecida. O CSS antigo apontava para `Mapa Colorido do Vale Histórico 1.png`, arquivo que não existe. A tela agora usa o cenário de floresta. Para usar a arte do Figma, adicione o arquivo em `cenarios/` e troque o fundo de `.historia-arte` em `styles/telas/atividade.css`.
