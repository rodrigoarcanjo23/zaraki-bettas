import { useCallback, useEffect, useMemo, useState } from 'react';
import BettaArt from './components/BettaArt.jsx';
import ProductCard from './components/ProductCard.jsx';
import ProductModal from './components/ProductModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import {
  IconBag, IconWhatsApp, IconTruck, IconShield, IconDrop, IconCrown, IconInstagram, IconCheck, IconClose,
} from './components/Icons.jsx';
import { PRODUCTS, CATEGORIES } from './data/products.js';
import { STORE, whatsappLink, formatBRL } from './config.js';

const LOGO = '/logo.jpg';
const CART_KEY = 'zaraki-cart';

// Carrega o carrinho salvo e descarta peixes que saíram do catálogo ou foram vendidos.
function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return raw
      .map((item) => {
        const product = PRODUCTS.find((p) => p.id === item.id && !p.sold);
        const variant = product?.variants.find((v) => v.sex === item.sex);
        if (!product || !variant) return null;
        const qty = product.stock ? Math.min(item.qty, product.stock) : item.qty;
        return {
          key: item.key, id: product.id, name: product.name, sex: variant.sex, price: variant.price,
          art: product.art, image: product.image, stock: product.stock || null, qty,
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

const minPrice = (p) => Math.min(...p.variants.map((v) => v.price));
// preço mostrado no card (primeira opção), usado na ordenação
const cardPrice = (p) => p.variants[0].price;
const HERO_FISH = PRODUCTS.find((p) => p.featured && !p.sold) || PRODUCTS.find((p) => !p.sold) || PRODUCTS[0];

const SORTS = [
  { id: 'destaque', label: 'Destaques primeiro' },
  { id: 'menor', label: 'Menor preço' },
  { id: 'maior', label: 'Maior preço' },
  { id: 'nome', label: 'Nome (A–Z)' },
];

const NAV = [
  { href: '#peixes', label: 'Peixes' },
  { href: '#caudas', label: 'Guia de caudas' },
  { href: '#como-comprar', label: 'Como comprar' },
  { href: '#cuidados', label: 'Cuidados' },
];

const TAILS = [
  {
    name: 'Crowntail',
    abbr: 'CT',
    text: 'Os raios das nadadeiras passam da membrana e formam pontas, como uma coroa. É a cauda mais dramática quando o peixe se exibe.',
    art: { tail: 'crown', body: ['#e32a3a', '#8e0a1e'], fin: ['#ef2a3a', '#6a0616'], ears: false },
  },
  {
    name: 'Halfmoon',
    abbr: 'HM',
    text: 'A cauda abre em 180°, formando uma meia-lua. Nadadeiras longas e delicadas, que pedem água parada e sem objetos pontiagudos.',
    art: { tail: 'half', body: ['#2a3550', '#0d1220'], fin: ['#3a8fd6', '#0b0f1a'], ears: false },
  },
  {
    name: 'Dumbo',
    abbr: 'Big Ear',
    text: 'As nadadeiras peitorais são bem maiores que o normal e batem como orelhas de elefante. Pode vir com qualquer tipo de cauda.',
    art: { tail: 'half', body: ['#d9785a', '#9b3fa8'], fin: ['#a8329c', '#f4eef6'], ears: ['#ffffff', '#e4dbe8'] },
  },
];

const GLOSSARY = [
  ['CT', 'Crowntail, cauda em coroa.'],
  ['HM', 'Halfmoon, cauda em meia-lua.'],
  ['LT', 'Long Tail, nadadeiras longas.'],
  ['Macho', 'Nadadeiras maiores e cores mais fortes. Vive sozinho.'],
  ['Fêmea', 'Nadadeiras curtas e corpo mais arredondado.'],
];

const KIT = [
  'Aquário de 10 litros ou mais, com tampa (bettas pulam)',
  'Aquecedor com termostato, ajustado em 26–28 °C',
  'Filtro de fluxo fraco ou trocas parciais toda semana',
  'Condicionador para remover o cloro da água',
  'Plantas naturais ou de seda, sem pontas que rasguem as nadadeiras',
  'Ração específica para bettas, em grãos pequenos',
];

const ACCLIMATION = [
  { t: 'Boie o saquinho', d: 'Ainda fechado, deixe o saco flutuar no aquário por 15 a 20 minutos para igualar a temperatura.' },
  { t: 'Misture as águas aos poucos', d: 'Abra o saco e acrescente meio copo de água do aquário a cada 5 minutos, por uns 20 minutos.' },
  { t: 'Solte só o peixe', d: 'Passe o betta para o aquário com uma redinha. Descarte a água do saco, não despeje no aquário.' },
  { t: 'Dê um dia de descanso', d: 'Deixe a luz apagada e não alimente nas primeiras 24 horas. É normal ele ficar tímido no começo.' },
];

const FAQ = [
  {
    q: 'Como o peixe chega até mim?',
    a: 'Embalamos em saco duplo com água condicionada e oxigênio, dentro de caixa térmica. Você pode retirar com a gente ou receber em casa, com o valor da entrega combinado pelo WhatsApp.',
  },
  {
    q: 'Vocês enviam para outras cidades?',
    a: `Por enquanto entregamos apenas em ${STORE.deliveryArea}.`,
  },
  {
    q: 'E se o peixe chegar morto?',
    a: 'Grave um vídeo abrindo a embalagem e nos envie em até 2 horas após o recebimento. Repomos o peixe ou devolvemos o valor.',
  },
  {
    q: 'O peixe que recebo é o mesmo da foto?',
    a: 'Nos peixes com o selo “Foto real”, sim: é exatamente aquele exemplar. Nos demais, a foto é de referência da linhagem e mandamos foto e vídeo do seu peixe pelo WhatsApp antes de fechar.',
  },
  {
    q: 'Posso colocar dois machos no mesmo aquário?',
    a: 'Não. Machos brigam até se ferir. Cada macho precisa de um aquário só para ele. Fêmeas podem viver em grupo de 5 ou mais em aquário plantado.',
  },
  {
    q: 'Quais formas de pagamento vocês aceitam?',
    a: 'Pix, cartão e dinheiro na retirada. Depois de enviar o pedido, você já vê a chave Pix e o QR Code. O pagamento é feito depois que confirmamos o peixe e a entrega pelo WhatsApp.',
  },
];

export default function App() {
  const [cart, setCart] = useState(loadCart);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState('Todos');
  const [sort, setSort] = useState('destaque');
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* armazenamento indisponível */
    }
  }, [cart]);

  useEffect(() => {
    document.body.style.overflow = open || detail ? 'hidden' : '';
  }, [open, detail]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback(
    (product, variant) => {
      if (product.sold) return;
      const key = `${product.id}-${variant.sex}`;
      const found = cart.find((i) => i.key === key);
      if (found && product.stock && found.qty >= product.stock) {
        setToast(`${product.name} já está no seu pedido (temos só ${product.stock})`);
        return;
      }
      setCart((c) => {
        if (c.some((i) => i.key === key)) return c.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
        return [
          ...c,
          {
            key, id: product.id, name: product.name, sex: variant.sex, price: variant.price,
            art: product.art, image: product.image, stock: product.stock || null, qty: 1,
          },
        ];
      });
      setToast(`${product.name} (${variant.sex}) adicionado`);
    },
    [cart]
  );

  const setQty = (key, qty) =>
    setCart((c) =>
      qty <= 0
        ? c.filter((i) => i.key !== key)
        : c.map((i) => (i.key === key ? { ...i, qty: i.stock ? Math.min(qty, i.stock) : qty } : i))
    );
  const remove = (key) => setCart((c) => c.filter((i) => i.key !== key));
  const clear = () => setCart([]);
  const close = useCallback(() => setOpen(false), []);
  const closeDetail = useCallback(() => setDetail(null), []);

  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const shown = useMemo(() => {
    const list = filter === 'Todos' ? [...PRODUCTS] : PRODUCTS.filter((p) => p.category === filter);
    if (sort === 'menor') list.sort((a, b) => cardPrice(a) - cardPrice(b));
    if (sort === 'maior') list.sort((a, b) => cardPrice(b) - cardPrice(a));
    if (sort === 'nome') list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    // vendidos sempre por último
    return list.sort((a, b) => Boolean(a.sold) - Boolean(b.sold));
  }, [filter, sort]);

  const realCount = PRODUCTS.filter((p) => p.realPhoto && !p.sold).length;
  const heroSingle = HERO_FISH.variants.length === 1;

  return (
    <>
      <a href="#peixes" className="skip-link">
        Ir para o catálogo
      </a>

      {/* ---------- Faixa de avisos ---------- */}
      <div className="announce">
        <div className="wrap announce-inner">
          <span>Entregamos em {STORE.deliveryArea}</span>
          <span className="announce-sep" aria-hidden="true">·</span>
          <span>Enviamos foto e vídeo do seu peixe antes de fechar</span>
        </div>
      </div>

      {/* ---------- Cabeçalho ---------- */}
      <header className="topbar">
        <div className="wrap topbar-inner">
          <a href="#inicio" className="brand" aria-label="Zaraki Bettas, início">
            <img src={LOGO} alt="" className="brand-logo" />
            <span className="brand-word">
              <span className="brand-z">Zaraki</span>
              <span className="brand-b">bettas</span>
            </span>
          </a>
          <nav className={`nav ${menu ? 'is-open' : ''}`} aria-label="Seções do site">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenu(false)}>
                {n.label}
              </a>
            ))}
          </nav>
          <button type="button" className="cart-btn" onClick={() => setOpen(true)} aria-label={`Abrir pedido, ${count} itens`}>
            <IconBag />
            <span className="cart-btn-label">Pedido</span>
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>
          <button
            type="button"
            className="icon-btn menu-btn"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
          >
            {menu ? (
              <IconClose />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main>
        {/* ---------- Hero ---------- */}
        <section className="hero" id="inicio">
          <div className="bubbles" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} style={{ '--i': i }} />
            ))}
          </div>
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Criação selecionada · {STORE.city}</p>
              <h1>
                Bettas que parecem <em>pintados à mão</em>
              </h1>
              <p className="lead">
                Crowntail, Halfmoon, Dumbo e outras linhagens criadas com cuidado, alimentação
                reforçada e água tratada. Escolha o seu, monte o pedido e finalize com a gente pelo WhatsApp.
              </p>
              <div className="hero-cta">
                <a href="#peixes" className="btn btn-red btn-lg">
                  Ver peixes disponíveis
                </a>
                <a
                  href={whatsappLink(`Olá, ${STORE.name}! Vim pelo site e queria tirar uma dúvida.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-lg"
                >
                  <IconWhatsApp /> Tirar dúvida
                </a>
              </div>
              <dl className="hero-facts">
                <div>
                  <dt>{PRODUCTS.filter((p) => !p.sold).length}</dt>
                  <dd>bettas no catálogo</dd>
                </div>
                <div>
                  <dt>26–28 °C</dt>
                  <dd>água em que são criados</dd>
                </div>
                <div>
                  <dt>Garantia</dt>
                  <dd>de chegada viva</dd>
                </div>
              </dl>
            </div>

            <div className="hero-visual">
              <button
                type="button"
                className="medallion"
                onClick={() => setDetail(HERO_FISH)}
                aria-label={`Ver detalhes de ${HERO_FISH.name}`}
              >
                <span className="medallion-water">
                  {HERO_FISH.image ? (
                    <img src={HERO_FISH.heroImage || HERO_FISH.image} alt={`Betta ${HERO_FISH.name}`} className="hero-photo" />
                  ) : (
                    <BettaArt art={HERO_FISH.art} className="hero-fish" />
                  )}
                </span>
              </button>
              <div className="hero-tag">
                <span className="hero-tag-kicker">
                  Destaque{HERO_FISH.realPhoto ? ' · foto real' : ''}
                </span>
                <strong>Betta {HERO_FISH.name}</strong>
                <span>
                  {heroSingle ? '' : 'a partir de '}
                  {formatBRL(minPrice(HERO_FISH))}
                  {HERO_FISH.stock === 1 ? ' · exemplar único' : ''}
                </span>
                <span className="hero-tag-actions">
                  <button type="button" className="btn btn-red" onClick={() => add(HERO_FISH, HERO_FISH.variants[0])}>
                    Quero este
                  </button>
                  <button type="button" className="link-btn" onClick={() => setDetail(HERO_FISH)}>
                    Ver detalhes
                  </button>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Diferenciais ---------- */}
        <section className="perks" aria-label="Por que comprar na Zaraki">
          <div className="wrap perks-grid">
            <div className="perk">
              <IconCrown />
              <div>
                <h3>Linhagens selecionadas</h3>
                <p>Cada peixe é escolhido pela cor e pela forma das nadadeiras.</p>
              </div>
            </div>
            <div className="perk">
              <IconDrop />
              <div>
                <h3>Água tratada</h3>
                <p>Criados em água condicionada, com trocas parciais semanais.</p>
              </div>
            </div>
            <div className="perk">
              <IconTruck />
              <div>
                <h3>Entrega segura</h3>
                <p>Saco duplo com oxigênio dentro de caixa térmica.</p>
              </div>
            </div>
            <div className="perk">
              <IconShield />
              <div>
                <h3>Chegada garantida</h3>
                <p>Chegou sem vida? Repomos o peixe ou devolvemos o valor.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Catálogo ---------- */}
        <section className="section" id="peixes">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow">Catálogo</p>
                <h2>Peixes disponíveis</h2>
                {realCount > 0 && (
                  <p className="section-sub">
                    {realCount} {realCount === 1 ? 'exemplar' : 'exemplares'} com foto real, prontos para envio.
                  </p>
                )}
              </div>
              <div className="toolbar">
                <div className="chips" role="tablist" aria-label="Filtrar por tipo de cauda">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="tab"
                      aria-selected={filter === c}
                      className={`chip ${filter === c ? 'is-active' : ''}`}
                      onClick={() => setFilter(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <label className="sort" htmlFor="sort">
                  <span>Ordenar</span>
                  <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                    {SORTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="grid">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={add} onOpen={setDetail} />
              ))}
            </div>
            <p className="muted small note">
              Peixes com o selo “Foto real” são exatamente o exemplar que você recebe. Nos demais, a foto
              é de referência da linhagem e cores e marcas variam de peixe para peixe.
            </p>
          </div>
        </section>

        {/* ---------- Guia de caudas ---------- */}
        <section className="section section-alt" id="caudas">
          <div className="wrap">
            <p className="eyebrow">Guia de caudas</p>
            <h2>Entenda os nomes antes de escolher</h2>
            <div className="tails">
              {TAILS.map((t) => (
                <article key={t.name} className="tail">
                  <div className="tail-art">
                    <BettaArt art={t.art} animate={false} />
                  </div>
                  <h3>
                    {t.name} <span>{t.abbr}</span>
                  </h3>
                  <p>{t.text}</p>
                  <button type="button" className="link-btn" onClick={() => { setFilter(t.name); document.getElementById('peixes')?.scrollIntoView(); }}>
                    Ver {t.name} no catálogo
                  </button>
                </article>
              ))}
            </div>
            <dl className="glossary">
              {GLOSSARY.map(([term, def]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{def}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ---------- Como comprar ---------- */}
        <section className="section" id="como-comprar">
          <div className="wrap">
            <p className="eyebrow">Como comprar</p>
            <h2>Três passos até o seu aquário</h2>
            <ol className="steps">
              <li>
                <span className="step-n">1</span>
                <h3>Escolha seus peixes</h3>
                <p>Abra os detalhes, selecione macho ou fêmea e toque em “Adicionar”.</p>
              </li>
              <li>
                <span className="step-n">2</span>
                <h3>Envie o pedido</h3>
                <p>No carrinho, informe nome e cidade. O resumo vai pronto para o nosso WhatsApp.</p>
              </li>
              <li>
                <span className="step-n">3</span>
                <h3>Combine pagamento e entrega</h3>
                <p>Confirmamos o peixe e o valor da entrega. Você paga por Pix, cartão ou dinheiro na retirada.</p>
              </li>
            </ol>
            <ul className="pay">
              <li>Pix</li>
              <li>Cartão</li>
              <li>Dinheiro na retirada</li>
            </ul>
          </div>
        </section>

        {/* ---------- Cuidados ---------- */}
        <section className="section section-alt" id="cuidados">
          <div className="wrap">
            <p className="eyebrow">Cuidados</p>
            <h2>Do saquinho ao aquário</h2>
            <p className="lead small-lead">
              Bettas são resistentes, mas vivem mais e mostram cores mais fortes quando a água está
              estável. Estes são os números e os passos que usamos aqui.
            </p>

            <dl className="params">
              <div>
                <dt>Temperatura</dt>
                <dd>26–28 °C</dd>
              </div>
              <div>
                <dt>pH</dt>
                <dd>6,5–7,5</dd>
              </div>
              <div>
                <dt>Aquário mínimo</dt>
                <dd>10 litros</dd>
              </div>
              <div>
                <dt>Alimentação</dt>
                <dd>2× ao dia</dd>
              </div>
              <div>
                <dt>Troca semanal</dt>
                <dd>30% da água</dd>
              </div>
            </dl>

            <div className="care-grid">
              <div className="care-block">
                <h3>Aclimatação: o dia da chegada</h3>
                <ol className="acclim">
                  {ACCLIMATION.map((s) => (
                    <li key={s.t}>
                      <strong>{s.t}</strong>
                      <span>{s.d}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="care-block">
                <h3>O que ter em casa antes do peixe chegar</h3>
                <ul className="checklist">
                  {KIT.map((k) => (
                    <li key={k}>
                      <IconCheck width="18" height="18" />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Dúvidas ---------- */}
        <section className="section" id="duvidas">
          <div className="wrap faq-wrap">
            <div>
              <p className="eyebrow">Dúvidas frequentes</p>
              <h2>Antes de pedir</h2>
              <p className="lead small-lead">
                Não achou sua resposta? Chame no WhatsApp {STORE.whatsappDisplay}.
              </p>
            </div>
            <div className="faq">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- CTA final ---------- */}
        <section className="cta-band">
          <div className="wrap cta-inner">
            <img src={LOGO} alt="Logo Zaraki Bettas" className="cta-logo" />
            <div>
              <h2>Quer ver o peixe antes de decidir?</h2>
              <p>Mandamos fotos e vídeo de cada betta disponível pelo WhatsApp.</p>
            </div>
            <a
              href={whatsappLink(`Olá, ${STORE.name}! Queria ver fotos e vídeos dos bettas disponíveis.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-wa btn-lg"
            >
              <IconWhatsApp /> Pedir fotos
            </a>
          </div>
        </section>
      </main>

      {/* ---------- Rodapé ---------- */}
      <footer className="footer">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <div className="brand brand-footer">
              <img src={LOGO} alt="" className="brand-logo" />
              <span className="brand-word">
                <span className="brand-z">Zaraki</span>
                <span className="brand-b">bettas</span>
              </span>
            </div>
            <p className="muted">
              Bettas selecionados, com envio seguro e atendimento direto pelo WhatsApp.
            </p>
          </div>
          <nav className="footer-col" aria-label="Rodapé">
            <h3>Navegação</h3>
            {NAV.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
            <a href="#duvidas">Dúvidas frequentes</a>
          </nav>
          <div className="footer-col">
            <h3>Contato</h3>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              <IconWhatsApp width="18" height="18" /> {STORE.whatsappDisplay}
            </a>
            <a href={STORE.instagram} target="_blank" rel="noopener noreferrer">
              <IconInstagram width="18" height="18" /> {STORE.instagramHandle}
            </a>
            <span className="muted">{STORE.city}</span>
          </div>
        </div>
        <div className="wrap footer-base">
          <p className="muted small">© {new Date().getFullYear()} {STORE.name}. Todos os direitos reservados.</p>
          <p className="muted small">Entregas em {STORE.deliveryArea}.</p>
        </div>
      </footer>

      {/* ---------- Barra do carrinho (mobile) ---------- */}
      {count > 0 && !open && !detail && (
        <button type="button" className="mobile-cart" onClick={() => setOpen(true)}>
          <span>
            <IconBag width="18" height="18" /> {count} {count === 1 ? 'peixe' : 'peixes'} · {formatBRL(total)}
          </span>
          <strong>Ver pedido</strong>
        </button>
      )}

      <a
        className={`wa-float ${count > 0 ? 'is-raised' : ''}`}
        href={whatsappLink(`Olá, ${STORE.name}!`)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar no WhatsApp"
      >
        <IconWhatsApp width="28" height="28" />
      </a>

      <div className={`toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">
        {toast}
        {toast && (
          <button type="button" onClick={() => setOpen(true)}>
            Ver pedido
          </button>
        )}
      </div>

      <ProductModal product={detail} onClose={closeDetail} onAdd={add} />
      <CartDrawer open={open} onClose={close} items={cart} setQty={setQty} remove={remove} clear={clear} />
    </>
  );
}
