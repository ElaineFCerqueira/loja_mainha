import { useMemo, useState } from "react";
import { useLoja } from "../context/store.jsx";
import { Icon, brl } from "./ui.jsx";

const CORES = ["#1d4e8f", "#f5b301", "#c0392b", "#2e7d5b", "#7b3f98"];

function Confete() {
  // Fitinhas caindo uma vez só, sem atrapalhar cliques.
  const fitas = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        l: Math.round(Math.random() * 100),
        d: (Math.random() * 1.2).toFixed(2),
        t: (3 + Math.random() * 2.5).toFixed(2),
        c: CORES[i % CORES.length],
      })),
    []
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {fitas.map((f, i) => (
        <span
          key={i}
          className="fr-rabo absolute top-0 block h-3 w-8"
          style={{
            left: `${f.l}%`,
            background: f.c,
            animation: `fr-cai ${f.t}s ease-in ${f.d}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

export default function Obrigado({ irPara }) {
  const { pedido } = useLoja();
  const [copiado, setCopiado] = useState(false);

  if (!pedido) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="fr-titulo text-2xl font-bold">Nenhum pedido por aqui</p>
        <button onClick={() => irPara("/")} className="mt-6 rounded-full bg-[#2a1d10] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c0392b]">
          voltar para a loja
        </button>
      </div>
    );
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(pedido.pix.copiaECola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* navegador bloqueou: a pessoa copia à mão */
    }
  };
  const frete = pedido.entrega.frete;

  return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center">
      <Confete />
      <div className="fr-pop mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#2e7d5b] text-white shadow-lg">
        <Icon nome="check" className="h-10 w-10" stroke={3} />
      </div>
      <h1 className="fr-titulo fr-sobe mt-6 text-4xl font-bold">Pedido recebido!</h1>
      <p className="fr-sobe mt-2 text-[#5a4a3a]" style={{ animationDelay: "80ms" }}>
        Obrigado por escolher uma peça feita à mão. Enviamos os detalhes para <b>{pedido.cliente.email}</b>.
      </p>

      <div className="fr-sobe mt-8 grid gap-px overflow-hidden rounded-3xl bg-[#e4cfae] text-left shadow-sm sm:grid-cols-2" style={{ animationDelay: "160ms" }}>
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-[#8a7a68]">Número do pedido</p>
          <p className="fr-titulo mt-1 text-2xl font-bold">#{pedido.numero}</p>
        </div>
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-[#8a7a68]">Previsão de entrega</p>
          <p className="mt-1 font-semibold">{frete.prazo}</p>
        </div>
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-[#8a7a68]">Total</p>
          <p className="mt-1 text-xl font-bold text-[#c0392b]">{brl(pedido.total)}</p>
        </div>
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-[#8a7a68]">Pagamento</p>
          <p className="mt-1 font-semibold">{pedido.pagamento.metodo === "pix" ? "Pix" : "Cartão"}</p>
        </div>
      </div>

      {pedido.pagamento.metodo === "pix" && (
        <div className="fr-sobe mt-6 rounded-3xl bg-white p-5 text-left shadow-sm" style={{ animationDelay: "220ms" }}>
          <p className="font-semibold">Falta pagar o Pix</p>
          {pedido.pix?.copiaECola ? (
            <>
              {pedido.pix.qrCodeBase64 && (
                <img src={`data:image/png;base64,${pedido.pix.qrCodeBase64}`} alt="QR Code do Pix" className="mx-auto my-4 h-48 w-48" />
              )}
              <div className="flex gap-2">
                <input readOnly value={pedido.pix.copiaECola} aria-label="Pix copia e cola" className="min-w-0 flex-1 rounded-xl border border-[#e4cfae] bg-[#fdf3e4] px-3 py-2 text-xs" />
                <button onClick={copiar} className="flex items-center gap-1 rounded-xl bg-[#2a1d10] px-4 text-sm font-semibold text-white hover:bg-[#c0392b]">
                  <Icon nome="copy" className="h-4 w-4" /> {copiado ? "copiado!" : "copiar"}
                </button>
              </div>
            </>
          ) : (
            <p className="mt-1 text-sm text-[#8a7a68]">
              O QR Code e o código “copia e cola” aparecem aqui quando a integração com o Mercado Pago estiver ligada.
            </p>
          )}
        </div>
      )}

      <button
        onClick={() => irPara("/")}
        className="fr-sobe mt-8 inline-flex items-center gap-2 rounded-full bg-[#c0392b] px-8 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110"
        style={{ animationDelay: "280ms" }}
      >
        voltar para a loja <Icon nome="arrow" className="h-4 w-4" />
      </button>
      <p className="fr-titulo mt-8 text-xl italic text-[#1d4e8f]">obrigado por apoiar o que é feito à mão ♥</p>
    </div>
  );
}
