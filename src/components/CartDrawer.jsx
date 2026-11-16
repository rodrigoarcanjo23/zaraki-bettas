import { useEffect, useState } from 'react';
import BettaArt from './BettaArt.jsx';
import { DEFAULT_ART } from '../data/products.js';
import { IconClose, IconTrash, IconWhatsApp, IconCheck } from './Icons.jsx';
import PixBox from './PixBox.jsx';
import { STORE, formatBRL, whatsappLink } from '../config.js';

const DELIVERY = ['Retirada', 'Entrega em Fortaleza', 'Entrega na Região Metropolitana'];

function buildMessage(items, total, form, code) {
  const lines = items.map(
    (it) => `• ${it.qty}x ${it.fullName || it.name} (${it.sex}) — ${formatBRL(it.price * it.qty)}`
  );
  return [
    `Olá, ${STORE.name}! Quero fazer um pedido.`,
    '',
    `*Pedido ${code}*`,
    ...lines,
    '',
    `*Total do pedido:* ${formatBRL(total)}`,
    '',
    `*Nome:* ${form.name}`,
    `*Cidade/Bairro:* ${form.city}`,
    `*Entrega:* ${form.delivery}`,
    form.notes ? `*Observações:* ${form.notes}` : null,
    '',
    'Aguardo a confirmação do pedido e o valor da entrega.',
  ]
    .filter((l) => l !== null)
    .join('\n');
}

export default function CartDrawer({ open, onClose, items, setQty, remove, clear }) {
  const [form, setForm] = useState({ name: '', city: '', delivery: DELIVERY[0], notes: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null);

  const total = items.reduce((s, it) => s + it.price * it.qty, 0);
  const count = items.reduce((s, it) => s + it.qty, 0);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setSent(null);
  }, [open]);

  const update = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = 'Digite seu nome para identificarmos o pedido.';
    if (!form.city.trim()) er.city = 'Informe cidade e bairro para combinarmos a entrega.';
    setErrors(er);
    if (Object.keys(er).length) return;

    const code = 'ZB-' + Date.now().toString(36).slice(-5).toUpperCase();
    const url = whatsappLink(buildMessage(items, total, form, code));
    window.open(url, '_blank', 'noopener');
    setSent({ code, url, total, pickup: form.delivery === DELIVERY[0] });
  };

  return (
    <div className={`drawer-root ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Seu pedido">
        <header className="drawer-head">
          <h2>Seu pedido</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
            <IconClose />
          </button>
        </header>

        {sent ? (
          <div className="drawer-sent">
            <span className="sent-icon">
              <IconCheck width="30" height="30" />
            </span>
            <h3>Pedido {sent.code} pronto</h3>
            <p>
              Abrimos o WhatsApp com o resumo do seu pedido. Envie a mensagem para confirmarmos o
              peixe e combinarmos a entrega.
            </p>
            <p className="muted small">O WhatsApp não abriu? Toque no botão abaixo.</p>
            <a className="btn btn-wa btn-block" href={sent.url} target="_blank" rel="noopener noreferrer">
              <IconWhatsApp /> Abrir WhatsApp
            </a>
            {STORE.pix && <PixBox total={sent.total} pickup={sent.pickup} />}
            <button
              type="button"
              className="btn btn-ghost btn-block"
              onClick={() => {
                clear();
                onClose();
              }}
            >
              Limpar carrinho e voltar
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="drawer-empty">
            <p>Seu pedido está vazio.</p>
            <p className="muted">Escolha um peixe no catálogo e toque em “Adicionar”.</p>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Ver peixes
            </button>
          </div>
        ) : (
          <form className="drawer-body" onSubmit={submit} noValidate>
            <ul className="cart-list">
              {items.map((it) => (
                <li key={it.key} className="cart-item">
                  <div className="cart-thumb">
                    {it.image ? <img src={it.image} alt="" /> : <BettaArt art={it.art || DEFAULT_ART} animate={false} />}
                  </div>
                  <div className="cart-info">
                    <p className="cart-name">{it.name}</p>
                    <p className="muted small">
                      {it.sex} · {formatBRL(it.price)}
                    </p>
                    <div className="qty">
                      <button type="button" onClick={() => setQty(it.key, it.qty - 1)} aria-label="Diminuir">
                        −
                      </button>
                      <span>{it.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(it.key, it.qty + 1)}
                        disabled={Boolean(it.stock) && it.qty >= it.stock}
                        aria-label="Aumentar"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-right">
                    <p className="cart-line">{formatBRL(it.price * it.qty)}</p>
                    <button type="button" className="icon-btn small" onClick={() => remove(it.key)} aria-label="Remover">
                      <IconTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-total">
              <span>
                {count} {count === 1 ? 'item' : 'itens'}
              </span>
              <strong>{formatBRL(total)}</strong>
            </div>
            <p className="muted small">Entregamos apenas em {STORE.deliveryArea}. O valor da entrega é combinado no WhatsApp.</p>

            <fieldset className="order-form">
              <legend>Seus dados</legend>
              <label htmlFor="f-name">Nome</label>
              <input id="f-name" value={form.name} onChange={update('name')} placeholder="Como podemos te chamar?" autoComplete="name" />
              {errors.name && <span className="field-error">{errors.name}</span>}

              <label htmlFor="f-city">Cidade e bairro</label>
              <input id="f-city" value={form.city} onChange={update('city')} placeholder="Ex.: Fortaleza – Aldeota" autoComplete="address-level2" />
              {errors.city && <span className="field-error">{errors.city}</span>}

              <span className="label">Entrega</span>
              <div className="chips">
                {DELIVERY.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`chip ${form.delivery === d ? 'is-active' : ''}`}
                    onClick={() => setForm((f) => ({ ...f, delivery: d }))}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <label htmlFor="f-notes">Observações (opcional)</label>
              <textarea id="f-notes" rows="2" value={form.notes} onChange={update('notes')} placeholder="Horário, preferência de cor, dúvidas…" />
            </fieldset>

            <button type="submit" className="btn btn-wa btn-block btn-lg">
              <IconWhatsApp /> Enviar pedido pelo WhatsApp
            </button>
          </form>
        )}
      </aside>
    </div>
  );
}
