import { useCallback, useEffect, useMemo, useState } from 'react';
import BettaArt from './components/BettaArt.jsx';
import ProductCard from './components/ProductCard.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import { IconBag, IconWhatsApp, IconTruck, IconShield, IconDrop, IconCrown, IconInstagram } from './components/Icons.jsx';
import { PRODUCTS, CATEGORIES } from './data/products.js';
import { STORE, whatsappLink, formatBRL } from './config.js';

const LOGO = '/logo.jpg';
const CART_KEY = 'zaraki-cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const HERO_FISH = PRODUCTS.find((p) => p.id === 'red-dragon');

const FAQ = [
  {
    q: 'Como o peixe chega até mim?',
    a: 'Embalamos em saco duplo com água condicionada e oxigênio, dentro de caixa térmica. Para outras cidades, combinamos a transportadora mais rápida para a sua região.',
  },
  {
    q: 'E se o peixe chegar morto?',
    a: 'Grave um vídeo abrindo a embalagem e nos envie em até 2 horas após o recebimento. Repomos o peixe ou devolvemos o valor.',
  },
  {
    q: 'Posso colocar dois machos no mesmo aquário?',
    a: 'Não. Machos brigam até se ferir. Cada macho precisa de um aquário só para ele. Fêmeas podem viver em grupo de 5 ou mais em aquário plantado.',
  },
  {
    q: 'Quais formas de pagamento vocês aceitam?',
    a: 'Pix, cartão e dinheiro na retirada. A forma de pagamento é combinada no WhatsApp depois que você envia o pedido.',
  },
];

export default function App() {
  const [cart, setCart] = useState(loadCart);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('Todos');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* armazenamento indisponível */
    }
  }, [cart]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback((product, variant) => {
    const key = `${product.id}-${variant.sex}`;
    setCart((c) => {
      const found = c.find((i) => i.key === key);
      if (found) return c.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
      return [
        ...c,
        { key, id: product.id, name: product.name, sex: variant.sex, price: variant.price, art: product.art, image: product.image, qty: 1 },
      ];
    });
    setToast(`${product.name} (${variant.sex}) adicionado`);
  }, []);

  const setQty = (key, qty) =>
    setCart((c) => (qty <= 0 ? c.filter((i) => i.key !== key) : c.map((i) => (i.key === key ? { ...i, qty } : i))));
  const remove = (key) => setCart((c) => c.filter((i) => i.key !== key));
  const clear = () => setCart([]);
  const close = useCallback(() => setOpen(false), []);

  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
  const shown = useMemo(
    () => (filter === 'Todos' ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter)),
    [filter]
  );

  return (
    <>
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
          <nav className="nav">
            <a href="#peixes">Peixes</a>
            <a href="#como-comprar">Como comprar</a>
            <a href="#cuidados">Cuidados</a>
          </nav>
          <button type="button" className="cart-btn" onClick={() => setOpen(true)} aria-label={`Abrir pedido, ${count} itens`}>
            <IconBag />
            <span className="cart-btn-label">Pedido</span>
            {count > 0 && <span className="cart-count">{count}</span>}
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
                Crowntail, Dumbo, Red Dragon e outras linhagens criadas com cuidado, alimentação
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
                  <dt>{PRODUCTS.length}</dt>
                  <dd>linhagens disponíveis</dd>
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
              <div className="medallion">
                <div className="medallion-water">
                  {HERO_FISH.image ? (
                    <img src={HERO_FISH.image} alt={`Betta ${HERO_FISH.name}`} className="hero-photo" />
                  ) : (
                    <BettaArt art={HERO_FISH.art} className="hero-fish" />
                  )}
                </div>
              </div>
              <div className="hero-tag">
                <span className="hero-tag-kicker">Destaque</span>
                <strong>Betta {HERO_FISH.name}</strong>
                <span>a partir de {formatBRL(Math.min(...HERO_FISH.variants.map((v) => v.price)))}</span>
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
                <h3>Envio seguro</h3>
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
              </div>
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
            </div>
            <div className="grid">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={add} />
              ))}
            </div>
            <p className="muted small note">
              Fotos de referência. Cada betta é único: cores e marcas variam de peixe para peixe.
              Peça fotos e vídeo do seu antes de fechar.
            </p>
          </div>
        </section>

        {/* ---------- Como comprar ---------- */}
        <section className="section section-alt" id="como-comprar">
          <div className="wrap">
            <p className="eyebrow">Como comprar</p>
            <h2>Três passos até o seu aquário</h2>
            <ol className="steps">
              <li>
                <span className="step-n">1</span>
                <h3>Escolha seus peixes</h3>
                <p>Selecione macho ou fêmea e toque em “Adicionar”. Pode levar quantos quiser.</p>
              </li>
              <li>
                <span className="step-n">2</span>
                <h3>Envie o pedido</h3>
                <p>No carrinho, informe nome e cidade. O resumo vai pronto para o nosso WhatsApp.</p>
              </li>
              <li>
                <span className="step-n">3</span>
                <h3>Combine pagamento e entrega</h3>
                <p>Respondemos com fotos do seu peixe, o frete e as formas de pagamento.</p>
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
        <section className="section" id="cuidados">
          <div className="wrap care-grid">
            <div>
              <p className="eyebrow">Cuidados básicos</p>
              <h2>O que seu betta precisa</h2>
              <p className="lead small-lead">
                Bettas são resistentes, mas vivem mais e mostram cores mais fortes quando a água está
                estável. Esses são os números que usamos aqui.
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
              </dl>
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
        <div className="wrap footer-inner">
          <div className="brand brand-footer">
            <img src={LOGO} alt="" className="brand-logo" />
            <span className="brand-word">
              <span className="brand-z">Zaraki</span>
              <span className="brand-b">bettas</span>
            </span>
          </div>
          <div className="footer-contact">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              <IconWhatsApp width="18" height="18" /> {STORE.whatsappDisplay}
            </a>
            <a href={STORE.instagram} target="_blank" rel="noopener noreferrer">
              <IconInstagram width="18" height="18" /> {STORE.instagramHandle}
            </a>
          </div>
          <p className="muted small">© {new Date().getFullYear()} {STORE.name} · {STORE.city}</p>
        </div>
      </footer>

      {/* ---------- Barra do carrinho (mobile) ---------- */}
      {count > 0 && !open && (
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

      <CartDrawer open={open} onClose={close} items={cart} setQty={setQty} remove={remove} clear={clear} />
    </>
  );
}
