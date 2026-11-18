import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '../firebase'

const MOEDA = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const DATA = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
})
const DIA_SEMANA = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  timeZone: 'America/Sao_Paulo',
})

function chaveData(data) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(data)
  const valores = Object.fromEntries(partes.map(({ type, value }) => [type, value]))
  return `${valores.year}-${valores.month}-${valores.day}`
}

function gerarUltimosDias(quantidade) {
  return Array.from({ length: quantidade }, (_, indice) => {
    const data = new Date()
    data.setDate(data.getDate() - (quantidade - indice - 1))
    const chave = chaveData(data)
    const dataLocal = new Date(`${chave}T12:00:00-03:00`)
    return { chave, rotulo: DIA_SEMANA.format(dataLocal) }
  })
}

function dataDoPedido(pedido) {
  return pedido.criadoEm?.toDate ? pedido.criadoEm.toDate() : null
}

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState([])
  const [visualizacoes, setVisualizacoes] = useState(0)
  const [dias, setDias] = useState([])
  const [carregandoPedidos, setCarregandoPedidos] = useState(true)
  const [carregandoVisualizacoes, setCarregandoVisualizacoes] = useState(true)
  const [erroPedidos, setErroPedidos] = useState('')
  const [errosVisualizacoes, setErrosVisualizacoes] = useState({ total: '', dias: '' })

  useEffect(() => {
    const cancelarPedidos = onSnapshot(
      query(collection(db, 'pedidos'), orderBy('criadoEm', 'desc')),
      (snapshot) => {
        setPedidos(snapshot.docs.map((pedido) => ({ id: pedido.id, ...pedido.data() })))
        setErroPedidos('')
        setCarregandoPedidos(false)
      },
      (erro) => {
        console.error('Não foi possível carregar os pedidos.', erro)
        setErroPedidos('Não foi possível carregar as vendas. Confira as regras do Firestore.')
        setCarregandoPedidos(false)
      }
    )
    const cancelarTotal = onSnapshot(
      doc(db, 'metricas', 'visualizacoes'),
      (snapshot) => {
        setVisualizacoes(snapshot.data()?.total ?? 0)
        setErrosVisualizacoes((atuais) => ({ ...atuais, total: '' }))
        setCarregandoVisualizacoes(false)
      },
      (erro) => {
        console.error('Não foi possível carregar o total de visualizações.', erro)
        setErrosVisualizacoes((atuais) => ({
          ...atuais,
          total: 'Não foi possível carregar as visualizações. Confira as regras do Firestore.',
        }))
        setCarregandoVisualizacoes(false)
      }
    )
    const cancelarDias = onSnapshot(
      query(collection(db, 'metricas_diarias'), orderBy('data', 'desc'), limit(7)),
      (snapshot) => {
        setDias(snapshot.docs.map((dia) => dia.data()))
        setErrosVisualizacoes((atuais) => ({ ...atuais, dias: '' }))
        setCarregandoVisualizacoes(false)
      },
      (erro) => {
        console.error('Não foi possível carregar as visualizações recentes.', erro)
        setErrosVisualizacoes((atuais) => ({
          ...atuais,
          dias: 'Não foi possível carregar as visualizações recentes. Confira as regras do Firestore.',
        }))
        setCarregandoVisualizacoes(false)
      }
    )

    return () => {
      cancelarPedidos()
      cancelarTotal()
      cancelarDias()
    }
  }, [])

  const vendas = useMemo(() => pedidos.filter((pedido) => pedido.status === 'pago'), [pedidos])
  const faturamento = useMemo(
    () => vendas.reduce((total, pedido) => total + (Number(pedido.total) || 0), 0),
    [vendas]
  )
  const visualizacoesPorDia = useMemo(
    () => new Map(dias.map((dia) => [dia.data, dia.visualizacoes || 0])),
    [dias]
  )
  const ultimosDias = useMemo(() => gerarUltimosDias(7), [])
  const totalSeteDias = ultimosDias.reduce(
    (total, dia) => total + (visualizacoesPorDia.get(dia.chave) || 0),
    0
  )
  const maiorDia = Math.max(1, ...ultimosDias.map((dia) => visualizacoesPorDia.get(dia.chave) || 0))
  const ultimasVendas = vendas.slice(0, 5)
  const erroVisualizacoes = errosVisualizacoes.total || errosVisualizacoes.dias

  return (
    <section aria-labelledby="dashboard-titulo">
      <h2 id="dashboard-titulo" className="font-display text-2xl mb-4">Visão geral</h2>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <article className="rounded-2xl bg-white p-5">
          <p className="text-sm text-tinta/60">Faturamento confirmado</p>
          <p className="font-display text-2xl font-semibold mt-2">
            {carregandoPedidos ? '…' : MOEDA.format(faturamento)}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-5">
          <p className="text-sm text-tinta/60">Vendas confirmadas</p>
          <p className="font-display text-2xl font-semibold mt-2">
            {carregandoPedidos ? '…' : vendas.length}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-5">
          <p className="text-sm text-tinta/60">Visualizações totais</p>
          <p className="font-display text-2xl font-semibold mt-2">
            {carregandoVisualizacoes ? '…' : visualizacoes}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-5">
          <p className="text-sm text-tinta/60">Visualizações nos últimos 7 dias</p>
          <p className="font-display text-2xl font-semibold mt-2">
            {carregandoVisualizacoes ? '…' : totalSeteDias}
          </p>
        </article>
      </div>

      {(erroPedidos || erroVisualizacoes) && (
        <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-vermelho space-y-1">
          {erroPedidos && <p>{erroPedidos}</p>}
          {erroVisualizacoes && <p>{erroVisualizacoes}</p>}
        </div>
      )}

      <div className="grid lg:grid-cols-[0.8fr,1.2fr] gap-6 mt-6">
        <section className="rounded-2xl bg-white p-5" aria-labelledby="visualizacoes-titulo">
          <h3 id="visualizacoes-titulo" className="font-display text-lg font-semibold">
            Visitas por dia
          </h3>
          <div className="space-y-3 mt-5">
            {ultimosDias.map((dia) => {
              const quantidade = visualizacoesPorDia.get(dia.chave) || 0
              return (
                <div key={dia.chave} className="grid grid-cols-[2.5rem,1fr,2.5rem] items-center gap-3 text-xs">
                  <span className="capitalize text-tinta/60">{dia.rotulo.replace('.', '')}</span>
                  <div className="h-2.5 rounded-full bg-cru overflow-hidden">
                    <div
                      className="h-full rounded-full bg-terracota"
                      style={{ width: `${(quantidade / maiorDia) * 100}%` }}
                    />
                  </div>
                  <span className="text-right tabular-nums">{quantidade}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5" aria-labelledby="vendas-recentes-titulo">
          <h3 id="vendas-recentes-titulo" className="font-display text-lg font-semibold">
            Vendas recentes
          </h3>
          {carregandoPedidos ? (
            <p className="text-sm text-tinta/50 mt-4">carregando vendas…</p>
          ) : ultimasVendas.length === 0 ? (
            <p className="text-sm text-tinta/50 mt-4">nenhuma venda confirmada ainda</p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-tinta/50">
                  <tr>
                    <th className="font-medium pb-2 pr-3">Data</th>
                    <th className="font-medium pb-2 pr-3">Peças</th>
                    <th className="font-medium pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasVendas.map((pedido) => {
                    const data = dataDoPedido(pedido)
                    return (
                      <tr key={pedido.id} className="border-t border-cru-escuro">
                        <td className="py-3 pr-3 whitespace-nowrap">
                          {data ? DATA.format(data) : '—'}
                        </td>
                        <td className="py-3 pr-3">
                          {pedido.itens?.map((item) => item.nome).join(', ') || '—'}
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          {MOEDA.format(Number(pedido.total) || 0)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
