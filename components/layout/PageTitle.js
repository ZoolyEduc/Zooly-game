import { useRouter } from 'next/router';
import { FiArrowLeft } from 'react-icons/fi';

export default function PageTitle({ children, voltarPara }) {
  const router = useRouter();
  const voltar = () => (voltarPara ? router.push(voltarPara) : router.back());
  return (
    <div className="page-title">
      <button type="button" onClick={voltar} aria-label="Voltar">
        <FiArrowLeft />
      </button>
      <h1>{children}</h1>
    </div>
  );
}
