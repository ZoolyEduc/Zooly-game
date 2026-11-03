import GameHeader from "./GameHeader";
import BottomNav from "./BottomNav";

export default function GameFrame({
  ativo,
  children,
  variante = "",
  semNavegacao = false,
}) {
  return (
    <div
      className={`game-frame ${variante ? `game-frame--${variante}` : ""} ${semNavegacao ? "game-frame--sem-nav" : ""}`}
    >
      <GameHeader />
      <main className="game-content">{children}</main>
      {!semNavegacao && <BottomNav ativo={ativo} />}
    </div>
  );
}
