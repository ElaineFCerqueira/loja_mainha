import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useCart } from '../context/CartContext'

export default function DetalhePeca() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { adicionarAoCarrinho } = useCart()
  const [peca, setPeca] = useState(null)
  const [erro, setErro] = useState(null)
  const [erroCarrinho, setErroCarrinho] = useState(null)

  useEffect(() => {
    let ativo = true

    getDoc(doc(db, 'produtos', id))
      .then((snap) => {
        if (!ativo) return
        if (snap.exists()) {
          setPeca({ id: snap.id, ...snap.data() })
          setErro(null)
          return
        }

        setErro('Peça não encontrada.')
      })
      .catch(() => {
        if (ativo) setErro('Não foi possível carregar esta peça.')
      })

    return () => {
      ativo = false
    }
  }, [id])

  async function handleAdicionar() {
    setErroCarrinho(null)
    try {
      await adicionarAoCarrinho(peca)
      navigate('/carrinho')
    } catch (e) {
      setErroCarrinho(e.message)
    }
  }

  if (!peca && !erro) return <p className="text-center py-20 text-tinta/40">carregando…</p>

  if (erro) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold text-vermelho">Peça indisponível</h1>
        <p className="text-tinta/60 mt-3">{erro}</p>
        <Link to="/" className="inline-block mt-6 text-sm text-terracota underline">
          voltar para a vitrine
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className="inline-block m-7 text-sm text-tinta/50">← voltar pra vitrine</Link>

      <main className="max-w-4xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-14">
        <div
          className="aspect-[4/5] rounded-2xl p-2.5"
          style={{ background: 'conic-gradient(#1B4D8C 0deg 340deg, transparent 340deg 360deg)' }}
        >
          {peca.fotos?.[0] ? (
            <img
              src={peca.fotos[0]}
              alt={peca.nome}
              className="w-full h-full rounded-xl object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-xl bg-cru-escuro flex items-center justify-center text-tinta/30 font-display">
              foto principal
            </div>
          )}
        </div>

        <div>
          <span className="text-[11px] uppercase tracking-wide text-vermelho font-semibold">
            peça única · não será refeita
          </span>
          <h1 className="font-display text-3xl font-semibold mt-2">{peca.nome}</h1>
          <p className="font-display text-2xl text-terracota mt-3">R$ {peca.preco?.toFixed(2)}</p>

          <div className="w-14 h-[3px] my-5 rounded bg-verde/60" />

          <p className="text-sm text-tinta/70 leading-relaxed">{peca.descricao}</p>

          {peca.medidas && (
            <p className="text-sm text-tinta/50 mt-4">{peca.medidas}</p>
          )}

          <button
            onClick={handleAdicionar}
            className="mt-8 w-full py-4 rounded-xl bg-terracota text-white font-semibold text-sm"
          >
            adicionar ao carrinho
          </button>
          {erroCarrinho && <p className="text-vermelho text-sm mt-2 text-center">{erroCarrinho}</p>}
          <p className="text-xs text-tinta/40 text-center mt-3">
            peça única — ao comprar, sai da vitrine
          </p>
        </div>
      </main>
    </div>
  )
}
