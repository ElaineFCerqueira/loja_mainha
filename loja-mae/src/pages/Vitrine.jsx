import { useState } from 'react'
import { useProdutos } from '../hooks/useProdutos'
import ProductCard from '../components/ProductCard'

const CATEGORIAS = [
  { id: 'todas', label: 'todas', cor: 'bg-azul' },
  { id: 'roupas', label: 'roupas', cor: 'bg-amarelo text-tinta' },
  { id: 'artesanato', label: 'artesanato', cor: 'bg-vermelho' },
]

export default function Vitrine() {
  const [categoria, setCategoria] = useState('todas')
  const { produtos, carregando } = useProdutos(categoria)

  return (
    <div>
      <header className="text-center pt-12 pb-8">
        <h1 className="font-display text-4xl font-semibold">Fitas & Retalhos</h1>
        <p className="text-sm text-tinta/50 mt-2">peças únicas, feitas à mão em Salvador</p>
      </header>

      <div className="flex gap-2.5 justify-center flex-wrap pb-10 px-6">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoria(cat.id)}
            className={`px-5 py-2.5 text-sm font-medium text-white ${cat.cor} ${
              categoria === cat.id ? '-translate-y-1' : ''
            }`}
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)' }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <main className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-7 gap-y-9">
        {carregando && <p className="col-span-full text-center text-tinta/40">carregando peças…</p>}
        {!carregando && produtos.length === 0 && (
          <p className="col-span-full text-center text-tinta/40">nenhuma peça disponível nessa categoria agora</p>
        )}
        {produtos.map((produto) => (
          <ProductCard key={produto.id} produto={produto} />
        ))}
      </main>
    </div>
  )
}
