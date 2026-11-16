# Zaraki Bettas — Loja

Site em React (Vite) para venda de peixes Betta. O cliente monta o pedido no site e é levado ao WhatsApp com o resumo pronto. Depois de enviar, ele vê a chave Pix e o QR Code.

## Rodar no computador

```bash
npm install
npm run dev
```

Abra o endereço que aparecer (geralmente http://localhost:5173).

## Onde editar cada coisa

| O quê | Onde |
|---|---|
| WhatsApp, Instagram, cidade, área de entrega | `src/config.js` |
| Chave Pix, favorecido e banco | `src/config.js` (bloco `pix`) |
| Seção "Sobre a criação" | `src/config.js` (bloco `about`) |
| Peixes, preços, descrições, fotos, vídeos | `src/data/products.js` |
| Depoimentos de clientes | `src/data/depoimentos.js` |
| Logo | `public/logo.jpg` |
| Cores e fontes | topo de `src/index.css` |

## Tarefas do dia a dia

### Cadastrar um peixe novo
1. Salve a foto em `public/peixes/` (formato paisagem 4:3 fica melhor no card).
2. Em `src/data/products.js`, copie o bloco de um peixe parecido e troque `id`, `name`, `tagline`, `description`, `image` e `price`. O `id` não pode se repetir.
3. Para um exemplar único com foto real, use `realPhoto: true`, `stock: 1` e deixe só uma opção em `variants`.

### Mais fotos e vídeo de um peixe
- Fotos extras: `gallery: ['/peixes/nome-2.jpg', '/peixes/nome-3.jpg']`
- Vídeo: salve o `.mp4` em `public/videos/` e preencha `video: '/videos/nome.mp4'`. Prefira vídeos curtos, com menos de 10 MB.

### Marcar um peixe como vendido
Acrescente `sold: true` no bloco do peixe. Ele sai do catálogo e vai para a seção "Vendidos recentemente", com o botão "Avise-me". Para tirar de vez do site, apague o bloco.

### Trocar o peixe em destaque no topo
Coloque `featured: true` em um peixe só. Se quiser uma foto quadrada própria para o destaque, use `heroImage`.

### Publicar um depoimento
Salve a foto do cliente em `public/clientes/` (opcional) e cadastre em `src/data/depoimentos.js`. A seção só aparece quando existe pelo menos um depoimento. Use apenas depoimentos reais e autorizados.

### Ativar a seção "Sobre"
Em `src/config.js`, troque `about: null` pelo bloco de exemplo que está comentado logo acima dele.

## Link direto de cada peixe

Cada peixe tem um endereço próprio, útil para divulgar no Instagram ou WhatsApp:
`https://SEU-SITE/#betta-ID-DO-PEIXE` (exemplo: `#betta-ct-camboja-lt`).
O botão "Compartilhar este peixe", na página de detalhes, copia esse link.

## Contador de visitas

O site já carrega o Web Analytics da Vercel. Para ver os números, entre no painel da Vercel, abra o projeto, clique em **Analytics** e depois em **Enable**.

## Publicar alterações

```bash
git add .
git commit -m "Descreva o que mudou"
git push
```

A Vercel atualiza o site sozinha depois do `git push`.
