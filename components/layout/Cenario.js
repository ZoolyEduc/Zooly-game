export default function Cenario({ children, classe = "" }) {
  return (
    <main className={`cenario ${classe}`}>
      <div className="cenario__conteudo">{children}</div>
    </main>
  );
}
