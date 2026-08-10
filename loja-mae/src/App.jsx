import { Routes, Route } from 'react-router-dom'
import Vitrine from './pages/Vitrine'
import DetalhePeca from './pages/DetalhePeca'
import Carrinho from './pages/Carrinho'
import Login from './pages/Login'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Vitrine />} />
      <Route path="/peca/:id" element={<DetalhePeca />} />
      <Route path="/carrinho" element={<Carrinho />} />
      <Route path="/login" element={<Login />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
