import { useMemo, useState } from "react";
import { useLoja } from "../context/store.jsx";
import { Icon, brl } from "./ui.jsx";

export default function Checkout({ irPara, onFinalizar }) {
  const {
    carrinho,
    subtotal,
    valorDesconto,
    totalSemFrete,
    cupom,
    limparCarrinho,
    setPedido,
  } = useLoja();
  const [metodo, setMetodo] = useState("pix");
  const [cliente, setCliente] = useState({ nome: "", email: "", cep: "" });
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState(null);

  const numero = useMemo(() => `FR${Math.floor(100000 + Math.random() * 900000)}`, []);

  async function finalizar(event) {
    event.preventDefault();
    if (carrinho.length === 0) {
      setErro("Seu carrinho está vazio.");
      return;
    }

    setProcessando(true);
    setErro(null);
    try {
      const pedido = {
        numero,
        cliente,
        carrinho,
        subtotal,
        desconto: valorDesconto,
        total: totalSemFrete,
        cupom,
        entrega: { frete: { prazo: "5 a 8 dias úteis" } },
        pagamento: { metodo },
        pix: null,
      };
      const resultado = onFinalizar ? await onFinalizar(pedido) : pedido;
      setPedido({ ...pedido, ...(resultado || {}) });
      limparCarrinho();
      irPara("/obrigado");
    } catch (erroFinalizacao) {
      setErro(erroFinalizacao.message || "Não foi possível finalizar o pedido.");
    } finally {
      setProcessando(false);
    }
  }

  if (carrinho.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="fr-titulo text-2xl font-bold">Seu carrinho está vazio</p>
        <button onClick={() => irPara("/")} className="mt-6 rounded-full bg-[#c0392b] px-6 py-3 text-sm font-semibold text-white">
          voltar para a loja
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <button onClick={() => irPara("/")} className="mb-6 text-sm text-[#5a4a3a] underline">
        ← continuar comprando
      </button>
      <h1 className="fr-titulo mb-8 text-center text-3xl font-bold">Finalizar pedido</h1>
      <form onSubmit={finalizar} className="grid gap-8 md:grid-cols-[1fr_360px]">
        <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="fr-titulo text-xl font-bold">Dados de entrega</h2>
          <label className="block text-sm">
            Nome completo
            <input required value={cliente.nome} onChange={(event) => setCliente({ ...cliente, nome: event.target.value })} className="mt-2 w-full rounded-xl border border-[#e4cfae] bg-[#fdf3e4] px-4 py-3 outline-none" />
          </label>
          <label className="block text-sm">
            E-mail
            <input required type="email" value={cliente.email} onChange={(event) => setCliente({ ...cliente, email: event.target.value })} className="mt-2 w-full rounded-xl border border-[#e4cfae] bg-[#fdf3e4] px-4 py-3 outline-none" />
          </label>
          <label className="block text-sm">
            CEP
            <input required inputMode="numeric" value={cliente.cep} onChange={(event) => setCliente({ ...cliente, cep: event.target.value })} className="mt-2 w-full rounded-xl border border-[#e4cfae] bg-[#fdf3e4] px-4 py-3 outline-none" />
          </label>

          <h2 className="fr-titulo pt-2 text-xl font-bold">Pagamento</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["pix", "Pix"],
              ["cartao", "Cartão"],
            ].map(([valor, texto]) => (
              <button key={valor} type="button" onClick={() => setMetodo(valor)} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${metodo === valor ? "border-[#c0392b] bg-[#fbe3df] text-[#c0392b]" : "border-[#e4cfae]"}`}>
                {texto}
              </button>
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="fr-titulo text-xl font-bold">Resumo</h2>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{brl(subtotal)}</dd></div>
            {valorDesconto > 0 && <div className="flex justify-between text-[#2e7d5b]"><dt>Desconto</dt><dd>-{brl(valorDesconto)}</dd></div>}
            <div className="flex justify-between text-[#8a7a68]"><dt>Frete</dt><dd>a calcular</dd></div>
            <div className="mt-3 flex justify-between border-t border-[#e4cfae] pt-3 text-lg font-bold"><dt>Total</dt><dd>{brl(totalSemFrete)}</dd></div>
          </dl>
          {erro && <p className="mt-4 text-sm text-[#c0392b]">{erro}</p>}
          <button disabled={processando} type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#c0392b] py-3.5 font-semibold text-white disabled:opacity-50">
            {processando ? "processando…" : "confirmar pedido"}
            {!processando && <Icon nome="arrow" className="h-4 w-4" />}
          </button>
        </aside>
      </form>
    </div>
  );
}
