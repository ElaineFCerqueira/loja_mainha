import { Routes, Route } from 'react-router-dom'
import Loja from '../src2/pages/Loja.jsx'
import DetalhePeca from './pages/DetalhePeca'
import Login from './pages/Login'
import Admin from './pages/Admin'
import { useProdutos } from './hooks/useProdutos'

export default function App() {
  const { produtos, carregando } = useProdutos()

  return (
    <Routes>
      <Route path="/" element={<Loja produtos={produtos} carregando={carregando} />} />
      <Route path="/loja" element={<Loja produtos={produtos} carregando={carregando} />} />
      <Route path="/peca/:id" element={<DetalhePeca />} />
      <Route path="/carrinho" element={<Loja produtos={produtos} carregando={carregando} abrirCarrinho />} />
      <Route path="/login" element={<Login />} />
      <Route path="/checkout" element={<Loja produtos={produtos} carregando={carregando} rotaInicial="/checkout" />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
