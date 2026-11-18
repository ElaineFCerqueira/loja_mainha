import { useEffect, useState } from 'react'
import { collection, onSnapshot, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

const STATUS_LABEL = {
  disponivel: { texto: 'disponível', cor: 'text-verde' },
  reservado: { texto: 'reservado', cor: 'text-amarelo' },
  vendido: { texto: 'vendido', cor: 'text-vermelho' },
}

export default function AdminProductList() {
  const [produtos, setProdutos] = useState([])
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'produtos'), orderBy('dataCriacao', 'desc'))
    return onSnapshot(q, (snap) => {
      setProdutos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setErro(null)
    }, () => setErro('Não foi possível carregar as peças cadastradas.'))
  }, [])

  async function alternarStatus(peca) {
    const novoStatus = peca.status === 'vendido' ? 'disponivel' : 'vendido'
    await updateDoc(doc(db, 'produtos', peca.id), { status: novoStatus, reservadoAte: null })
  }

  async function excluir(peca) {
    if (!confirm(`Excluir "${peca.nome}"? Essa ação não pode ser desfeita.`)) return
    await deleteDoc(doc(db, 'produtos', peca.id))
  }

  if (produtos.length === 0) {
    if (erro) return <p className="text-vermelho text-sm">{erro}</p>
    return <p className="text-tinta/40 text-sm">nenhuma peça cadastrada ainda</p>
  }

  return (
    <div className="space-y-3">
      {produtos.map((peca) => (
        <div key={peca.id} className="bg-white rounded-xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-cru-escuro shrink-0 overflow-hidden">
            {peca.fotos?.[0] && (
              <img src={peca.fotos[0]} alt={peca.nome} className="w-full h-full object-cover" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base truncate">{peca.nome}</h3>
            <p className="text-xs text-tinta/50 mt-0.5">
              {peca.categoria} · R$ {peca.preco?.toFixed(2)}
            </p>
            <p className={`text-xs mt-0.5 font-medium ${STATUS_LABEL[peca.status]?.cor}`}>
              {STATUS_LABEL[peca.status]?.texto}
            </p>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              onClick={() => alternarStatus(peca)}
              className="text-xs px-3 py-1.5 rounded-lg border border-cru-escuro font-medium"
            >
              {peca.status === 'vendido' ? 'marcar disponível' : 'marcar vendida'}
            </button>
            <button onClick={() => excluir(peca)} className="text-xs text-vermelho underline">
              excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
