import { useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc } from 'firebase/firestore'
import { storage, db } from '../firebase'

const VAZIO = {
  nome: '',
  categoria: 'roupas',
  tags: '',
  descricao: '',
  medidas: '',
  preco: '',
}

export default function AdminForm({ aoCadastrar }) {
  const [campos, setCampos] = useState(VAZIO)
  const [fotos, setFotos] = useState([]) // File[]
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  function atualizar(campo, valor) {
    setCampos((atual) => ({ ...atual, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (fotos.length === 0) {
      setErro('Adicione pelo menos uma foto da peça.')
      return
    }
    setErro(null)
    setEnviando(true)

    try {
      // 1. sobe cada foto pro Storage e pega a URL pública
      const urls = await Promise.all(
        fotos.map(async (arquivo) => {
          const caminho = `produtos/${Date.now()}-${arquivo.name}`
          const storageRef = ref(storage, caminho)
          await uploadBytes(storageRef, arquivo)
          return getDownloadURL(storageRef)
        })
      )

      // 2. cria o documento da peça no Firestore
      await addDoc(collection(db, 'produtos'), {
        nome: campos.nome,
        categoria: campos.categoria,
        tags: campos.tags.split(',').map((t) => t.trim()).filter(Boolean),
        descricao: campos.descricao,
        medidas: campos.medidas,
        preco: parseFloat(campos.preco),
        fotos: urls,
        status: 'disponivel',
        reservadoAte: null,
        dataCriacao: new Date(),
      })

      setCampos(VAZIO)
      setFotos([])
      aoCadastrar?.()
    } catch (e) {
      setErro('Não foi possível cadastrar a peça. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-4">
      <h2 className="font-display text-xl font-semibold">Nova peça</h2>

      <div>
        <label className="block text-xs text-tinta/60 mb-1.5">Fotos</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFotos(Array.from(e.target.files))}
          className="w-full text-sm"
        />
        {fotos.length > 0 && (
          <p className="text-xs text-tinta/40 mt-1">{fotos.length} foto(s) selecionada(s)</p>
        )}
      </div>

      <div>
        <label className="block text-xs text-tinta/60 mb-1.5">Nome da peça</label>
        <input
          required
          value={campos.nome}
          onChange={(e) => atualizar('nome', e.target.value)}
          className="w-full px-3 py-2.5 border border-cru-escuro rounded-lg bg-cru text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-tinta/60 mb-1.5">Categoria</label>
          <select
            value={campos.categoria}
            onChange={(e) => atualizar('categoria', e.target.value)}
            className="w-full px-3 py-2.5 border border-cru-escuro rounded-lg bg-cru text-sm"
          >
            <option value="roupas">Roupas</option>
            <option value="artesanato">Artesanato</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-tinta/60 mb-1.5">Preço (R$)</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={campos.preco}
            onChange={(e) => atualizar('preco', e.target.value)}
            className="w-full px-3 py-2.5 border border-cru-escuro rounded-lg bg-cru text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-tinta/60 mb-1.5">Tags (separadas por vírgula)</label>
        <input
          placeholder="bordado, midi, feito à mão"
          value={campos.tags}
          onChange={(e) => atualizar('tags', e.target.value)}
          className="w-full px-3 py-2.5 border border-cru-escuro rounded-lg bg-cru text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-tinta/60 mb-1.5">Medidas</label>
        <input
          placeholder="busto 90cm · comprimento 105cm"
          value={campos.medidas}
          onChange={(e) => atualizar('medidas', e.target.value)}
          className="w-full px-3 py-2.5 border border-cru-escuro rounded-lg bg-cru text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-tinta/60 mb-1.5">Descrição</label>
        <textarea
          rows={3}
          value={campos.descricao}
          onChange={(e) => atualizar('descricao', e.target.value)}
          className="w-full px-3 py-2.5 border border-cru-escuro rounded-lg bg-cru text-sm"
        />
      </div>

      {erro && <p className="text-vermelho text-sm">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="w-full py-3.5 rounded-xl bg-terracota text-white font-semibold text-sm disabled:opacity-50"
      >
        {enviando ? 'cadastrando…' : 'cadastrar peça'}
      </button>
    </form>
  )
}
