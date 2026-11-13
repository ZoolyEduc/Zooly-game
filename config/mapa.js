// Posições em % da arte do mapa (public/images/mapas/mapa-mobile.png 493x740 no celular e
// mapa-tablet.png 900x1351 no tablet: mesma composição, então as mesmas posições servem).
// - rotulo: centro da placa com o nome da cidade (área clicável);
// - ponto: centro do marcador redondo no caminho da cidade;
// - mascote: onde o papagaio pousa quando a cidade é a atual (pés do papagaio). Fica
//   ao lado do marcador, sem cobrir nenhuma placa (as placas ficam logo acima dos
//   marcadores) e fora da área do balão no tablet (metade direita da base do mapa).
// Medidas na arte atual: se a imagem mudar, estas posições precisam ser recalibradas.
export const CIDADES = [
  {
    id: "eldorado",
    nome: "Eldorado",
    rotulo: { x: 30.4, y: 13.9 },
    ponto: { x: 30.4, y: 19.1 },
    mascote: { x: 47, y: 32 },
  },
  {
    id: "sete-barras",
    nome: "Sete Barras",
    rotulo: { x: 77.8, y: 22 },
    ponto: { x: 78.2, y: 27.4 },
    mascote: { x: 76, y: 42 },
  },
  {
    id: "iporanga",
    nome: "Iporanga",
    rotulo: { x: 20.2, y: 39.1 },
    ponto: { x: 24.8, y: 49.2 },
    mascote: { x: 30, y: 60 },
  },
  {
    id: "registro",
    nome: "Registro",
    rotulo: { x: 62.6, y: 44.7 },
    ponto: { x: 58.8, y: 54.8 },
    mascote: { x: 50, y: 66 },
  },
  {
    id: "iguape",
    nome: "Iguape",
    rotulo: { x: 76.4, y: 63.7 },
    ponto: { x: 63.4, y: 74.2 },
    mascote: { x: 54, y: 80 },
  },
  {
    id: "cananeia",
    nome: "Cananéia",
    rotulo: { x: 32.8, y: 80.7 },
    ponto: { x: 40.9, y: 87 },
    mascote: { x: 7, y: 95.5 },
  },
];

// Posição do mascote antes da primeira missão: no mar, perto do barco.
export const POSICAO_INICIAL_MASCOTE = { x: 82, y: 86 };
