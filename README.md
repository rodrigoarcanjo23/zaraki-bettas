# Zaraki Bettas — Loja

Landing page em React (Vite) para venda de peixes Betta. O cliente monta o pedido no site e é levado ao WhatsApp com o resumo pronto, onde você combina pagamento e entrega.

## Rodar no computador

```bash
npm install
npm run dev
```

Abra o endereço que aparecer (geralmente http://localhost:5173).

## O que editar

| O quê | Onde |
|---|---|
| Número do WhatsApp, Instagram, cidade | `src/config.js` |
| Peixes, preços, descrições, fotos | `src/data/products.js` |
| Logo | `public/logo.jpg` |
| Cores e fontes | topo de `src/index.css` |

### Colocar as fotos reais
1. Salve as fotos em `public/peixes/` (ex.: `public/peixes/camboja.jpg`).
2. No peixe correspondente em `src/data/products.js`, troque `image: null` por `image: '/peixes/camboja.jpg'`.

Enquanto `image` for `null`, o site mostra uma ilustração do betta.

## Publicar (GitHub + Vercel)

```bash
git init
git add .
git commit -m "Site Zaraki Bettas"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/zaraki-bettas.git
git push -u origin main
```

Na Vercel: **Add New → Project → Import** o repositório. Ela detecta Vite sozinha (build `npm run build`, saída `dist`). Clique em **Deploy**.
# zaraki-bettas
