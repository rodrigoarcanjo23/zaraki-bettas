// ============================================================
//  API do painel do lojista (função da Vercel).
//  Recebe as alterações feitas em  SEU-SITE/?painel  e grava no GitHub.
//  A Vercel republica o site sozinha a cada gravação (1 a 2 minutos).
//
//  Variáveis de ambiente (Vercel → Settings → Environment Variables):
//    ADMIN_PASSWORD   senha do painel (escolha uma senha longa)
//    GITHUB_TOKEN     token do GitHub com permissão de escrita no repositório
//    GITHUB_REPO      opcional, padrão "rodrigoarcanjo23/zaraki-bettas"
//    GITHUB_BRANCH    opcional, padrão "main"
// ============================================================
import crypto from 'node:crypto';

const REPO = process.env.GITHUB_REPO || 'rodrigoarcanjo23/zaraki-bettas';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const CATALOG_PATH = 'src/data/catalog.json';
const MAX_FILE_BYTES = 3 * 1024 * 1024;
const CATEGORIES = ['Crowntail', 'Halfmoon', 'Dumbo', 'Plakat', 'Veiltail', 'Outro', 'Casal', 'Acessório'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function passwordOk(given) {
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected || typeof given !== 'string') return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

async function gh(path, options = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'zaraki-bettas-painel',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `GitHub respondeu ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------- validação do que chega do painel ----------
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const mediaPath = (v, folders) => {
  const s = str(v, 200);
  return new RegExp(`^/(${folders})/[A-Za-z0-9._-]+\\.(jpg|jpeg|png|webp|mp4)$`).test(s) ? s : null;
};

function cleanProduct(p) {
  const id = str(p.id, 60).toLowerCase();
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`Identificador inválido: "${p.id}"`);
  const name = str(p.name, 80);
  if (!name) throw new Error('Todo item precisa de um nome.');
  const category = CATEGORIES.includes(p.category) ? p.category : 'Outro';
  const variants = (Array.isArray(p.variants) ? p.variants : [])
    .map((v) => ({ sex: str(v.sex, 20), price: Math.round(Number(v.price) * 100) / 100 }))
    .filter((v) => v.sex && Number.isFinite(v.price) && v.price >= 0 && v.price < 100000)
    .slice(0, 4);
  if (!variants.length) throw new Error(`"${name}" precisa de pelo menos um preço.`);
  const out = {
    id,
    name,
    category,
    tagline: str(p.tagline, 120),
    size: str(p.size, 30),
    age: str(p.age, 30),
    badge: str(p.badge, 24) || null,
    image: mediaPath(p.image, 'peixes'),
    gallery: (Array.isArray(p.gallery) ? p.gallery : []).map((g) => mediaPath(g, 'peixes')).filter(Boolean).slice(0, 8),
    video: mediaPath(p.video, 'videos'),
    variants,
    description: str(p.description, 600),
  };
  if (p.realPhoto) out.realPhoto = true;
  if (p.featured) out.featured = true;
  if (p.sold) out.sold = true;
  if (Number(p.stock) >= 1) out.stock = Math.min(99, Math.floor(Number(p.stock)));
  if (mediaPath(p.heroImage, 'peixes')) out.heroImage = mediaPath(p.heroImage, 'peixes');
  if (typeof p.imagePos === 'string' && /^\d{1,3}% \d{1,3}%$/.test(p.imagePos)) out.imagePos = p.imagePos;
  // cores da ilustração usada quando não há foto (mantidas como estavam)
  if (p.art && typeof p.art === 'object') {
    const hex = (c) => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c);
    const pair = (a) => Array.isArray(a) && a.length === 2 && a.every(hex);
    if (['crown', 'half', 'plakat'].includes(p.art.tail) && pair(p.art.body) && pair(p.art.fin)) {
      out.art = { tail: p.art.tail, body: p.art.body, fin: p.art.fin, ears: pair(p.art.ears) ? p.art.ears : false };
      if (p.art.scales) out.art.scales = true;
      if (p.art.koi) out.art.koi = true;
    }
  }
  return out;
}

function cleanCatalog(c) {
  if (!c || !Array.isArray(c.products)) throw new Error('Catálogo inválido.');
  if (c.products.length > 300) throw new Error('Catálogo grande demais.');
  const products = c.products.map(cleanProduct);
  const ids = new Set(products.map((p) => p.id));
  if (ids.size !== products.length) throw new Error('Há dois itens com o mesmo identificador.');
  let featured = false;
  products.forEach((p) => {
    if (p.featured && featured) delete p.featured; // só um destaque
    if (p.featured) featured = true;
  });
  const depoimentos = (Array.isArray(c.depoimentos) ? c.depoimentos : [])
    .map((d) => ({ name: str(d.name, 60), city: str(d.city, 60), text: str(d.text, 500), photo: mediaPath(d.photo, 'clientes') }))
    .filter((d) => d.name && d.text)
    .slice(0, 30);
  const instagramPosts = (Array.isArray(c.instagramPosts) ? c.instagramPosts : [])
    .map((u) => str(u, 200))
    .filter((u) => /^https:\/\/(www\.)?instagram\.com\/([A-Za-z0-9_.]+\/)?(p|reel|tv)\/[A-Za-z0-9_-]+\/?/.test(u))
    .slice(0, 12);
  return { products, depoimentos, instagramPosts };
}

function cleanFiles(files) {
  return (Array.isArray(files) ? files : []).slice(0, 12).map((f) => {
    const path = mediaPath(f.path, 'peixes|clientes');
    if (!path || path.endsWith('.mp4')) throw new Error('Arquivo de foto com nome inválido.');
    const base64 = str(f.base64, MAX_FILE_BYTES * 2).replace(/^data:[^,]+,/, '');
    const bytes = Buffer.from(base64, 'base64');
    if (!bytes.length || bytes.length > MAX_FILE_BYTES) throw new Error('Foto vazia ou grande demais (máximo 3 MB).');
    const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8;
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
    const isWebp = bytes.subarray(8, 12).toString() === 'WEBP';
    if (!isJpg && !isPng && !isWebp) throw new Error('O arquivo enviado não é uma imagem válida.');
    return { path: `public${path}`, base64: bytes.toString('base64') };
  });
}

// ---------- ações ----------
async function carregar() {
  const file = await gh(`/contents/${CATALOG_PATH}?ref=${encodeURIComponent(BRANCH)}`);
  return { catalog: JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')) };
}

// Grava catálogo e fotos em UM commit só, para a Vercel publicar uma vez.
async function salvar(body) {
  const catalog = cleanCatalog(body.catalog);
  const files = cleanFiles(body.files);
  const ref = await gh(`/git/ref/heads/${encodeURIComponent(BRANCH)}`);
  const parent = ref.object.sha;
  const commit = await gh(`/git/commits/${parent}`);
  const tree = [
    { path: CATALOG_PATH, mode: '100644', type: 'blob', content: JSON.stringify(catalog, null, 2) + '\n' },
  ];
  for (const f of files) {
    const blob = await gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content: f.base64, encoding: 'base64' }) });
    tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const newTree = await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: commit.tree.sha, tree }) });
  const newCommit = await gh('/git/commits', {
    method: 'POST',
    body: JSON.stringify({ message: 'Painel: atualiza o catálogo', tree: newTree.sha, parents: [parent] }),
  });
  await gh(`/git/refs/heads/${encodeURIComponent(BRANCH)}`, { method: 'PATCH', body: JSON.stringify({ sha: newCommit.sha }) });
  return { ok: true, catalog };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  if (!process.env.ADMIN_PASSWORD || !process.env.GITHUB_TOKEN) {
    return res.status(503).json({
      error: 'O painel ainda não foi configurado. Cadastre ADMIN_PASSWORD e GITHUB_TOKEN na Vercel (veja o README).',
    });
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  if (!passwordOk(body.password)) {
    await sleep(800); // dificulta tentativa de adivinhar a senha
    return res.status(401).json({ error: 'Senha incorreta.' });
  }
  try {
    if (body.action === 'carregar') return res.status(200).json(await carregar());
    if (body.action === 'salvar') return res.status(200).json(await salvar(body));
    return res.status(400).json({ error: 'Ação desconhecida.' });
  } catch (err) {
    const fromGitHub = Boolean(err.status);
    const msg =
      err.status === 401 || err.status === 403
        ? 'O GitHub recusou o token. Confira o GITHUB_TOKEN na Vercel (permissão de escrita em "Contents").'
        : err.status === 404
          ? 'Repositório ou arquivo não encontrado no GitHub. Confira GITHUB_REPO e GITHUB_BRANCH.'
          : err.status === 409 || err.status === 422
            ? 'O site foi alterado por outro caminho ao mesmo tempo. Recarregue o painel e tente de novo.'
            : err.message;
    return res.status(fromGitHub ? 502 : 400).json({ error: msg });
  }
}
