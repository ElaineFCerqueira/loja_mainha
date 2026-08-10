import { createContext, useContext, useState } from 'react'
import { doc, runTransaction, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

const CartContext = createContext(null)
const MINUTOS_RESERVA = 15

export function CartProvider({ children }) {
  const [itens, setItens] = useState([]) // [{ id, nome, preco, categoria, medidas }]

  // Reserva a peça no Firestore via transação, pra evitar duas pessoas
  // comprando a mesma peça única ao mesmo tempo.
  async function adicionarAoCarrinho(peca) {
    const pecaRef = doc(db, 'produtos', peca.id)

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(pecaRef)
      if (!snap.exists()) throw new Error('Peça não encontrada')

      const dados = snap.data()
      const reservaExpirada =
        !dados.reservadoAte || dados.reservadoAte.toMillis() < Date.now()

      if (dados.status === 'vendido') throw new Error('Peça já vendida')
      if (dados.status === 'reservado' && !reservaExpirada) {
        throw new Error('Peça reservada por outra pessoa no momento')
      }

      const expiraEm = Timestamp.fromMillis(Date.now() + MINUTOS_RESERVA * 60 * 1000)
      transaction.update(pecaRef, { status: 'reservado', reservadoAte: expiraEm })
    })

    setItens((atual) => [...atual, peca])
  }

  async function removerDoCarrinho(id) {
    const pecaRef = doc(db, 'produtos', id)
    await runTransaction(db, async (transaction) => {
      transaction.update(pecaRef, { status: 'disponivel', reservadoAte: null })
    })
    setItens((atual) => atual.filter((item) => item.id !== id))
  }

  const total = itens.reduce((soma, item) => soma + item.preco, 0)

  return (
    <CartContext.Provider value={{ itens, adicionarAoCarrinho, removerDoCarrinho, total }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
