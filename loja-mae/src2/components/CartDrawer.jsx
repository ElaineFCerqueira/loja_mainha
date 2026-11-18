import { useEffect, useState } from "react";
import { useLoja } from "../context/store.jsx";
import { Icon, Imagem, brl } from "./ui.jsx";

export default function CartDrawer({ irPara }) {
  const {
    carrinho, carrinhoAberto, setCarrinhoAberto, remover,
    subtotal, valorDesconto, totalSemFrete, cupom, aplicarCupom, removerCupom,
  } = useLoja();
  const [texto, setTexto] = useState("");
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!carrinhoAberto) return;
    const aoTeclar = (e) => e.key === "Escape" && setCarrinhoAberto(false);
    document.addEventListener("keydown", aoTeclar);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = anterior;
    };
  }, [carrinhoAberto, setCarrinhoAberto]);

  if (!carrinhoAberto) return null;

  const fechar = () => setCarrinhoAberto(false);
  const aplicar = (e) => {
    e.preventDefault();
    const r = aplicarCupom(texto);
    setMsg(r.ok ? null : r.msg);
    if (r.ok) setTexto("");
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Carrinho">
      <div className="absolute inset-0 bg-black/45" onClick={fechar} />
      <aside className="fr-entra absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fdf3e4] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#e4cfae] px-5 py-4">
          <h2 className="fr-titulo text-xl font-bold">
            Seu carrinho <span className="text-[#8a7a68]">({carrinho.length})</span>
          </h2>
          <button onClick={fechar} aria-label="Fechar carrinho" className="grid h-9 w-9 place-items-center rounded-full bg-white shadow hover:bg-[#f3dfc1]">
            <Icon nome="close" className="h-4 w-4" />
          </button>
        </header>

        {carrinho.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-[#8a7a68] shadow-sm">
              <Icon nome="bag" className="h-7 w-7" />
            </span>
            <p className="fr-titulo text-lg font-bold">Seu carrinho está vazio</p>
            <p className="text-sm text-[#8a7a68]">Escolha uma peça única para levar para casa.</p>
            <button onClick={fechar} className="mt-2 rounded-full bg-[#2a1d10] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#c0392b]">
              ver as peças
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {carrinho.map((p) => (
                <li key={p.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Imagem produto={p} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.nome}</p>
                    <p className="text-xs capitalize text-[#8a7a68]">{p.categoria} · peça única</p>
                    <p className="mt-2 font-bold text-[#c0392b]">{brl(p.preco)}</p>
                  </div>
                  <button
                    onClick={() => remover(p.id)}
                    aria-label={`Remover ${p.nome}`}
                    className="self-start rounded-full p-2 text-[#8a7a68] transition hover:bg-[#fbe3df] hover:text-[#c0392b]"
                  >
                    <Icon nome="trash" className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="space-y-3 border-t border-[#e4cfae] bg-white/60 px-5 py-4">
              {cupom ? (
                <div className="flex items-center justify-between rounded-xl bg-[#e6f2ec] px-3 py-2 text-sm text-[#2e7d5b]">
                  <span>✓ cupom <b>{cupom.codigo}</b> aplicado</span>
                  <button onClick={removerCupom} className="underline">remover</button>
                </div>
              ) : (
                <form onSubmit={aplicar} className="flex gap-2">
                  <input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="cupom de desconto"
                    aria-label="Cupom de desconto"
                    className="min-w-0 flex-1 rounded-xl border border-[#e4cfae] bg-white px-3 py-2 text-sm uppercase outline-none focus:border-[#1d4e8f]"
                  />
                  <button className="rounded-xl bg-[#2a1d10] px-4 text-sm font-semibold text-white hover:bg-[#c0392b]">aplicar</button>
                </form>
              )}
              {msg && <p className="text-xs text-[#c0392b]">{msg}</p>}

              <dl className="space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-[#5a4a3a]">Subtotal</dt><dd>{brl(subtotal)}</dd></div>
                {valorDesconto > 0 && (
                  <div className="flex justify-between text-[#2e7d5b]"><dt>Desconto</dt><dd>-{brl(valorDesconto)}</dd></div>
                )}
                <div className="flex justify-between"><dt className="text-[#5a4a3a]">Frete</dt><dd className="text-[#8a7a68]">calculado no checkout</dd></div>
                <div className="flex justify-between border-t border-[#e4cfae] pt-2 text-lg font-bold">
                  <dt>Total</dt><dd>{brl(totalSemFrete)}</dd>
                </div>
              </dl>

              <button
                onClick={() => {
                  fechar();
                  irPara("/checkout");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#c0392b] py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110"
              >
                finalizar compra <Icon nome="arrow" className="h-4 w-4" />
              </button>
              <button onClick={fechar} className="w-full text-center text-sm text-[#5a4a3a] underline">continuar comprando</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
