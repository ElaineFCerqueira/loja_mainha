import { Link } from 'react-router-dom'

const corPorCategoria = {
  roupas: 'from-azul to-azul',
  artesanato: 'from-terracota to-terracota',
}

export default function ProductCard({ produto }) {
  return (
    <Link to={`/peca/${produto.id}`} className="text-center block group">
      <div
        className="aspect-square rounded-full p-2"
        style={{
          background: `conic-gradient(${
            produto.categoria === 'roupas' ? '#1B4D8C' : '#B5651D'
          } 0deg 340deg, transparent 340deg 360deg)`,
        }}
      >
        <div className="w-full h-full rounded-full bg-cru-escuro flex items-center justify-center text-tinta/30 font-display text-xs">
          foto
        </div>
      </div>
      <span className="block mt-3 text-[11px] uppercase tracking-wide text-vermelho font-semibold">
        peça única
      </span>
      <h3 className="font-display text-lg mt-1">{produto.nome}</h3>
      <p className="text-sm text-tinta/60 mt-1">R$ {produto.preco?.toFixed(2)}</p>
    </Link>
  )
}
