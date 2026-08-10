import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Login() {
  const [aba, setAba] = useState('entrar') // 'entrar' | 'cadastrar'
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(null)
  const { entrar, criarConta, entrarComGoogle } = useAuth()
  const { itens } = useCart()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)
    try {
      if (aba === 'entrar') await entrar(email, senha)
      else await criarConta(email, senha)
      navigate('/checkout')
    } catch (e) {
      setErro('Não foi possível entrar. Confira e-mail e senha.')
    }
  }

  async function handleGoogle() {
    try {
      await entrarComGoogle()
      navigate('/checkout')
    } catch (e) {
      setErro('Não foi possível entrar com Google.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-[400px] bg-white rounded-2xl p-9 relative">
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-6 bg-terracota"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)' }}
        />
        <p className="text-center text-xs text-tinta/40 mb-1.5">seu carrinho está guardado</p>
        <h1 className="font-display text-2xl font-semibold text-center">Quase lá</h1>
        <p className="text-center text-sm text-tinta/60 mt-1.5">
          entre ou crie uma conta pra finalizar sua compra
        </p>

        <div className="flex my-6 rounded-lg bg-cru p-1">
          {['entrar', 'cadastrar'].map((opcao) => (
            <button
              key={opcao}
              onClick={() => setAba(opcao)}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${
                aba === opcao ? 'bg-white shadow-sm font-semibold' : 'text-tinta/50'
              }`}
            >
              {opcao === 'entrar' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs text-tinta/60 mb-1.5">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-cru-escuro rounded-lg bg-cru text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-tinta/60 mb-1.5">Senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2.5 border border-cru-escuro rounded-lg bg-cru text-sm"
            />
          </div>

          {erro && <p className="text-vermelho text-sm">{erro}</p>}

          <button type="submit" className="w-full py-3.5 rounded-xl bg-terracota text-white font-semibold text-sm">
            {aba === 'entrar' ? 'entrar e continuar' : 'criar conta e continuar'}
          </button>
        </form>

        <div className="flex items-center gap-2.5 my-5 text-xs text-tinta/40">
          <div className="flex-1 h-px bg-cru-escuro" /> ou <div className="flex-1 h-px bg-cru-escuro" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full py-3 rounded-xl border border-cru-escuro bg-white text-sm font-medium"
        >
          continuar com Google
        </button>

        <p className="text-center text-xs text-tinta/40 mt-4">
          {itens.length} peça(s) esperando por você no carrinho
        </p>
      </div>
    </div>
  )
}
