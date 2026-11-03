import Image from 'next/image';

export default function RetratoMascote({ mascote, tamanho = 120, bloqueado = false }) {
  return (
    <span
      className={`retrato-mascote ${bloqueado ? 'retrato-mascote--bloqueado' : ''}`}
      style={{ '--cor-moldura': mascote?.cor || '#c9c2b8', '--sombra-moldura': mascote?.sombra || '#a39b90', width: tamanho, height: tamanho }}
    >
      {mascote ? (
        <Image src={mascote.imagem} alt="" width={tamanho} height={tamanho} />
      ) : (
        <span className="retrato-mascote__vazio" aria-hidden="true">?</span>
      )}
    </span>
  );
}
