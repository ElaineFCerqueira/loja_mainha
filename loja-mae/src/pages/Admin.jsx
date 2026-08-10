import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminForm from '../components/AdminForm'
import AdminProductList from '../components/AdminProductList'
import { useAuth } from '../context/AuthContext'

const CHAVE_SESSAO = 'admin_autenticado'

export default function Admin() {
  const { usuario, carregando } = useAuth()
  const [autenticado, setAutenticado] = useState(false)
  const [senha, setSenha] = useState('')

  useEffect(() => {
    setAutenticado(sessionStorage.getItem(CHAVE_SESSAO) === 'true')
  }, [])

  function handleEntrar(e) {
    e.preventDefault()
    if (senha === import.meta.env.VITE_ADMIN_PASSWORD) {
      sessionStorage.setItem(CHAVE_SESSAO, 'true')
      setAutenticado(true)
    }
  }

  if (carregando) return null

  // primeira trava: precisa estar logada de verdade (é o e-mail dela que
  // as regras do Firestore/Storage conferem — sem isso, os cadastros falham)
  if (!usuario) {
    return (
      <div className="max-w-xs mx-auto mt-24 text-center space-y-3">
        <h1 className="font-display text-2xl mb-2">Painel admin</h1>
        <p className="text-sm text-tinta/60">
          entre com a conta de admin pra continuar
        </p>
        <Link
          to="/login"
          className="inline-block w-full py-3 rounded-xl bg-terracota text-white font-semibold text-sm"
        >
          entrar
        </Link>
      </div>
    )
  }

  // segunda trava: senha extra, só de conveniência
  if (!autenticado) {
    return (
      <form onSubmit={handleEntrar} className="max-w-xs mx-auto mt-24 space-y-3">
        <h1 className="font-display text-2xl text-center mb-4">Painel admin</h1>
        <input
          type="password"
          placeholder="senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full px-3 py-2.5 border border-cru-escuro rounded-lg bg-cru text-sm"
        />
        <button className="w-full py-3 rounded-xl bg-terracota text-white font-semibold text-sm">
          entrar
        </button>
      </form>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-2xl mb-6">Gerenciar peças</h1>

      <div className="grid md:grid-cols-[1fr,1.1fr] gap-8 items-start">
        <AdminForm />

        <div>
          <h2 className="font-display text-lg font-semibold mb-3">Peças cadastradas</h2>
          <AdminProductList />
        </div>
      </div>
    </div>
  )
}
