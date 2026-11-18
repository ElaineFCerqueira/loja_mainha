import { useEffect, useMemo, useState } from "react";
import { CONFIG } from "../config/config.js";
import { useLoja } from "../context/store.jsx";
import { Icon, Imagem, Selo, brl, desconto } from "./ui.jsx";
import ProdutoModal from "./ProdutoModal.jsx";

/* ------------------------------------------------------------------ */
/* HERO                                                                */
/* ------------------------------------------------------------------ */
const SLIDES = [
  {
    kicker: "nova coleção",
    titulo: "Peças únicas,\nfeitas à mão",
    texto: "Cada peça é costurada ou trançada por uma pessoa só, aqui em Salvador. Quando acaba, acaba.",
    cta: "ver as peças",
    filtro: "novidades",
    cor: "#1d4e8f",
    fundo: "linear-gradient(120deg,#fff3d6 0%,#fdf3e4 45%,#fbdcd2 100%)",
  },
  {
    kicker: "artesanato",
    titulo: "Cestaria, palha\ne muita cor",
    texto: "Peças para a casa e para presentear, com a alma da Bahia em cada trançado.",
    cta: "ver artesanato",
    filtro: "artesanato",
    cor: "#c0392b",
    fundo: "linear-gradient(120deg,#fde7d8 0%,#fdf3e4 50%,#f5e3a8 100%)",
  },
  {
    kicker: "em promoção",
    titulo: "Chita, fitas\ne retalhos",
    texto: "Peças selecionadas com preço especial. Aproveite antes que ela seja de outra pessoa.",
    cta: "ver promoções",
    filtro: "promocao",
    cor: "#b97a00",
    fundo: "linear-gradient(120deg,#f6e6b4 0%,#fdf3e4 50%,#d9e6f5 100%)",
  },
];

const FITAS_HERO = [
  { c: "#1d4e8f", t: "10%", l: "4%", w: "82%", r: -12, d: "0s", tx: "#fff" },
  { c: "#f5b301", t: "32%", l: "14%", w: "74%", r: 7, d: "-1.5s", tx: "#2a1d10" },
  { c: "#c0392b", t: "54%", l: "2%", w: "84%", r: -5, d: "-3s", tx: "#fff" },
  { c: "#2e7d5b", t: "75%", l: "18%", w: "68%", r: 11, d: "-4.5s", tx: "#fff" },
];

function filtrar(pecas, filtro, favoritos) {
  if (filtro === "roupas" || filtro === "artesanato") return pecas.filter((p) => p.categoria === filtro);
  if (filtro === "promocao") return pecas.filter((p) => desconto(p) > 0);
  if (filtro === "favoritos") return pecas.filter((p) => favoritos.includes(p.id));
  if (filtro === "novidades") return [...pecas].sort((a, b) => b.criadoEm - a.criadoEm).slice(0, 6);
  return pecas;
}

function Hero({ pecas, rolarParaPecas, onAbrir }) {
  const { setFiltro, favoritos } = useLoja();
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const slide = SLIDES[i];

  useEffect(() => {
    if (pausa) return;
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6500);
    return () => clearInterval(t);
  }, [pausa]);

  const destaque = filtrar(pecas, slide.filtro, favoritos)[0] || pecas[0];
  const ir = (n) => setI((n + SLIDES.length) % SLIDES.length);

  return (
    <section
      onMouseEnter={() => setPausa(true)}
      onMouseLeave={() => setPausa(false)}
      className="relative grid overflow-hidden rounded-3xl md:min-h-[480px] md:grid-cols-2"
      style={{ background: slide.fundo, transition: "background 0.6s" }}
      aria-roledescription="carrossel"
    >
      {/* texto */}
      <div key={i} className="relative z-10 flex flex-col justify-center gap-5 p-7 md:p-12">
        <p className="fr-titulo fr-sobe text-xl italic" style={{ color: slide.cor }}>
          {slide.kicker}
        </p>
        <h1 className="fr-titulo fr-sobe text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl" style={{ animationDelay: "60ms" }}>
          {slide.titulo.split("\n").map((l) => (
            <span key={l} className="block">{l}</span>
          ))}
        </h1>
        <p className="fr-sobe max-w-sm text-[15px] leading-relaxed text-[#5a4a3a]" style={{ animationDelay: "120ms" }}>
          {slide.texto}
        </p>
        <div className="fr-sobe flex items-center gap-5" style={{ animationDelay: "180ms" }}>
          <button
            onClick={() => {
              setFiltro(slide.filtro);
              rolarParaPecas();
            }}
            style={{ background: slide.cor }}
            className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            {slide.cta} <Icon nome="arrow" className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2" role="tablist" aria-label="Slides">
            {SLIDES.map((s, n) => (
              <button
                key={s.kicker}
                role="tab"
                aria-selected={n === i}
                aria-label={`Slide ${n + 1}`}
                onClick={() => ir(n)}
                className={`h-1.5 rounded-full transition-all ${n === i ? "w-8" : "w-3 bg-[#2a1d10]/25 hover:bg-[#2a1d10]/45"}`}
                style={n === i ? { background: slide.cor } : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      {/* arte: fitinhas balançando + peça em destaque */}
      <div className="relative h-72 md:h-auto" aria-hidden={!destaque}>
        <div
          className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full md:h-80 md:w-80"
          style={{ background: "radial-gradient(circle at 35% 30%, #ffe08a, #f5b301 70%)", opacity: 0.55 }}
        />
        {FITAS_HERO.map((f) => (
          <div
            key={f.c}
            className="fr-rabo fr-balanca absolute flex h-9 items-center overflow-hidden whitespace-nowrap pl-4 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-sm"
            style={{ top: f.t, left: f.l, width: f.w, background: f.c, color: f.tx, "--r": `${f.r}deg`, animationDelay: f.d }}
          >
            lembrança da bahia ✦ lembrança da bahia ✦ lembrança da bahia
          </div>
        ))}
        {destaque && (
          <button
            key={destaque.id}
            onClick={() => onAbrir(destaque)}
            className="fr-flutua absolute bottom-5 right-5 w-40 rounded-2xl bg-white p-2 text-left shadow-2xl transition hover:scale-105 md:bottom-10 md:right-10 md:w-48"
            aria-label={`Ver ${destaque.nome}`}
          >
            <div className="aspect-square overflow-hidden rounded-xl">
              <Imagem produto={destaque} />
            </div>
            <p className="mt-2 truncate text-sm font-semibold">{destaque.nome}</p>
            <p className="text-sm font-bold text-[#c0392b]">{brl(destaque.preco)}</p>
          </button>
        )}
      </div>

      {/* setas */}
      <div className="absolute bottom-4 left-4 z-10 hidden gap-2 md:flex">
        {[-1, 1].map((d) => (
          <button
            key={d}
            onClick={() => ir(i + d)}
            aria-label={d < 0 ? "Slide anterior" : "Próximo slide"}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/80 shadow transition hover:bg-white"
          >
            <Icon nome={d < 0 ? "chevL" : "chevR"} className="h-4 w-4" />
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CATEGORIAS (bolinhas)                                               */
/* ------------------------------------------------------------------ */
const CATS = [
  { id: "todas", rotulo: "todas", icone: "bag", cor: "#1d4e8f" },
  { id: "roupas", rotulo: "roupas", icone: "shirt", cor: "#d98e04" },
  { id: "artesanato", rotulo: "artesanato", icone: "basket", cor: "#c0392b" },
  { id: "novidades", rotulo: "novidades", icone: "star", cor: "#2e7d5b" },
  { id: "promocao", rotulo: "promoção", icone: "tag", cor: "#7b3f98" },
  { id: "favoritos", rotulo: "favoritos", icone: "heart", cor: "#c0392b" },
];

function Categorias({ rolarParaPecas }) {
  const { filtro, setFiltro, favoritos } = useLoja();
  return (
    <section className="py-10" aria-label="Categorias">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-5 sm:gap-x-10">
        {CATS.map((c) => {
          const ativa = filtro === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                setFiltro(c.id);
                rolarParaPecas();
              }}
              aria-pressed={ativa}
              className="group flex w-20 flex-col items-center gap-2"
            >
              <span
                className="relative grid h-16 w-16 place-items-center rounded-full transition duration-200 group-hover:-translate-y-1 group-hover:shadow-lg"
                style={{
                  background: `${c.cor}1f`,
                  color: c.cor,
                  boxShadow: ativa ? `0 0 0 3px #fdf3e4, 0 0 0 5px ${c.cor}` : undefined,
                }}
              >
                <Icon nome={c.icone} className="h-7 w-7" cheio={c.id === "favoritos" && favoritos.length > 0} />
                {c.id === "favoritos" && favoritos.length > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#c0392b] px-1 text-[10px] font-bold text-white">
                    {favoritos.length}
                  </span>
                )}
              </span>
              <span className={`text-sm ${ativa ? "font-semibold" : ""}`}>{c.rotulo}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CARD + GRADE                                                        */
/* ------------------------------------------------------------------ */
function Card({ produto, onAbrir }) {
  const { favoritos, alternarFavorito, noCarrinho, adicionar } = useLoja();
  const fav = favoritos.includes(produto.id);
  const dentro = noCarrinho(produto.id);
  const off = desconto(produto);

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <button onClick={() => onAbrir(produto)} className="block w-full text-left" aria-label={`Ver detalhes de ${produto.nome}`}>
        <div className="relative aspect-[4/5] overflow-hidden">
          <Imagem produto={produto} className="transition duration-500 group-hover:scale-105" />
          {off > 0 ? (
            <Selo className="absolute left-3 top-3 bg-[#c0392b] text-white">-{off}%</Selo>
          ) : (
            <Selo className="absolute left-3 top-3 bg-[#1d4e8f] text-white">peça única</Selo>
          )}
          <span className="absolute inset-x-0 bottom-0 translate-y-full bg-black/55 py-2 text-center text-sm text-white transition duration-300 group-hover:translate-y-0">
            ver detalhes
          </span>
        </div>
        <div className="p-4 pb-3">
          <h3 className="truncate font-semibold">{produto.nome}</h3>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#c0392b]">{brl(produto.preco)}</span>
            {off > 0 && <span className="text-xs text-[#8a7a68] line-through">{brl(produto.precoAntigo)}</span>}
          </p>
        </div>
      </button>

      <button
        onClick={() => alternarFavorito(produto.id)}
        aria-label={fav ? "Remover dos favoritos" : "Favoritar"}
        aria-pressed={fav}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#c0392b] shadow transition hover:scale-110 active:scale-90"
      >
        <Icon nome="heart" cheio={fav} className="h-[18px] w-[18px]" />
      </button>

      <div className="px-4 pb-4">
        <button
          onClick={() => adicionar(produto)}
          disabled={dentro}
          className="w-full rounded-xl bg-[#2a1d10] py-2 text-sm font-semibold text-white transition hover:bg-[#c0392b] disabled:cursor-default disabled:bg-[#2e7d5b]"
        >
          {dentro ? "✓ no carrinho" : "adicionar ao carrinho"}
        </button>
      </div>
    </article>
  );
}

function Esqueleto() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl bg-white/70">
      <div className="aspect-[4/5] bg-[#f0e1c8]" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 rounded bg-[#f0e1c8]" />
        <div className="h-4 w-1/3 rounded bg-[#f0e1c8]" />
      </div>
    </div>
  );
}

const ORDENS = [
  { id: "novidades", rotulo: "Novidades" },
  { id: "menor", rotulo: "Menor preço" },
  { id: "maior", rotulo: "Maior preço" },
];

function Pecas({ pecas, carregando, onAbrir }) {
  const { filtro, setFiltro, busca, setBusca, favoritos } = useLoja();
  const [ordem, setOrdem] = useState("novidades");
  const [tagsAtivas, setTagsAtivas] = useState([]);

  useEffect(() => setTagsAtivas([]), [filtro]);

  const base = useMemo(() => filtrar(pecas, filtro, favoritos), [pecas, filtro, favoritos]);
  const tags = useMemo(() => [...new Set(base.flatMap((p) => p.tags))].sort(), [base]);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const l = base.filter(
      (p) =>
        (!termo || p.nome.toLowerCase().includes(termo) || p.tags.some((t) => t.toLowerCase().includes(termo))) &&
        tagsAtivas.every((t) => p.tags.includes(t))
    );
    if (ordem === "menor") l.sort((a, b) => a.preco - b.preco);
    else if (ordem === "maior") l.sort((a, b) => b.preco - a.preco);
    else l.sort((a, b) => b.criadoEm - a.criadoEm);
    return l;
  }, [base, busca, tagsAtivas, ordem]);

  const limpar = () => {
    setBusca("");
    setTagsAtivas([]);
    setFiltro("todas");
  };
  const alternarTag = (t) => setTagsAtivas((a) => (a.includes(t) ? a.filter((x) => x !== t) : [...a, t]));
  const filtrando = busca || tagsAtivas.length > 0 || filtro !== "todas";
  const titulo = CATS.find((c) => c.id === filtro)?.rotulo ?? "todas";

  return (
    <section id="pecas" className="scroll-mt-20">
      <div className="mb-1 flex items-end justify-between gap-4">
        <div>
          <p className="fr-titulo text-sm font-semibold uppercase tracking-[0.2em] text-[#c0392b]">coleção</p>
          <h2 className="fr-titulo text-3xl font-bold md:text-4xl">Nossas peças</h2>
        </div>
        {filtro !== "todas" && (
          <p className="mb-1 rounded-full bg-white px-4 py-1 text-sm shadow-sm">
            filtro: <b>{titulo}</b>
          </p>
        )}
      </div>

      <div className="sticky top-16 z-30 -mx-4 bg-[#fdf3e4]/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[200px] flex-1">
            <span className="sr-only">Buscar peças</span>
            <Icon nome="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7a68]" />
            <input
              id="busca"
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="buscar por nome ou tag…"
              className="w-full rounded-full border border-[#e4cfae] bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-[#1d4e8f] focus:ring-2 focus:ring-[#1d4e8f]/20"
            />
          </label>
          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            aria-label="Ordenar"
            className="rounded-full border border-[#e4cfae] bg-white px-4 py-2 text-sm outline-none"
          >
            {ORDENS.map((o) => (
              <option key={o.id} value={o.id}>{o.rotulo}</option>
            ))}
          </select>
        </div>
        {tags.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => alternarTag(t)}
                aria-pressed={tagsAtivas.includes(t)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs transition ${
                  tagsAtivas.includes(t) ? "bg-[#1d4e8f] text-white" : "bg-white text-[#5a4a3a] hover:bg-[#f3dfc1]"
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {!carregando && (
        <p className="mb-4 mt-2 text-sm text-[#8a7a68]">
          {visiveis.length} {visiveis.length === 1 ? "peça" : "peças"}
          {filtrando && (
            <button onClick={limpar} className="ml-3 underline hover:text-[#c0392b]">limpar filtros</button>
          )}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {carregando && Array.from({ length: 8 }).map((_, i) => <Esqueleto key={i} />)}
        {!carregando && visiveis.map((p) => <Card key={p.id} produto={p} onAbrir={onAbrir} />)}
      </div>

      {!carregando && visiveis.length === 0 && (
        <div className="py-20 text-center text-[#8a7a68]">
          <p className="text-lg">
            {filtro === "favoritos" && favoritos.length === 0
              ? "Toque no coração das peças que você gostar e elas aparecem aqui."
              : "Nenhuma peça encontrada."}
          </p>
          {filtrando && <button onClick={limpar} className="mt-2 underline hover:text-[#c0392b]">limpar filtros</button>}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAIXA DE CUPOM                                                      */
/* ------------------------------------------------------------------ */
function FaixaCupom() {
  const { aplicarCupom, cupom } = useLoja();
  const [codigo, taxa] = Object.entries(CONFIG.cupons)[0] ?? [];
  if (!codigo) return null;
  const aplicado = cupom?.codigo === codigo;
  return (
    <section
      className="relative my-16 overflow-hidden rounded-3xl p-8 text-white md:p-12"
      style={{ background: "linear-gradient(110deg,#1d4e8f 0%,#5b3f8f 55%,#c0392b 100%)" }}
    >
      <div className="fr-rabo absolute -right-4 top-6 hidden h-10 w-72 rotate-[-8deg] bg-[#f5b301] md:block" />
      <div className="fr-rabo absolute -right-10 top-20 hidden h-10 w-80 rotate-[6deg] bg-white/90 md:block" />
      <div className="fr-rabo absolute -right-2 top-[8.5rem] hidden h-10 w-64 rotate-[-4deg] bg-[#2e7d5b] md:block" />
      <div className="relative max-w-md">
        <p className="fr-titulo text-lg italic text-[#f5b301]">primeira compra</p>
        <h2 className="fr-titulo mt-1 text-4xl font-bold leading-tight md:text-5xl">
          {Math.round(taxa * 100)}% de desconto
        </h2>
        <p className="mt-3 text-white/85">Use o cupom <b className="tracking-wider">{codigo}</b> no carrinho e leve uma peça feita com carinho.</p>
        <button
          onClick={() => aplicarCupom(codigo)}
          disabled={aplicado}
          className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#2a1d10] shadow-lg transition hover:-translate-y-0.5 disabled:bg-[#2e7d5b] disabled:text-white"
        >
          {aplicado ? "✓ cupom aplicado" : "aplicar cupom"}
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* BENEFÍCIOS + BASTIDORES                                             */
/* ------------------------------------------------------------------ */
function Beneficios() {
  return (
    <section className="grid grid-cols-2 gap-6 border-y border-[#e4cfae] py-8 md:grid-cols-4" aria-label="Benefícios">
      {CONFIG.beneficios.map((b) => (
        <div key={b.titulo} className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#1d4e8f] shadow-sm">
            <Icon nome={b.icone} className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">{b.titulo}</p>
            <p className="text-xs text-[#8a7a68]">{b.texto}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

const BASTIDORES = [
  { t: "chita", d: "estampas que viram vestido", fundo: "repeating-linear-gradient(45deg,#c0392b 0 10px,#e8a09a 10px 20px)" },
  { t: "fitinhas", d: "cada cor com um desejo", fundo: "repeating-linear-gradient(90deg,#1d4e8f 0 14px,#f5b301 14px 28px,#c0392b 28px 42px,#2e7d5b 42px 56px)" },
  { t: "cestaria", d: "trançado de palha à mão", fundo: "repeating-linear-gradient(0deg,#c9954f 0 8px,#a8742f 8px 16px)" },
  { t: "retalhos", d: "nada se perde", fundo: "conic-gradient(from 0deg at 30% 30%,#f5b301 0 25%,#1d4e8f 0 50%,#c0392b 0 75%,#2e7d5b 0)" },
];

function Bastidores() {
  return (
    <section id="sobre" className="scroll-mt-20 py-16">
      <div className="mb-6 text-center">
        <p className="fr-titulo text-sm font-semibold uppercase tracking-[0.2em] text-[#c0392b]">ateliê</p>
        <h2 className="fr-titulo text-3xl font-bold md:text-4xl">Feito à mão, do jeito baiano</h2>
        <p className="mx-auto mt-2 max-w-lg text-[#5a4a3a]">
          Cada peça nasce de materiais que a gente escolhe com calma. Por isso são únicas.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {BASTIDORES.map((b) => (
          <div
            key={b.t}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ background: b.fundo }}
          >
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-white">
              <p className="fr-titulo text-xl font-bold">{b.t}</p>
              <p className="text-xs text-white/85">{b.d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export default function Home({ pecas, carregando, rolarPara }) {
  const [aberto, setAberto] = useState(null);
  const rolarParaPecas = () => setTimeout(() => rolarPara("pecas"), 30);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-4 pt-2">
      <Hero pecas={pecas} rolarParaPecas={rolarParaPecas} onAbrir={setAberto} />
      <Categorias rolarParaPecas={rolarParaPecas} />
      <Pecas pecas={pecas} carregando={carregando} onAbrir={setAberto} />
      <FaixaCupom />
      <Beneficios />
      <Bastidores />
      {aberto && <ProdutoModal produto={aberto} onFechar={() => setAberto(null)} />}
    </div>
  );
}
