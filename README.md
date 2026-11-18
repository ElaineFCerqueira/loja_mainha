# Lene Artes

Loja virtual de peças únicas (roupas e artesanato), feitas à mão.

## Stack
React + Vite + Tailwind + Firebase (Firestore + Auth) + Vercel

## Rodando localmente
```
npm install
cp .env.example .env   # preencher com as credenciais do Firebase
npm run dev
```

## Estrutura
```
src/
  components/   ProductCard.jsx
  context/      AuthContext.jsx, CartContext.jsx
  hooks/        useProdutos.js
  pages/        Vitrine, DetalhePeca, Carrinho, Login, Checkout, Admin
  firebase.js
  App.jsx
```

## Modelo de dados (Firestore)

Coleção `produtos`:
- nome, categoria (`roupas` | `artesanato`), tags, descricao, medidas, preco
- fotos (array de URLs)
- status: `disponivel` | `reservado` | `vendido`
- reservadoAte (Timestamp — usado pra liberar a peça se o carrinho expirar)

## Pagamento (Mercado Pago)

O token de acesso do Mercado Pago fica só no backend (Cloud Functions) — o
frontend usa apenas a chave pública, pra tokenizar o cartão com o Card
Payment Brick.

Configurar antes de usar:
```
firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN
```
E preencher `VITE_MERCADOPAGO_PUBLIC_KEY` no `.env` com a chave pública.

No painel do Mercado Pago, configure a URL do webhook (notifica pagamentos
Pix confirmados depois do QR code gerado) apontando pra:
```
https://<região>-<seu-projeto>.cloudfunctions.net/webhookMercadoPago
```

Fluxo:
- **Pix**: `criarPagamentoPix` gera o QR code; o Checkout escuta o pedido no
  Firestore em tempo real e atualiza a tela sozinho quando o webhook confirma
  o pagamento.
- **Cartão**: o Card Payment Brick tokeniza os dados no navegador (sem passar
  pelo backend); `criarPagamentoCartao` processa o pagamento e já retorna
  aprovado/recusado na hora.
- Em ambos os casos, o preço é **sempre recalculado no backend** a partir do
  Firestore — o valor que o cliente vê nunca é o que decide quanto ele paga.

## Regras de segurança

Os arquivos `firestore.rules` e `storage.rules` já estão prontos, mas **antes de
publicar** troque `TROQUE_PELO_EMAIL_DA_SUA_MAE@exemplo.com` (nos dois arquivos)
pelo e-mail que ela vai usar pra logar como admin — é esse e-mail que dá
permissão real de escrita, a senha do painel é só uma trava extra de UI.

Publicar as regras (precisa do Firebase CLI: `npm install -g firebase-tools`):
```
firebase login
firebase init          # selecione Firestore e Storage, aponte pros arquivos .rules existentes
firebase deploy --only firestore:rules,storage:rules
```

O painel administrativo em `/admin` permite cadastrar peças e mostra faturamento,
vendas confirmadas e visualizações da vitrine e das páginas de produto. Para
publicar a contagem de visualizações e as regras de leitura das métricas:
```
firebase deploy --only functions,firestore:rules
```
As métricas começam a ser contabilizadas após a publicação da função.

## O que falta implementar
- [ ] Página "meus pedidos" pro cliente acompanhar status
- [ ] Cálculo de frete (Melhor Envio ou similar)
- [ ] Validar assinatura do webhook do Mercado Pago (x-signature) pra garantir que a chamada é legítima
- [ ] E-mail de confirmação de compra pro cliente
