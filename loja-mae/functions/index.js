const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const admin = require('firebase-admin')
const { MercadoPagoConfig, Payment } = require('mercadopago')

admin.initializeApp()
const db = admin.firestore()

const MP_ACCESS_TOKEN = defineSecret('MERCADOPAGO_ACCESS_TOKEN')

function clienteMercadoPago() {
  return new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN.value() })
}

// Nunca confiamos no preço que vem do cliente — o valor do pedido é sempre
// recalculado a partir do que está no Firestore agora.
async function montarItensPedido(produtoIds) {
  if (!Array.isArray(produtoIds) || produtoIds.length === 0) {
    throw new HttpsError('invalid-argument', 'Nenhuma peça informada.')
  }

  const itens = []
  for (const id of produtoIds) {
    const snap = await db.collection('produtos').doc(id).get()
    if (!snap.exists) throw new HttpsError('not-found', `Peça não encontrada.`)

    const dados = snap.data()
    const reservaValida = dados.reservadoAte && dados.reservadoAte.toMillis() > Date.now()
    if (dados.status !== 'reservado' || !reservaValida) {
      throw new HttpsError('failed-precondition', `A peça "${dados.nome}" não está mais disponível.`)
    }
    itens.push({ id, nome: dados.nome, preco: dados.preco })
  }
  return itens
}

async function marcarPecasVendidas(ids) {
  const batch = db.batch()
  ids.forEach((id) =>
    batch.update(db.collection('produtos').doc(id), { status: 'vendido', reservadoAte: null })
  )
  await batch.commit()
}

async function liberarPecas(ids) {
  const batch = db.batch()
  ids.forEach((id) =>
    batch.update(db.collection('produtos').doc(id), { status: 'disponivel', reservadoAte: null })
  )
  await batch.commit()
}

// Cria um pagamento Pix e devolve o QR code pro frontend exibir.
exports.criarPagamentoPix = onCall({ secrets: [MP_ACCESS_TOKEN] }, async (request) => {
  const { produtoIds, pagador } = request.data
  const itens = await montarItensPedido(produtoIds)
  const total = itens.reduce((soma, item) => soma + item.preco, 0)

  const payment = new Payment(clienteMercadoPago())
  const resultado = await payment.create({
    body: {
      transaction_amount: total,
      payment_method_id: 'pix',
      description: 'Fitas & Retalhos',
      payer: {
        email: pagador.email,
        first_name: pagador.nome,
        identification: { type: 'CPF', number: pagador.cpf },
      },
    },
  })

  const pedidoRef = await db.collection('pedidos').add({
    itens,
    total,
    metodoPagamento: 'pix',
    mercadoPagoId: resultado.id,
    status: 'aguardando_pagamento',
    usuarioId: request.auth?.uid ?? null,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
  })

  const dadosPix = resultado.point_of_interaction.transaction_data
  return {
    pedidoId: pedidoRef.id,
    qrCodeBase64: dadosPix.qr_code_base64,
    copiaECola: dadosPix.qr_code,
  }
})

// Cria um pagamento com cartão a partir do token gerado pelo Card Payment
// Brick no frontend (o número do cartão nunca passa pelo nosso backend).
exports.criarPagamentoCartao = onCall({ secrets: [MP_ACCESS_TOKEN] }, async (request) => {
  const { produtoIds, pagador, token, parcelas, metodoPagamentoId, emissorId } = request.data
  const itens = await montarItensPedido(produtoIds)
  const total = itens.reduce((soma, item) => soma + item.preco, 0)

  const payment = new Payment(clienteMercadoPago())
  const resultado = await payment.create({
    body: {
      transaction_amount: total,
      token,
      installments: parcelas,
      payment_method_id: metodoPagamentoId,
      issuer_id: emissorId,
      payer: { email: pagador.email, identification: pagador.identification },
    },
  })

  const pedidoRef = await db.collection('pedidos').add({
    itens,
    total,
    metodoPagamento: 'cartao',
    mercadoPagoId: resultado.id,
    status: resultado.status === 'approved' ? 'pago' : 'recusado',
    usuarioId: request.auth?.uid ?? null,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
  })

  if (resultado.status === 'approved') {
    await marcarPecasVendidas(itens.map((item) => item.id))
  } else {
    await liberarPecas(itens.map((item) => item.id))
  }

  return { pedidoId: pedidoRef.id, status: resultado.status, statusDetail: resultado.status_detail }
})

// Webhook: o Mercado Pago chama essa URL quando o status de um pagamento muda
// (principal caso de uso: Pix que foi pago depois do QR code gerado).
exports.webhookMercadoPago = onRequest({ secrets: [MP_ACCESS_TOKEN] }, async (req, res) => {
  const paymentId = req.body?.data?.id
  if (!paymentId) return res.status(200).send('ok')

  const payment = new Payment(clienteMercadoPago())
  const resultado = await payment.get({ id: paymentId })

  const pedidosSnap = await db
    .collection('pedidos')
    .where('mercadoPagoId', '==', Number(paymentId))
    .limit(1)
    .get()
  if (pedidosSnap.empty) return res.status(200).send('ok')

  const pedidoDoc = pedidosSnap.docs[0]
  const pedido = pedidoDoc.data()
  const idsPecas = pedido.itens.map((item) => item.id)

  if (resultado.status === 'approved' && pedido.status !== 'pago') {
    await pedidoDoc.ref.update({ status: 'pago' })
    await marcarPecasVendidas(idsPecas)
  } else if (['rejected', 'cancelled'].includes(resultado.status) && pedido.status === 'aguardando_pagamento') {
    await pedidoDoc.ref.update({ status: 'recusado' })
    await liberarPecas(idsPecas)
  }

  res.status(200).send('ok')
})
