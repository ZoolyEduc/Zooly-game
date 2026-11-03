import { IMAGENS } from "./imagens";
const MASCOTES = {
  sarue: {
    id: "sarue",
    nome: "Saruê",
    imagem: IMAGENS.mascotes.sarue,
    cor: "#f4a093",
    sombra: "#d97a6c",
  },
  papagaio: {
    id: "papagaio",
    nome: "Papagaio",
    imagem: IMAGENS.mascotes.papagaio,
    cor: "#9b2fae",
    sombra: "#6d1f7c",
  },
  lagarto: {
    id: "lagarto",
    nome: "Lagarto",
    imagem: IMAGENS.mascotes.lagarto,
    cor: "#6b6200",
    sombra: "#4a4400",
  },
  cobra: {
    id: "cobra",
    nome: "Cobra",
    imagem: IMAGENS.mascotes.cobra,
    cor: "#7b3a10",
    sombra: "#562709",
  },
};

export const LISTA_MASCOTES = [
  MASCOTES.sarue,
  MASCOTES.papagaio,
  MASCOTES.lagarto,
  MASCOTES.cobra,
];

const MASCOTE_PADRAO = MASCOTES.lagarto;

const ARTE_POR_AVATAR = {
  "avatar-01": "sarue",
  "avatar-02": "papagaio",
  "avatar-03": "lagarto",
  "avatar-04": "cobra",
};

export function mascoteDoAvatar(avatarId) {
  const chave = ARTE_POR_AVATAR[avatarId];
  return chave ? MASCOTES[chave] : null;
}

export function mascoteDoAluno(aluno) {
  return (
    mascoteDoAvatar(aluno?.avatarSelecionado) ||
    MASCOTES[aluno?.turma?.mascote] ||
    MASCOTE_PADRAO
  );
}
