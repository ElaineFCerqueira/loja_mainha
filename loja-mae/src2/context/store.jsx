import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CONFIG } from "../config/config.js";

const Ctx = createContext(null);
export const useLoja = () => useContext(Ctx);

const ler = (k, padrao) => {
  try {
    const v = JSON.parse(localStorage.getItem(k));
    return v ?? padrao;
  } catch {
    return padrao;
  }
};
const gravar = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* sem armazenamento: segue sem salvar */
  }
};

export function LojaProvider({ children, todasAsPecas }) {
  // Peças são únicas: o carrinho guarda cada peça uma vez só.
  const [carrinho, setCarrinho] = useState(() => ler("fr:carrinho", []));
  const [favoritos, setFavoritos] = useState(() => ler("fr:favoritos", []));
  const [cupom, setCupom] = useState(() => ler("fr:cupom", null)); // {codigo, taxa}
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  const [aviso, setAviso] = useState(null);
  const [pedido, setPedido] = useState(null);
  const timer = useRef(null);

  useEffect(() => gravar("fr:carrinho", carrinho), [carrinho]);
  useEffect(() => gravar("fr:favoritos", favoritos), [favoritos]);
  useEffect(() => gravar("fr:cupom", cupom), [cupom]);

  // Se uma peça do carrinho sumiu do catálogo (vendida), tira do carrinho.
  useEffect(() => {
    if (!todasAsPecas || todasAsPecas.length === 0) return;
    const ids = new Set(todasAsPecas.map((p) => p.id));
    setCarrinho((c) => {
      const novo = c.filter((p) => ids.has(p.id));
      return novo.length === c.length ? c : novo;
    });
  }, [todasAsPecas]);

  const avisar = useCallback((texto) => {
    setAviso(texto);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(null), 2600);
  }, []);

  const noCarrinho = useCallback((id) => carrinho.some((p) => p.id === id), [carrinho]);

  const adicionar = useCallback(
    (p) => {
      setCarrinho((c) => (c.some((x) => x.id === p.id) ? c : [...c, p]));
      avisar(`“${p.nome}” foi para o carrinho`);
    },
    [avisar]
  );
  const remover = useCallback((id) => setCarrinho((c) => c.filter((p) => p.id !== id)), []);
  const limparCarrinho = useCallback(() => {
    setCarrinho([]);
    setCupom(null);
  }, []);

  const alternarFavorito = useCallback(
    (id) =>
      setFavoritos((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
    []
  );

  const aplicarCupom = useCallback(
    (texto) => {
      const codigo = String(texto || "").trim().toUpperCase();
      const taxa = CONFIG.cupons[codigo];
      if (!codigo) return { ok: false, msg: "Digite um cupom." };
      if (!taxa) return { ok: false, msg: "Cupom inválido." };
      setCupom({ codigo, taxa });
      avisar(`Cupom ${codigo} aplicado`);
      return { ok: true };
    },
    [avisar]
  );

  const subtotal = useMemo(() => carrinho.reduce((s, p) => s + p.preco, 0), [carrinho]);
  const valorDesconto = cupom ? Math.round(subtotal * cupom.taxa * 100) / 100 : 0;
  const totalSemFrete = Math.max(0, subtotal - valorDesconto);

  const valor = {
    carrinho, favoritos, cupom, carrinhoAberto, setCarrinhoAberto,
    filtro, setFiltro, busca, setBusca, aviso, avisar, pedido, setPedido,
    noCarrinho, adicionar, remover, limparCarrinho, alternarFavorito,
    aplicarCupom, removerCupom: () => setCupom(null),
    subtotal, valorDesconto, totalSemFrete,
  };
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}
