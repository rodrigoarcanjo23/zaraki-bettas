import { useEffect, useMemo, useState } from 'react';
import { ALL_CATEGORIES, ACCESSORY } from '../data/products.js';
import { formatBRL } from '../config.js';
import './painel.css';

// ============================================================
//  PAINEL DO LOJISTA —  SEU-SITE/?painel
//  Cadastra peixes, casais, acessórios, depoimentos e publicações do Instagram.
//  Ao clicar em "Publicar", as alterações vão para o GitHub e a Vercel
//  republica o site em 1 a 2 minutos. A senha é conferida no servidor (api/painel.js).
// ============================================================

const PASS_KEY = 'zaraki-painel';
const MAX_UPLOAD = 3.6 * 1024 * 1024; // limite seguro por publicação

async function api(action, password, extra = {}) {
  let res;
  try {
    res = await fetch('/api/painel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, password, ...extra }),
    });
  } catch {
    throw new Error('Sem conexão com o servidor. Confira a internet e tente de novo.');
  }
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('O painel só funciona no site publicado na Vercel (não no computador com "npm run dev").');
  }
  if (!res.ok) throw new Error(data.error || 'Não foi possível concluir.');
  return data;
}

const slug = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'item';
const rand = () => Math.random().toString(36).slice(2, 7);

// Reduz a foto no próprio navegador antes de enviar (máx. 1400 px, JPEG).
function shrink(file, max = 1400) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * k);
      canvas.height = Math.round(img.height * k);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.84));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não consegui abrir essa imagem. Use JPG ou PNG.'));
    };
    img.src = url;
  });
}

const priceOf = (p, label) => p.variants.find((v) => v.sex === label)?.price ?? '';
const singleLabel = (category) => (category === ACCESSORY ? 'Unidade' : category === 'Casal' ? 'Casal' : null);

function Field({ label, hint, children }) {
  return (
    <label className="pn-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

// Campo de preço: guarda o texto digitado (aceita vírgula) e avisa o valor em número.
function PriceInput({ value, onChange }) {
  const [text, setText] = useState(value === '' ? '' : String(value).replace('.', ','));
  return (
    <input
      inputMode="decimal"
      value={text}
      placeholder="0,00"
      onChange={(e) => {
        const t = e.target.value.replace(/[^0-9.,]/g, '');
        setText(t);
        onChange(t);
      }}
    />
  );
}

function PhotoInput({ label, onPick, busy }) {
  return (
    <label className={`pn-upload ${busy ? 'is-busy' : ''}`}>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          onPick([...e.target.files]);
          e.target.value = '';
        }}
      />
      {busy ? 'Preparando…' : label}
    </label>
  );
}

// ---------- formulário de um item ----------
function Editor({ item, src, onChange, onPhotos, onBack, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const single = singleLabel(item.category);
  const set = (patch) => onChange({ ...item, ...patch });

  const setPrice = (label, value) => {
    const others = item.variants.filter((v) => v.sex !== label);
    const n = Number(String(value).replace(',', '.'));
    const next = value === '' || !Number.isFinite(n) ? others : [...others, { sex: label, price: n }];
    const order = ['Macho', 'Fêmea', 'Casal', 'Unidade'];
    set({ variants: next.sort((a, b) => order.indexOf(a.sex) - order.indexOf(b.sex)) });
  };

  const setCategory = (category) => {
    const s = singleLabel(category);
    const first = item.variants[0]?.price ?? 0;
    const wasSingle = singleLabel(item.category);
    let variants = item.variants;
    if (s) variants = [{ sex: s, price: first }];
    else if (wasSingle) variants = [{ sex: 'Macho', price: first }];
    set({ category, variants });
  };

  const pick = async (files, kind) => {
    setBusy(true);
    try {
      await onPhotos(item, files, kind);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pn-editor">
      <button type="button" className="pn-link" onClick={onBack}>
        ← Voltar para a lista
      </button>
      <h2>{item.name || 'Novo item'}</h2>

      <div className="pn-cols">
        <div className="pn-col">
          <Field label="Nome">
            <input value={item.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ex.: CT Camboja LT" />
          </Field>
          <Field label="Categoria" hint="Casal e Acessório têm um preço só. Acessórios aparecem na seção “Para o aquário”.">
            <select value={item.category} onChange={(e) => setCategory(e.target.value)}>
              {ALL_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Frase curta do card">
            <input value={item.tagline} onChange={(e) => set({ tagline: e.target.value })} placeholder="Ex.: Corpo azul, coroa vermelha" />
          </Field>
          <Field label="Descrição (página de detalhes)">
            <textarea rows="3" value={item.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
          <div className="pn-row">
            <Field label="Tamanho">
              <input value={item.size} onChange={(e) => set({ size: e.target.value })} placeholder="5–6 cm" />
            </Field>
            <Field label="Idade">
              <input value={item.age} onChange={(e) => set({ age: e.target.value })} placeholder="4 meses" />
            </Field>
          </div>
          <div className="pn-row">
            {single ? (
              <Field label={single === 'Casal' ? 'Preço do casal (R$)' : 'Preço (R$)'}>
                <PriceInput key={single} value={priceOf(item, single)} onChange={(t) => setPrice(single, t)} />
              </Field>
            ) : (
              <>
                <Field label="Preço macho (R$)" hint="Deixe vazio se não vende.">
                  <PriceInput value={priceOf(item, 'Macho')} onChange={(t) => setPrice('Macho', t)} />
                </Field>
                <Field label="Preço fêmea (R$)" hint="Deixe vazio se não vende.">
                  <PriceInput value={priceOf(item, 'Fêmea')} onChange={(t) => setPrice('Fêmea', t)} />
                </Field>
              </>
            )}
          </div>
          <Field label="Selo vermelho (opcional)" hint="Ex.: Raro, Novidade, Mais pedido.">
            <input value={item.badge || ''} onChange={(e) => set({ badge: e.target.value || null })} />
          </Field>
        </div>

        <div className="pn-col">
          <span className="pn-label">Foto principal</span>
          <div className="pn-photo">
            {item.image ? <img src={src(item.image)} alt="" /> : <span>Sem foto: o site mostra uma ilustração.</span>}
          </div>
          <div className="pn-actions">
            <PhotoInput label={item.image ? 'Trocar foto' : 'Escolher foto'} busy={busy} onPick={(f) => pick(f.slice(0, 1), 'main')} />
            {item.image && (
              <button type="button" className="pn-btn" onClick={() => set({ image: null, heroImage: undefined })}>
                Remover
              </button>
            )}
          </div>

          <span className="pn-label">Fotos extras ({(item.gallery || []).length})</span>
          <div className="pn-thumbs">
            {(item.gallery || []).map((g) => (
              <div key={g} className="pn-thumb">
                <img src={src(g)} alt="" />
                <button type="button" aria-label="Remover foto" onClick={() => set({ gallery: item.gallery.filter((x) => x !== g) })}>
                  ×
                </button>
              </div>
            ))}
            <PhotoInput label="+ Fotos" busy={busy} onPick={(f) => pick(f, 'gallery')} />
          </div>

          <Field label="Vídeo (opcional)" hint="Envie o .mp4 para public/videos pelo GitHub e escreva aqui: /videos/nome.mp4">
            <input value={item.video || ''} onChange={(e) => set({ video: e.target.value || null })} placeholder="/videos/nome.mp4" />
          </Field>

          <label className="pn-check">
            <input type="checkbox" checked={Boolean(item.realPhoto)} onChange={(e) => set({ realPhoto: e.target.checked })} />
            Foto real (o cliente recebe exatamente este peixe)
          </label>
          <label className="pn-check">
            <input type="checkbox" checked={item.stock === 1} onChange={(e) => set({ stock: e.target.checked ? 1 : undefined })} />
            Exemplar único (só 1 por pedido)
          </label>
          <label className="pn-check">
            <input type="checkbox" checked={Boolean(item.sold)} onChange={(e) => set({ sold: e.target.checked })} />
            Vendido (vai para “Vendidos recentemente”)
          </label>
        </div>
      </div>

      <div className="pn-danger">
        {confirm ? (
          <>
            <span>Excluir “{item.name}” do site?</span>
            <button type="button" className="pn-btn is-red" onClick={onDelete}>
              Sim, excluir
            </button>
            <button type="button" className="pn-btn" onClick={() => setConfirm(false)}>
              Cancelar
            </button>
          </>
        ) : (
          <button type="button" className="pn-link is-red" onClick={() => setConfirm(true)}>
            Excluir este item
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- painel ----------
export default function Painel() {
  const [password, setPassword] = useState(() => {
    try {
      return sessionStorage.getItem(PASS_KEY) || '';
    } catch {
      return '';
    }
  });
  const [typed, setTyped] = useState('');
  const [catalog, setCatalog] = useState(null);
  const [files, setFiles] = useState({}); // fotos novas, ainda não publicadas: caminho → dataURL
  const [sent, setSent] = useState(() => new Set()); // fotos já enviadas nesta sessão
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'ok' | 'erro', text }
  const [tab, setTab] = useState('itens');
  const [editing, setEditing] = useState(null);

  const load = async (pass) => {
    setBusy(true);
    setMsg(null);
    try {
      const data = await api('carregar', pass);
      setCatalog({ products: [], depoimentos: [], instagramPosts: [], ...data.catalog });
      setPassword(pass);
      try {
        sessionStorage.setItem(PASS_KEY, pass);
      } catch {
        /* sem armazenamento */
      }
    } catch (err) {
      setMsg({ type: 'erro', text: err.message });
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    document.title = 'Painel | Zaraki Bettas';
    if (password) load(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const warn = (e) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const change = (next) => {
    setCatalog(next);
    setDirty(true);
    setMsg(null);
  };
  const src = (path) => files[path] || path;
  const pendingBytes = useMemo(
    () => Object.entries(files).reduce((s, [path, d]) => s + (sent.has(path) ? 0 : d.length), 0),
    [files, sent]
  );

  const addFiles = async (picked, folder, base) => {
    const added = {};
    for (const f of picked) {
      const dataUrl = await shrink(f);
      added[`/${folder}/${slug(base)}-${rand()}.jpg`] = dataUrl;
    }
    if (pendingBytes + Object.values(added).reduce((s, d) => s + d.length, 0) > MAX_UPLOAD) {
      throw new Error('Muitas fotos de uma vez. Clique em “Publicar” e depois envie as outras.');
    }
    setFiles((old) => ({ ...old, ...added }));
    return Object.keys(added);
  };

  const updateProduct = (item) => change({ ...catalog, products: catalog.products.map((p) => (p.id === item.id ? item : p)) });

  const onPhotos = async (item, picked, kind) => {
    try {
      const paths = await addFiles(picked, 'peixes', item.name || 'peixe');
      if (kind === 'main') updateProduct({ ...item, image: paths[0], heroImage: undefined, imagePos: undefined });
      else updateProduct({ ...item, gallery: [...(item.gallery || []), ...paths].slice(0, 8) });
    } catch (err) {
      setMsg({ type: 'erro', text: err.message });
    }
  };

  const newProduct = () => {
    const item = {
      id: `item-${rand()}${rand()}`, name: '', category: 'Crowntail', tagline: '', description: '',
      size: '', age: '', badge: null, image: null, gallery: [], video: null, variants: [{ sex: 'Macho', price: 0 }],
    };
    change({ ...catalog, products: [item, ...catalog.products] });
    setEditing(item.id);
  };

  const move = (id, dir) => {
    const list = [...catalog.products];
    const i = list.findIndex((p) => p.id === id);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    change({ ...catalog, products: list });
  };

  const publish = async () => {
    const nameless = catalog.products.find((p) => !p.name.trim());
    if (nameless) {
      setEditing(nameless.id);
      setTab('itens');
      setMsg({ type: 'erro', text: 'Há um item sem nome. Preencha o nome ou exclua o item.' });
      return;
    }
    const priceless = catalog.products.find((p) => !p.variants.length);
    if (priceless) {
      setEditing(priceless.id);
      setTab('itens');
      setMsg({ type: 'erro', text: `“${priceless.name}” está sem preço.` });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      // só envia as fotos que continuam em uso
      const used = JSON.stringify(catalog);
      const upload = Object.entries(files)
        .filter(([path]) => !sent.has(path) && used.includes(`"${path}"`))
        .map(([path, base64]) => ({ path, base64 }));
      const data = await api('salvar', password, { catalog, files: upload });
      setCatalog({ products: [], depoimentos: [], instagramPosts: [], ...data.catalog });
      setSent((old) => new Set([...old, ...upload.map((f) => f.path)]));
      setDirty(false);
      setMsg({ type: 'ok', text: 'Publicado. O site atualiza sozinho em 1 a 2 minutos.' });
      // as fotos novas continuam em pré-visualização até o site ser republicado
    } catch (err) {
      setMsg({ type: 'erro', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  // ---------- tela de entrada ----------
  if (!catalog) {
    return (
      <main className="pn pn-login">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (typed) load(typed);
          }}
        >
          <img src="/logo.jpg" alt="" />
          <h1>Painel Zaraki Bettas</h1>
          <Field label="Senha do painel">
            <input type="password" value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus autoComplete="current-password" />
          </Field>
          {msg && <p className={`pn-msg is-${msg.type}`}>{msg.text}</p>}
          <button type="submit" className="pn-btn is-primary" disabled={busy || !typed}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
          <a href="/" className="pn-link">
            ← Voltar para o site
          </a>
        </form>
      </main>
    );
  }

  const editingItem = catalog.products.find((p) => p.id === editing);

  return (
    <main className="pn">
      <header className="pn-top">
        <div className="pn-top-in">
          <strong>Painel Zaraki Bettas</strong>
          <a href="/" target="_blank" rel="noopener noreferrer" className="pn-link">
            Ver o site
          </a>
          <span className="pn-grow" />
          {dirty && <span className="pn-dirty">Alterações não publicadas</span>}
          <button type="button" className="pn-btn is-primary" onClick={publish} disabled={busy || !dirty}>
            {busy ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
      </header>

      <div className="pn-body">
        {msg && <p className={`pn-msg is-${msg.type}`}>{msg.text}</p>}

        {!editingItem && (
          <nav className="pn-tabs">
            {[
              ['itens', `Peixes e produtos (${catalog.products.length})`],
              ['depoimentos', `Depoimentos (${catalog.depoimentos.length})`],
              ['instagram', `Instagram (${catalog.instagramPosts.length})`],
            ].map(([id, label]) => (
              <button key={id} type="button" className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>
                {label}
              </button>
            ))}
          </nav>
        )}

        {editingItem && (
          <Editor
            item={editingItem}
            src={src}
            onChange={updateProduct}
            onPhotos={onPhotos}
            onBack={() => setEditing(null)}
            onDelete={() => {
              change({ ...catalog, products: catalog.products.filter((p) => p.id !== editingItem.id) });
              setEditing(null);
            }}
          />
        )}

        {!editingItem && tab === 'itens' && (
          <>
            <button type="button" className="pn-btn is-primary" onClick={newProduct}>
              + Novo peixe ou produto
            </button>
            <p className="pn-hint">A ordem desta lista é a ordem do catálogo. Use as setas para reordenar.</p>
            <ul className="pn-list">
              {catalog.products.map((p, i) => (
                <li key={p.id} className={p.sold ? 'is-sold' : ''}>
                  <div className="pn-pic">{p.image && <img src={src(p.image)} alt="" />}</div>
                  <div className="pn-info">
                    <strong>{p.name || '(sem nome)'}</strong>
                    <span>
                      {p.category} · {p.variants.map((v) => `${v.sex} ${formatBRL(v.price)}`).join(' / ') || 'sem preço'}
                    </span>
                    <span className="pn-tags">
                      {p.featured && <em className="is-red">Destaque do topo</em>}
                      {p.sold && <em>Vendido</em>}
                      {p.realPhoto && <em>Foto real</em>}
                    </span>
                  </div>
                  <div className="pn-row-actions">
                    <button type="button" className="pn-btn" onClick={() => setEditing(p.id)}>
                      Editar
                    </button>
                    <button type="button" className="pn-btn" onClick={() => updateProduct({ ...p, sold: !p.sold })}>
                      {p.sold ? 'Voltar à venda' : 'Marcar vendido'}
                    </button>
                    {p.category !== ACCESSORY && !p.featured && (
                      <button
                        type="button"
                        className="pn-btn"
                        onClick={() =>
                          change({ ...catalog, products: catalog.products.map((x) => ({ ...x, featured: x.id === p.id ? true : undefined })) })
                        }
                      >
                        Destacar
                      </button>
                    )}
                    <button type="button" className="pn-btn is-icon" onClick={() => move(p.id, -1)} disabled={i === 0} aria-label="Subir">
                      ↑
                    </button>
                    <button
                      type="button"
                      className="pn-btn is-icon"
                      onClick={() => move(p.id, 1)}
                      disabled={i === catalog.products.length - 1}
                      aria-label="Descer"
                    >
                      ↓
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {!editingItem && tab === 'depoimentos' && (
          <>
            <button
              type="button"
              className="pn-btn is-primary"
              onClick={() => change({ ...catalog, depoimentos: [{ name: '', city: '', text: '', photo: null }, ...catalog.depoimentos] })}
            >
              + Novo depoimento
            </button>
            <p className="pn-hint">
              Use só depoimentos reais e autorizados pelo cliente. A seção aparece no site quando houver pelo menos um com nome e texto.
            </p>
            {catalog.depoimentos.map((d, i) => {
              const setD = (patch) =>
                change({ ...catalog, depoimentos: catalog.depoimentos.map((x, k) => (k === i ? { ...x, ...patch } : x)) });
              return (
                <div key={i} className="pn-card">
                  <div className="pn-row">
                    <Field label="Nome do cliente">
                      <input value={d.name} onChange={(e) => setD({ name: e.target.value })} placeholder="Maria S." />
                    </Field>
                    <Field label="Cidade ou bairro">
                      <input value={d.city || ''} onChange={(e) => setD({ city: e.target.value })} placeholder="Fortaleza" />
                    </Field>
                  </div>
                  <Field label="O que o cliente disse">
                    <textarea rows="2" value={d.text} onChange={(e) => setD({ text: e.target.value })} />
                  </Field>
                  <div className="pn-actions">
                    {d.photo && <img className="pn-mini" src={src(d.photo)} alt="" />}
                    <PhotoInput
                      label={d.photo ? 'Trocar foto' : 'Foto do peixe no aquário (opcional)'}
                      onPick={async (f) => {
                        try {
                          const [path] = await addFiles(f.slice(0, 1), 'clientes', d.name || 'cliente');
                          setD({ photo: path });
                        } catch (err) {
                          setMsg({ type: 'erro', text: err.message });
                        }
                      }}
                    />
                    <span className="pn-grow" />
                    <button
                      type="button"
                      className="pn-link is-red"
                      onClick={() => change({ ...catalog, depoimentos: catalog.depoimentos.filter((_, k) => k !== i) })}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {!editingItem && tab === 'instagram' && (
          <>
            <p className="pn-hint">
              Cole o link de cada publicação que deve aparecer no site (abra a publicação no Instagram → ⋯ → Copiar link). O perfil precisa
              ser público. Até 12 publicações.
            </p>
            {catalog.instagramPosts.map((url, i) => (
              <div key={i} className="pn-actions">
                <input
                  className="pn-grow"
                  value={url}
                  placeholder="https://www.instagram.com/p/..."
                  onChange={(e) => change({ ...catalog, instagramPosts: catalog.instagramPosts.map((x, k) => (k === i ? e.target.value : x)) })}
                />
                <button
                  type="button"
                  className="pn-link is-red"
                  onClick={() => change({ ...catalog, instagramPosts: catalog.instagramPosts.filter((_, k) => k !== i) })}
                >
                  Remover
                </button>
              </div>
            ))}
            {catalog.instagramPosts.length < 12 && (
              <button type="button" className="pn-btn is-primary" onClick={() => change({ ...catalog, instagramPosts: [...catalog.instagramPosts, ''] })}>
                + Adicionar publicação
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
