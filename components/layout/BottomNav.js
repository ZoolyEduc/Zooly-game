import Link from "next/link";
import { FiCompass, FiHome, FiSettings, FiShoppingBag } from "react-icons/fi";
import { ROTAS } from "../../config/rotas";

const ITENS = [
  { id: "inicio", rotulo: "INÍCIO", rota: ROTAS.inicio, Icone: FiHome },
  { id: "mapa", rotulo: "MAPA", rota: ROTAS.mapa, Icone: FiCompass },
  { id: "loja", rotulo: "LOJA", rota: ROTAS.loja, Icone: FiShoppingBag },
  {
    id: "config",
    rotulo: "CONFIG",
    rota: ROTAS.configuracoes,
    Icone: FiSettings,
  },
];

export default function BottomNav({ ativo }) {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {ITENS.map(({ id, rotulo, rota, Icone }) => (
        <Link
          key={id}
          href={rota}
          className={ativo === id ? "ativo" : ""}
          aria-current={ativo === id ? "page" : undefined}
        >
          <Icone aria-hidden="true" />
          <span>{rotulo}</span>
        </Link>
      ))}
    </nav>
  );
}
