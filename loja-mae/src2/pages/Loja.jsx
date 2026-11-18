import { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/loja.css";
import { CONFIG } from "../config/config.js";
import { PRODUTOS_DEMO, normalizar } from "../data/data.js";
import { LojaProvider, useLoja } from "../context/store.jsx";
import { Icon } from "../components/ui.jsx";
import Home from "../components/Home.jsx";
import CartDrawer from "../components/CartDrawer.jsx";
import Obrigado from "../components/Obrigado.jsx";

/* Rotas por hash (#/, #/checkout, #/obrigado): funciona sem react-router. */
function useRota() {
  const ler = () => window.location.hash.replace(/^#/, "") || "/";
  const [rota, setRota] = useState(ler);
  useEffect(() => {
    const f = () => {
      setRota(ler());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const irPara = useCallback((para) => {
    window.location.hash = para;
  }, []);
  return [rota, irPara];
}

function Logo({ onClick }) {
  return (
    <button onClick={onClick} className="flex shrink-0 items-center gap-2 whitespace-nowrap" aria-label={CONFIG.nome}>
      <span className="flex gap-0.5" aria-hidden="true">
        {["#1d4e8f", "#f5b301", "#c0392b"].map((c) => (
          <span key={c} className="fr-fita block h-6 w-2" style={{ background: c }} />
        ))}
      </span>
      <span className="fr-titulo text-lg font-bold sm:text-xl">{CONFIG.nome}</span>
    </button>
  );
}

function Header({ rota, irPara, rolarPara }) {
  const { carrinho, favoritos, setCarrinhoAberto, setFiltro } = useLoja();
  const [raso, setRaso] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const f = () => setRaso(window.scrollY > 8);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  const links = [
    { id: "topo", rotulo: "início" },
    { id: "pecas", rotulo: "peças" },
    { id: "sobre", rotulo: "ateliê" },
    { id: "contato", rotulo: "contato" },
  ];
  const ir = (id) => {
    setMenu(false);
    if (id === "topo") {
      if (rota === "/") window.scrollTo({ top: 0, behavior: "smooth" });
      else irPara("/");
    } else rolarPara(id);
  };
  const buscar = () => {
    rolarPara("pecas");
    setTimeout(() => document.getElementById("busca")?.focus(), 500);
  };
  const verFavoritos = () => {
    setFiltro("favoritos");
    rolarPara("pecas");
  };

  const btn = "relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-white";
  return (
    <header className={`sticky top-0 z-40 transition ${raso ? "bg-[#fdf3e4]/95 shadow-sm backdrop-blur" : "bg-[#fdf3e4]"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo onClick={() => ir("topo")} />
        <nav className="hidden gap-8 text-sm md:flex" aria-label="Principal">
          {links.map((l) => (
            <button key={l.id} onClick={() => ir(l.id)} className="transition hover:text-[#c0392b]">{l.rotulo}</button>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <button onClick={buscar} className={btn} aria-label="Buscar"><Icon nome="search" /></button>
          <button onClick={verFavoritos} className={btn} aria-label={`Favoritos (${favoritos.length})`}>
            <Icon nome="heart" cheio={favoritos.length > 0} className="h-5 w-5 text-[#c0392b]" />
            {favoritos.length > 0 && (
              <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#c0392b] px-1 text-[10px] font-bold text-white">{favoritos.length}</span>
            )}
          </button>
          <button onClick={() => setCarrinhoAberto(true)} className={btn} aria-label={`Carrinho (${carrinho.length})`}>
            <Icon nome="bag" />
            {carrinho.length > 0 && (
              <span key={carrinho.length} className="fr-pop absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#1d4e8f] px-1 text-[10px] font-bold text-white">{carrinho.length}</span>
            )}
          </button>
          <button onClick={() => setMenu((m) => !m)} className={`${btn} md:hidden`} aria-label="Menu" aria-expanded={menu}>
            <Icon nome={menu ? "close" : "menu"} />
          </button>
        </div>
      </div>
      {menu && (
        <nav className="fr-sobe border-t border-[#e4cfae] bg-[#fdf3e4] px-4 py-3 md:hidden" aria-label="Menu móvel">
          {links.map((l) => (
            <button key={l.id} onClick={() => ir(l.id)} className="block w-full py-2.5 text-left">{l.rotulo}</button>
          ))}
        </nav>
      )}
    </header>
  );
}

function Rodape({ rolarPara, irPara }) {
  const { setFiltro } = useLoja();
  const zap = CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}` : null;
  const ver = (f) => {
    setFiltro(f);
    rolarPara("pecas");
  };
  return (
    <footer id="contato" className="mt-10 bg-[#2a1d10] text-[#f3dfc1]">
      <div className="h-2" style={{ background: "repeating-linear-gradient(90deg,#1d4e8f 0 40px,#f5b301 40px 80px,#c0392b 80px 120px,#2e7d5b 120px 160px)" }} />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="fr-titulo text-2xl font-bold text-white">{CONFIG.nome}</p>
          <p className="mt-2 max-w-xs text-sm text-[#f3dfc1]/80">{CONFIG.slogan}</p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold text-white">Navegue</p>
          <ul className="space-y-2">
            <li><button onClick={() => ver("todas")} className="hover:text-white">todas as peças</button></li>
            <li><button onClick={() => ver("roupas")} className="hover:text-white">roupas</button></li>
            <li><button onClick={() => ver("artesanato")} className="hover:text-white">artesanato</button></li>
            <li><button onClick={() => ver("promocao")} className="hover:text-white">promoção</button></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold text-white">Fale com a gente</p>
          <ul className="space-y-2">
            {zap && <li><a href={zap} target="_blank" rel="noreferrer" className="hover:text-white">WhatsApp</a></li>}
            {CONFIG.instagram && <li><a href={CONFIG.instagram} target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a></li>}
            {!zap && !CONFIG.instagram && <li className="text-[#f3dfc1]/60">Em breve por aqui.</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-[#f3dfc1]/60">
        © {new Date().getFullYear()} {CONFIG.nome} · desenvolvido por {CONFIG.creditos}
      </div>
    </footer>
  );
}

function Aviso() {
  const { aviso } = useLoja();
  if (!aviso) return null;
  return (
    <div role="status" className="fr-sobe fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#2a1d10] px-5 py-3 text-sm text-white shadow-2xl">
      {aviso}
    </div>
  );
}

function Casca({ pecas, carregando, onFinalizar }) {
  const [rota, irPara] = useRota();

  const rolarPara = useCallback(
    (id) => {
      const ir = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      const naHome = (window.location.hash.replace(/^#/, "") || "/") === "/";
      if (naHome) ir();
      else {
        window.location.hash = "/";
        setTimeout(ir, 120);
      }
    },
    []
  );

  return (
    <div className="fr-root fr-textura">
      <Header rota={rota} irPara={irPara} rolarPara={rolarPara} />
      <main>
        {rota === "/obrigado" ? (
          <Obrigado irPara={irPara} />
        ) : (
          <Home pecas={pecas} carregando={carregando} rolarPara={rolarPara} />
        )}
      </main>
      <Rodape rolarPara={rolarPara} irPara={irPara} />
      <CartDrawer irPara={irPara} />
      <Aviso />
    </div>
  );
}

/**
 * Props (todas opcionais):
 *  produtos   -> array de peças vindo do Firestore. Sem ele, mostra peças de demonstração.
 *  carregando -> true enquanto busca as peças.
 *  onFinalizar(pedido) -> async; cria o pedido/pagamento no servidor e retorna
 *                         { numero, pix?: { copiaECola, qrCodeBase64 } }.
 *                         Se lançar erro, a mensagem aparece para a cliente.
 */
export default function Loja({ produtos, carregando = false, onFinalizar }) {
  const pecas = useMemo(
    () => (produtos ? produtos.map(normalizar) : PRODUTOS_DEMO.map(normalizar)),
    [produtos]
  );
  return (
    <LojaProvider todasAsPecas={produtos && !carregando ? pecas : null}>
      <Casca pecas={pecas} carregando={carregando} onFinalizar={onFinalizar} />
    </LojaProvider>
  );
}
