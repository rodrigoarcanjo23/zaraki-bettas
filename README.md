# Zaraki Bettas — Loja

Site em React (Vite) para venda de peixes Betta. O cliente monta o pedido no site e é levado ao WhatsApp com o resumo pronto. Depois de enviar, ele vê a chave Pix e o QR Code.

## Rodar no computador

```bash
npm install
npm run dev
```

Abra o endereço que aparecer (geralmente http://localhost:5173).

## Painel do lojista (cadastrar sem mexer em código)

Endereço: `https://SEU-SITE/?painel` (também há o link "Área do lojista" no rodapé).

No painel você cadastra e edita peixes, casais e acessórios, envia fotos e vídeos direto do celular (gravando na hora ou escolhendo da galeria), marca como vendido, escolhe o destaque do topo, reordena o catálogo, cadastra depoimentos e escolhe as publicações do Instagram que aparecem no site. Ao clicar em **Publicar**, o site atualiza sozinho em 1 a 2 minutos.

### Configurar o painel (uma vez só)

1. **Criar o token do GitHub**
   - No GitHub: foto do perfil → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
   - *Repository access*: **Only select repositories** → escolha `zaraki-bettas`.
   - *Permissions* → *Repository permissions* → **Contents: Read and write**.
   - Gere e copie o token (começa com `github_pat_`). Ele só aparece uma vez.
2. **Cadastrar na Vercel**
   - Projeto → **Settings** → **Environment Variables** e crie:
     - `ADMIN_PASSWORD`: a senha que você vai usar para entrar no painel. Escolha uma senha longa.
     - `GITHUB_TOKEN`: o token copiado no passo 1.
   - Depois vá em **Deployments** → no último deploy, **⋯** → **Redeploy**.
3. **Ligar o envio de fotos e vídeos pelo celular (Vercel Blob)**
   - Na Vercel, abra o projeto → **Storage** → **Create Database** (ou **Connect Store**) → **Blob** → **Create**.
   - Conecte ao projeto `zaraki-bettas` (ambiente **Production**). A Vercel cria sozinha a variável `BLOB_READ_WRITE_TOKEN`.
   - Faça um novo deploy (**Deployments** → **⋯** → **Redeploy**).
4. Abra `https://SEU-SITE/?painel` e entre com a senha.

Importante:
- Não escreva a senha nem o token em nenhum arquivo do projeto. Eles ficam só na Vercel.
- O painel grava direto no GitHub. Antes de alterar arquivos no computador, rode `git pull` para baixar o que foi feito pelo painel.
- Fotos e vídeos enviados pelo painel ficam guardados no Vercel Blob. As fotos são reduzidas no próprio celular antes de subir (ficam com 200 a 500 KB).
- Vídeos: até 60 MB cada (cerca de 30 segundos em 1080p). Vídeos curtos carregam mais rápido para o cliente e gastam menos da cota gratuita da Vercel.
- Quando uma foto ou vídeo é trocado ou removido e você publica, o arquivo antigo é apagado do Blob para não ocupar espaço.
- O plano gratuito da Vercel tem limite de armazenamento e de tráfego do Blob por mês. Acompanhe em **Storage** → seu Blob → **Usage**.
- Sem o Blob conectado, o painel continua funcionando: as fotos vão pelo GitHub (umas 8 por publicação) e o envio de vídeo fica desligado.
- O painel só funciona no site publicado, não com `npm run dev`.

## Onde editar cada coisa (pelos arquivos)

| O quê | Onde |
|---|---|
| WhatsApp, Instagram, cidade, área de entrega | `src/config.js` |
| Chave Pix, favorecido e banco | `src/config.js` (bloco `pix`) |
| Seção "Sobre a criação" | `src/config.js` (bloco `about`) |
| Peixes, casais, acessórios, depoimentos, Instagram | painel, ou `src/data/catalog.json` |
| Logo | `public/logo.jpg` |
| Cores e fontes | topo de `src/index.css` |

A lista de campos de cada item do catálogo está explicada no topo de `src/data/products.js`.

## Como o site trata cada tipo de item

- **Peixes** (Crowntail, Halfmoon, Dumbo, Plakat, Veiltail, Outro): aparecem no catálogo, com preço de macho e de fêmea.
- **Casal**: aparece no catálogo com um preço só, no filtro "Casal".
- **Acessório** (ração, condicionador, aquários): aparece na seção "Para o aquário", logo abaixo do catálogo. A seção só existe quando há pelo menos um acessório.
- **Vendido**: sai do catálogo e vai para "Vendidos recentemente", com o botão "Avise-me".
- **Destaque do topo**: um item por vez.
- **Depoimentos** e **publicações do Instagram**: as seções só mostram conteúdo depois de cadastrado.

### Ativar a seção "Sobre"
Em `src/config.js`, troque `about: null` pelo bloco de exemplo que está comentado logo acima dele.

## Link direto de cada peixe

Cada peixe tem um endereço próprio, útil para divulgar no Instagram ou WhatsApp:
`https://SEU-SITE/#betta-ID-DO-PEIXE` (exemplo: `#betta-ct-camboja-lt`).
O botão "Compartilhar", na página de detalhes, copia esse link.

## Contador de visitas

O site já carrega o Web Analytics da Vercel. Para ver os números, entre no painel da Vercel, abra o projeto, clique em **Analytics** e depois em **Enable**.

## Publicar alterações

```bash
git pull
git add .
git commit -m "Descreva o que mudou"
git push
```

A Vercel atualiza o site sozinha depois do `git push`.
