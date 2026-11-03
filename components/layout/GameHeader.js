import Image from "next/image";
import { useAluno } from "../../contexts/AlunoContext";
import { nomeCurto } from "../../utils/texto";
import SaldoMoedas from "../ui/MoedaBanana";

export default function GameHeader() {
  const { aluno, saldo, mascote, carregando } = useAluno();
  const nome = nomeCurto(aluno?.nomeCompleto) || "Aventureiro";

  return (
    <>
      <header className="game-header">
        <span className="game-header__avatar">
          <Image
            src={mascote.imagem}
            alt={`Avatar: ${mascote.nome}`}
            width={42}
            height={42}
          />
        </span>
        <strong className="game-header__nome">{nome}</strong>
        <SaldoMoedas saldo={saldo} carregando={carregando && saldo === null} />
      </header>
    </>
  );
}
