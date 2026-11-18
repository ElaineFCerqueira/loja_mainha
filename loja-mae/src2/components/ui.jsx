import { useEffect, useState } from "react";

export const brl = (v) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ICONES = {
  bag: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z",
  truck:
    "M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4",
  refresh: "M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  close: "M18 6 6 18M6 6l12 12",
  arrow: "M5 12h14M12 5l7 7-7 7",
  check: "M20 6 9 17l-5-5",
  chevL: "m15 18-6-6 6-6",
  chevR: "m9 18 6-6-6-6",
  menu: "M3 12h18M3 6h18M3 18h18",
  trash:
    "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  card: "M2 5h20v14H2zM2 10h20",
  pix: "M12 2 22 12 12 22 2 12z",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  shirt: "M4 7l5-3c.5 1.5 1.5 2.5 3 2.5s2.5-1 3-2.5l5 3-2 4-2-1v10H8V10l-2 1z",
  basket: "M3 10h18l-2 10H5zM8 10l3-6M16 10l-3-6",
  star: "M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z",
  tag: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01",
  gift: "M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z",
};

export function Icon({ nome, className = "h-5 w-5", cheio = false, stroke = 2 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={cheio ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONES[nome]} />
    </svg>
  );
}

/* Imagem da peça. Sem foto, mostra um retalho colorido com a inicial. */
export function Imagem({ produto, className = "" }) {
  const [falhou, setFalhou] = useState(false);
  useEffect(() => setFalhou(false), [produto.imagem]);

  if (produto.imagem && !falhou) {
    return (
      <img
        src={produto.imagem}
        alt={produto.nome}
        loading="lazy"
        onError={() => setFalhou(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  const cor = produto.cor || "#c0392b";
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `repeating-linear-gradient(135deg, ${cor}26 0 14px, ${cor}14 14px 28px), #fff7e8`,
      }}
    >
      <span
        className="fr-titulo text-6xl font-bold"
        style={{ color: cor, opacity: 0.75 }}
      >
        {produto.nome.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

/* Fitinha de categoria */
export function Fita({ cor, texto = "#fff", ativa, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={ativa}
      style={{
        background: cor,
        color: texto,
        transform: ativa ? "translateY(6px) scale(1.06)" : "none",
      }}
      className={`fr-fita px-5 pb-6 pt-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 ${
        ativa ? "" : "opacity-80 hover:opacity-100"
      }`}
    >
      {children}
    </button>
  );
}

export function Selo({ children, className = "" }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}

export function desconto(p) {
  return p.precoAntigo > p.preco
    ? Math.round((1 - p.preco / p.precoAntigo) * 100)
    : 0;
}
