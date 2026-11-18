import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export function useProdutos(categoria) {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const base = collection(db, 'produtos')
    const q =
      categoria && categoria !== 'todas'
        ? query(base, where('status', '==', 'disponivel'), where('categoria', '==', categoria))
        : query(base, where('status', '==', 'disponivel'))

    const unsubscribe = onSnapshot(q, (snap) => {
      setProdutos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setCarregando(false)
      setErro(null)
    }, () => {
      setProdutos([])
      setCarregando(false)
      setErro('Não foi possível carregar as peças.')
    })

    return unsubscribe
  }, [categoria])

  return { produtos, carregando, erro }
}
