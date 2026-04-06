"use client";

interface TerritorioCardProps {
  numero: number;
  titulo: string;
  subtitulo: string;
  descricao?: string;
  estado?: "disponivel" | "em-breve" | "trancado";
  onClick?: () => void;
}

const TERRITORIO_CORES: Record<number, { cor: string; nome: string }> = {
  1: { cor: "var(--color-territorio-1)", nome: "A Casa dos Espelhos Dourados" },
  2: { cor: "var(--color-territorio-2)", nome: "A Arvore das Raizes Visiveis" },
  3: { cor: "var(--color-territorio-3)", nome: "A Ponte entre Duas Margens" },
  4: { cor: "var(--color-territorio-4-brasa)", nome: "O Campo Queimado" },
  5: { cor: "var(--color-territorio-5)", nome: "A Encruzilhada Infinita" },
  6: { cor: "var(--color-territorio-6)", nome: "O Corpo-Paisagem" },
  7: { cor: "var(--color-territorio-7)", nome: "A Muralha que Nasce do Chao" },
  8: { cor: "var(--color-territorio-8-bio)", nome: "O Jardim Subterraneo" },
  9: { cor: "var(--color-territorio-9)", nome: "O Caminho de Pedras" },
  10: { cor: "var(--color-territorio-10)", nome: "A Sala do Eco" },
};

export default function TerritorioCard({
  numero,
  titulo,
  subtitulo,
  descricao,
  estado = "disponivel",
  onClick,
}: TerritorioCardProps) {
  const territorio = TERRITORIO_CORES[numero];
  const isDisponivel = estado === "disponivel";

  return (
    <button
      onClick={isDisponivel ? onClick : undefined}
      disabled={!isDisponivel}
      className={`
        mundo-card w-full text-left p-6 transition-all duration-500
        ${isDisponivel ? "cursor-pointer hover:scale-[1.02]" : "opacity-50 cursor-default"}
      `}
      style={{
        borderColor: isDisponivel ? `color-mix(in srgb, ${territorio?.cor} 30%, transparent)` : undefined,
        boxShadow: isDisponivel ? `0 0 24px color-mix(in srgb, ${territorio?.cor} 12%, transparent)` : undefined,
      }}
    >
      {/* Territorio badge + number */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: territorio?.cor }}
        />
        <span
          className="mundo-subheading text-xs"
          style={{ color: territorio?.cor }}
        >
          Territorio {numero}
        </span>
        {estado === "em-breve" && (
          <span className="text-xs uppercase tracking-widest" style={{ color: "var(--color-mundo-dourado)", opacity: 0.5 }}>
            Em breve
          </span>
        )}
      </div>

      {/* Course title */}
      <h3
        className="mundo-heading text-xl md:text-2xl mb-1"
        style={{ fontWeight: 400 }}
      >
        {titulo}
      </h3>

      {/* Subtitle */}
      <p
        className="text-sm mb-3"
        style={{ color: "var(--color-mundo-creme-suave)", opacity: 0.7 }}
      >
        {subtitulo}
      </p>

      {/* Territory name */}
      {territorio && (
        <p
          className="text-xs italic"
          style={{ color: territorio.cor, opacity: 0.6 }}
        >
          {territorio.nome}
        </p>
      )}

      {/* Description */}
      {descricao && (
        <p className="mundo-body text-sm mt-3 line-clamp-3">
          {descricao}
        </p>
      )}

      {/* Bottom accent line */}
      {isDisponivel && (
        <div
          className="mt-5 h-px w-full"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${territorio?.cor} 50%, transparent 100%)`,
            opacity: 0.2,
          }}
        />
      )}
    </button>
  );
}
