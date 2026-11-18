import { useEffect } from "react";
import { useLoja } from "../context/store.jsx";
import { Icon, Imagem, Selo, brl, desconto } from "./ui.jsx";

export default function ProdutoModal({ produto, onFechar }) {
  const { favoritos, alternarFavorito, noCarrinho, adicionar, setCarrinhoAberto } = useLoja();
  const fav = favoritos.includes(produto.id);
  const dentro = noCarrinho(produto.id);
  const off = desconto(produto);

  useEffect(() => {
    const aoTeclar = (e) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", aoTeclar);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = anterior;
    };
  }, [onFechar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-6"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-label={produto.nome}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fr-sobe grid max-h-[92vh] w-full max-w-3xl overflow-auto rounded-t-3xl bg-[#fdf3e4] sm:grid-cols-2 sm:rounded-3xl"
      >
        <div className="aspect-square sm:aspect-auto sm:min-h-[440px]">
          <Imagem produto={produto} />
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Selo className="bg-[#1d4e8f] text-white">peça única</Selo>
              <h2 className="fr-titulo mt-3 text-2xl font-bold leading-tight">{produto.nome}</h2>
            </div>
            <button
              onClick={onFechar}
              aria-label="Fechar"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white shadow hover:bg-[#f3dfc1]"
            >
              <Icon nome="close" className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-bold text-[#c0392b]">{brl(produto.preco)}</p>
            {off > 0 && (
              <>
                <p className="text-sm text-[#8a7a68] line-through">{brl(produto.precoAntigo)}</p>
                <Selo className="bg-[#c0392b] text-white">-{off}%</Selo>
              </>
            )}
          </div>

          <p className="text-sm leading-relaxed text-[#5a4a3a]">
            {produto.descricao || "Peça feita à mão, única, em Salvador."}
          </p>

          {produto.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {produto.tags.map((t) => (
                <span key={t} className="rounded-full bg-white px-3 py-1 text-xs text-[#5a4a3a]">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-[#8a7a68]">
            Só existe uma. Quando for para o carrinho, finalize a compra para garantir.
          </p>

          <div className="mt-auto flex gap-3">
            {dentro ? (
              <button
                onClick={() => {
                  onFechar();
                  setCarrinhoAberto(true);
                }}
                className="flex-1 rounded-xl bg-[#2e7d5b] py-3 font-semibold text-white transition hover:brightness-110"
              >
                ✓ no carrinho · ver carrinho
              </button>
            ) : (
              <button
                onClick={() => adicionar(produto)}
                className="flex-1 rounded-xl bg-[#2a1d10] py-3 font-semibold text-white transition hover:bg-[#c0392b]"
              >
                adicionar ao carrinho
              </button>
            )}
            <button
              onClick={() => alternarFavorito(produto.id)}
              aria-label={fav ? "Remover dos favoritos" : "Favoritar"}
              aria-pressed={fav}
              className="grid w-12 place-items-center rounded-xl bg-white text-[#c0392b] shadow transition hover:scale-105"
            >
              <Icon nome="heart" cheio={fav} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
