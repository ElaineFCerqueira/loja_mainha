import { useEffect, useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { doc, onSnapshot } from 'firebase/firestore'
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react'
import { functions, db } from '../firebase'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

initMercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY)

export default function Checkout() {
  const { itens, total } = useCart()
  const { usuario } = useAuth()
  const [metodo, setMetodo] = useState('pix')
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState(null)
  const [pix, setPix] = useState(null) // { pedidoId, qrCodeBase64, copiaECola }
  const [pedidoPago, setPedidoPago] = useState(false)

  const produtoIds = itens.map((item) => item.id)

  // Fica ouvindo o pedido do Pix — quando o webhook confirmar o pagamento
  // no backend, o status muda no Firestore e a tela atualiza sozinha.
  useEffect(() => {
    if (!pix?.pedidoId) return
    const unsubscribe = onSnapshot(doc(db, 'pedidos', pix.pedidoId), (snap) => {
      if (snap.data()?.status === 'pago') setPedidoPago(true)
    })
    return unsubscribe
  }, [pix?.pedidoId])

  async function handleGerarPix(e) {
    e.preventDefault()
    setErro(null)
    setProcessando(true)
    try {
      const criarPagamentoPix = httpsCallable(functions, 'criarPagamentoPix')
      const { data } = await criarPagamentoPix({
        produtoIds,
        pagador: { nome, cpf, email: usuario?.email },
      })
      setPix(data)
    } catch (e) {
      setErro(e.message || 'Não foi possível gerar o Pix. Tente de novo.')
    } finally {
      setProcessando(false)
    }
  }

  async function handlePagamentoCartao(dadosCartao) {
    setErro(null)
    setProcessando(true)
    try {
      const criarPagamentoCartao = httpsCallable(functions, 'criarPagamentoCartao')
      const { data } = await criarPagamentoCartao({
        produtoIds,
        pagador: {
          email: dadosCartao.payer.email,
          identification: dadosCartao.payer.identification,
        },
        token: dadosCartao.token,
        parcelas: dadosCartao.installments,
        metodoPagamentoId: dadosCartao.payment_method_id,
        emissorId: dadosCartao.issuer_id,
      })

      if (data.status === 'approved') setPedidoPago(true)
      else setErro('Pagamento não aprovado. Tente outro cartão.')
    } catch (e) {
      setErro(e.message || 'Não foi possível processar o pagamento.')
    } finally {
      setProcessando(false)
    }
  }

  if (pedidoPago) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold text-verde">Pagamento confirmado!</h1>
        <p className="text-tinta/60 mt-3">
          Sua encomenda foi separada. Você vai receber os detalhes do envio por e-mail.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-center py-9">Finalizar pedido</h1>

      <main className="max-w-lg mx-auto px-6 pb-16 bg-white rounded-2xl p-7">
        <div className="flex justify-between text-sm py-1.5 text-tinta/60">
          <span>Subtotal ({itens.length} peça(s))</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold border-t border-cru-escuro mt-2 pt-3">
          <span>Total</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>

        <div className="flex gap-2.5 mt-6">
          {['pix', 'cartao'].map((opcao) => (
            <button
              key={opcao}
              onClick={() => { setMetodo(opcao); setPix(null); setErro(null) }}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium ${
                metodo === opcao
                  ? 'border-terracota bg-terracota/10 text-terracota font-semibold'
                  : 'border-cru-escuro'
              }`}
            >
              {opcao === 'pix' ? 'Pix' : 'Cartão'}
            </button>
          ))}
        </div>

        {erro && <p className="text-vermelho text-sm mt-4">{erro}</p>}

        {/* --- PIX --- */}
        {metodo === 'pix' && !pix && (
          <form onSubmit={handleGerarPix} className="space-y-3.5 mt-5">
            <div>
              <label className="block text-xs text-tinta/60 mb-1.5">Nome completo</label>
              <input
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2.5 border border-cru-escuro rounded-lg bg-cru text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-tinta/60 mb-1.5">CPF</label>
              <input
                required
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-3 py-2.5 border border-cru-escuro rounded-lg bg-cru text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={processando}
              className="w-full py-3.5 rounded-xl bg-terracota text-white font-semibold text-sm disabled:opacity-50"
            >
              {processando ? 'gerando Pix…' : 'gerar Pix'}
            </button>
          </form>
        )}

        {metodo === 'pix' && pix && (
          <div className="text-center mt-6">
            <img
              src={`data:image/png;base64,${pix.qrCodeBase64}`}
              alt="QR code Pix"
              className="w-48 h-48 mx-auto rounded-lg border border-cru-escuro"
            />
            <p className="text-xs text-tinta/50 mt-3">escaneie com o app do seu banco</p>

            <button
              onClick={() => navigator.clipboard.writeText(pix.copiaECola)}
              className="mt-4 w-full py-3 rounded-xl border border-cru-escuro text-sm font-medium"
            >
              copiar código Pix
            </button>
            <p className="text-xs text-tinta/40 mt-4">
              assim que o pagamento cair, essa tela atualiza sozinha
            </p>
          </div>
        )}

        {/* --- CARTÃO --- */}
        {metodo === 'cartao' && (
          <div className="mt-5">
            <CardPayment
              initialization={{ amount: total }}
              onSubmit={handlePagamentoCartao}
              onError={() => setErro('Confira os dados do cartão.')}
              customization={{ visual: { style: { theme: 'bootstrap' } } }}
            />
          </div>
        )}

        <p className="text-xs text-tinta/40 text-center mt-5">
          ao confirmar, verificamos se as peças ainda estão disponíveis
        </p>
      </main>
    </div>
  )
}
