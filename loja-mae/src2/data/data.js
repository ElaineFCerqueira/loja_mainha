// Converte um documento do Firestore para o formato que a loja usa.
// Se os campos do seu banco tiverem outros nomes, ajuste SÓ aqui.
export const normalizar = (p) => ({
  id: String(p.id),
  nome: p.nome ?? p.name ?? "Peça sem nome",
  preco: Number(p.preco ?? p.price ?? 0),
  precoAntigo: Number(p.precoAntigo ?? p.oldPrice ?? 0) || 0,
  categoria: String(p.categoria ?? p.category ?? "").toLowerCase(),
  tags: Array.isArray(p.tags) ? p.tags : [],
  imagem: p.imagem ?? p.fotos?.[0] ?? p.imagens?.[0] ?? p.image ?? null,
  descricao: p.descricao ?? p.description ?? "",
  criadoEm: p.criadoEm?.seconds ?? p.createdAt?.seconds ?? Number(p.criadoEm) ?? 0,
  cor: p.cor ?? null,
});

// Peças de demonstração (usadas quando a loja roda sem a prop "produtos").
export const PRODUTOS_DEMO = [
  { id: "d1", nome: "Vestido Chita Bonfim", preco: 189.9, precoAntigo: 229.9, categoria: "roupas", tags: ["vestido", "chita", "verão"], cor: "#c0392b", criadoEm: 8, descricao: "Vestido leve em chita, costurado à mão, com detalhe de fitinhas na barra." },
  { id: "d2", nome: "Blusa Retalho Azul", preco: 99.9, categoria: "roupas", tags: ["blusa", "retalho"], cor: "#1d4e8f", criadoEm: 7, descricao: "Blusa feita com retalhos selecionados, cada uma é diferente da outra." },
  { id: "d3", nome: "Bolsa de Palha e Chita", preco: 149.0, categoria: "artesanato", tags: ["bolsa", "palha", "chita"], cor: "#d98e04", criadoEm: 9, descricao: "Palha trançada com forro em chita. Alça reforçada." },
  { id: "d4", nome: "Saia Midi Fitas", preco: 129.9, precoAntigo: 159.9, categoria: "roupas", tags: ["saia", "fitas"], cor: "#2e7d5b", criadoEm: 5, descricao: "Saia midi com aplicação de fitas coloridas." },
  { id: "d5", nome: "Cesto Trançado Pequeno", preco: 79.9, categoria: "artesanato", tags: ["cesto", "cestaria", "decoração"], cor: "#a8742f", criadoEm: 6, descricao: "Cesto trançado à mão, ótimo para organizar ou decorar." },
  { id: "d6", nome: "Kimono Chita Amarela", preco: 219.9, categoria: "roupas", tags: ["kimono", "chita", "verão"], cor: "#f5b301", criadoEm: 4, descricao: "Kimono leve e solto, perfeito para a praia ou o dia a dia." },
  { id: "d7", nome: "Kit Fitinhas do Bonfim", preco: 39.9, categoria: "artesanato", tags: ["fitinhas", "presente"], cor: "#7b3f98", criadoEm: 3, descricao: "Kit com fitinhas coloridas para presentear ou decorar." },
  { id: "d8", nome: "Capa de Almofada Retalhos", preco: 59.9, precoAntigo: 74.9, categoria: "artesanato", tags: ["almofada", "retalho", "decoração"], cor: "#c0392b", criadoEm: 2, descricao: "Capa de almofada em patchwork de retalhos." },
];
