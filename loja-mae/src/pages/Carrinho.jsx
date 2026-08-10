import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Carrinho() {
  const { itens, removerDoCarrinho, total } = useCart()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  function irParaCheckout() {
    navigate(usuario ? '/checkout' : '/login')
  }

  return (
    <div>
      <Link to="/" className="inline-block m-7 text-sm text-tinta/50">← continuar vendo peças</Link>
      <h1 className="font-display text-3xl font-semibold text-center mb-9">Seu carrinho</h1>

      <main className="max-w-4xl mx-auto px-6 pb-16 grid md:grid-cols-[1.3fr,1fr] gap-11">
        <section>
          {itens.length === 0 && <p className="text-tinta/40">seu carrinho está vazio</p>}
          {itens.map((item) => (
            <div key={item.id} className="flex gap-4 items-center py-4 border-b border-cru-escuro">
              <div
                className="w-16 h-16 rounded-full p-1.5 shrink-0"
                style={{
                  background: `conic-gradient(${
                    item.categoria === 'roupas' ? '#1B4D8C' : '#B5651D'
                  } 0deg 340deg, transparent 340deg 360deg)`,
                }}
              >
                <div className="w-full h-full rounded-full bg-cru-escuro" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-base">{item.nome}</h3>
                <p className="text-sm text-terracota font-semibold mt-1">R$ {item.preco.toFixed(2)}</p>
                <p className="text-xs text-vermelho mt-1">peça única — reservada por 15 min</p>
              </div>
              <button
                onClick={() => removerDoCarrinho(item.id)}
                className="text-xs text-tinta/40 underline"
              >
                remover
              </button>
            </div>
          ))}
        </section>

        <aside className="bg-white rounded-2xl p-6 h-fit">
          <h2 className="font-display text-xl font-semibold mb-4">Resumo</h2>
          <div className="flex justify-between text-sm py-1.5 text-tinta/60 font-bold border-t border-cru-escuro mt-2 pt-3">
            <span>Total</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
          <button
            onClick={irParaCheckout}
            disabled={itens.length === 0}
            className="mt-6 w-full py-3.5 rounded-xl bg-terracota text-white font-semibold text-sm disabled:opacity-40"
          >
            continuar
          </button>
        </aside>
      </main>
    </div>
  )
}
