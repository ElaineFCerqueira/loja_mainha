import { useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'
import Vitrine from './pages/Vitrine'
import DetalhePeca from './pages/DetalhePeca'
import Carrinho from './pages/Carrinho'
import Login from './pages/Login'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'

function RegistrarVisualizacao() {
  const { pathname } = useLocation()
  const ultimoPath = useRef(null)

  useEffect(() => {
    const pagina = pathname === '/' ? 'vitrine' : /^\/peca\/[^/]+$/.test(pathname) ? 'produto' : null
    if (!pagina || ultimoPath.current === pathname) return

    ultimoPath.current = pathname
    httpsCallable(functions, 'registrarVisualizacao')({ pagina }).catch((erro) => {
      console.error('Não foi possível registrar a visualização da página.', erro)
    })
  }, [pathname])

  return null
}

export default function App() {
  return (
    <>
      <RegistrarVisualizacao />
      <Routes>
        <Route path="/" element={<Vitrine />} />
        <Route path="/peca/:id" element={<DetalhePeca />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  )
}
