import { useEffect, useMemo, useRef, useState } from 'react';
import BettaArt from './BettaArt.jsx';
import { Badges } from './ProductCard.jsx';
import { IconClose, IconWhatsApp } from './Icons.jsx';
import { STORE, formatBRL, whatsappLink, notifyLink } from '../config.js';
import { fullName, isAccessory, DEFAULT_ART } from '../data/products.js';

const PlayIcon = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
  </svg>
);

// Junta foto principal, fotos extras e vídeo em uma lista só.
export function mediaOf(product) {
  const list = [];
  if (product.image) list.push({ type: 'photo', src: product.image });
  (product.gallery || []).forEach((src) => list.push({ type: 'photo', src }));
  if (product.video) list.push({ type: 'video', src: product.video });
  return list;
}

export default function ProductModal({ product, onClose, onAdd }) {
  const [variantIdx, setVariantIdx] = useState(0);
  const [mediaIdx, setMediaIdx] = useState(0);
  const [tall, setTall] = useState(false);
  const closeRef = useRef(null);
  const [shared, setShared] = useState(null);
  const media = useMemo(() => (product ? mediaOf(product) : []), [product]);

  useEffect(() => {
    setVariantIdx(0);
    setMediaIdx(0);
    if (!product) return;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      const n = mediaOf(product).length;
      if (n > 1 && e.key === 'ArrowRight') setMediaIdx((i) => (i + 1) % n);
      if (n > 1 && e.key === 'ArrowLeft') setMediaIdx((i) => (i - 1 + n) % n);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  useEffect(() => setTall(false), [mediaIdx, product]);

  if (!product) return null;

  const share = async () => {
    const url = window.location.href;
    const data = { title: `${fullName(product)} | ${STORE.name}`, text: `Olha isto na ${STORE.name}: ${fullName(product)}`, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared('ok');
    } catch (err) {
      if (err?.name === 'AbortError') return; // a pessoa fechou a janela de compartilhar
      setShared('erro');
    }
    setTimeout(() => setShared(null), 2400);
  };
  const variant = product.variants[variantIdx] || product.variants[0];
  const current = media[mediaIdx];
  const accessory = isAccessory(product);
  const ask = `Olá, ${STORE.name}! Tenho interesse em: ${fullName(product)} (${variant.sex}). Pode me mandar mais fotos e vídeo?`;

  return (
    <div className="modal-root" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="modal-scrim" onClick={onClose} />
      <div className="modal">
        <button ref={closeRef} type="button" className="icon-btn modal-close" onClick={onClose} aria-label="Fechar">
          <IconClose />
        </button>

        <div className="modal-gallery">
          <div className={`modal-media ${product.sold ? 'is-sold' : ''}`}>
            <Badges product={product} />
            {!current && <BettaArt art={product.art || DEFAULT_ART} />}
            {current?.type === 'photo' && (
              <img
                key={current.src}
                src={current.src}
                alt={`${fullName(product)}, foto ${mediaIdx + 1} de ${media.length}`}
                className={tall ? 'is-tall' : ''}
                onLoad={(e) => setTall(e.target.naturalHeight > e.target.naturalWidth * 1.15)}
              />
            )}
            {current?.type === 'video' && (
              <video key={current.src} src={current.src} controls autoPlay muted loop playsInline preload="metadata" poster={product.image || undefined} />
            )}
            {media.length > 1 && (
              <>
                <button
                  type="button"
                  className="gal-nav gal-prev"
                  onClick={() => setMediaIdx((i) => (i - 1 + media.length) % media.length)}
                  aria-label="Foto anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="gal-nav gal-next"
                  onClick={() => setMediaIdx((i) => (i + 1) % media.length)}
                  aria-label="Próxima foto"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {media.length > 1 && (
            <div className="thumbs" role="tablist" aria-label="Fotos e vídeo do peixe">
              {media.map((m, i) => (
                <button
                  key={m.src}
                  type="button"
                  role="tab"
                  aria-selected={i === mediaIdx}
                  aria-label={m.type === 'video' ? 'Vídeo' : `Foto ${i + 1}`}
                  className={`thumb ${i === mediaIdx ? 'is-active' : ''}`}
                  onClick={() => setMediaIdx(i)}
                >
                  {m.type === 'photo' ? (
                    <img src={m.src} alt="" loading="lazy" />
                  ) : (
                    <>
                      {product.image && <img src={product.image} alt="" loading="lazy" />}
                      <span className="thumb-play">
                        <PlayIcon />
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="modal-body">
          <p className="card-kicker">{product.category}</p>
          <h2 className="modal-title">{product.name}</h2>
          <p className="modal-desc">{product.description}</p>

          <dl className="modal-specs">
            <div>
              <dt>{accessory || product.category === 'Casal' ? 'Categoria' : 'Cauda'}</dt>
              <dd>{product.category}</dd>
            </div>
            {product.size && (
              <div>
                <dt>Tamanho</dt>
                <dd>{product.size}</dd>
              </div>
            )}
            {product.age && (
              <div>
                <dt>Idade</dt>
                <dd>{product.age}</dd>
              </div>
            )}
            <div>
              <dt>Disponibilidade</dt>
              <dd>{product.sold ? 'Vendido' : product.stock === 1 ? 'Exemplar único' : 'Sob consulta'}</dd>
            </div>
          </dl>

          <p className="modal-photo-note">
            {product.sold
              ? 'Este item já foi vendido. Toque em “Avise-me” e chamamos você quando chegar um parecido.'
              : accessory
                ? 'Produto entregue junto com o seu pedido. Tire dúvidas pelo WhatsApp.'
                : product.realPhoto
                  ? 'Foto real: você recebe exatamente este peixe.'
                  : 'Foto de referência da linhagem. Enviamos foto e vídeo do seu peixe antes de fechar.'}
          </p>

          {!product.sold && product.variants.length > 1 && (
            <div className="sex-toggle" role="radiogroup" aria-label="Escolha o sexo">
              {product.variants.map((v, i) => (
                <button
                  key={v.sex}
                  type="button"
                  role="radio"
                  aria-checked={i === variantIdx}
                  className={i === variantIdx ? 'is-active' : ''}
                  onClick={() => setVariantIdx(i)}
                >
                  {v.sex} · {formatBRL(v.price)}
                </button>
              ))}
            </div>
          )}

          <div className="modal-buy">
            <p className="price">
              <span className="price-label">{product.sold ? 'Vendido por' : variant.sex}</span>
              {formatBRL(variant.price)}
            </p>
            {product.sold ? (
              <a className="btn btn-wa btn-lg" href={notifyLink(product)} target="_blank" rel="noopener noreferrer">
                <IconWhatsApp /> Avise-me
              </a>
            ) : (
              <button
                type="button"
                className="btn btn-red btn-lg"
                onClick={() => {
                  onAdd(product, variant);
                  onClose();
                }}
              >
                Adicionar ao pedido
              </button>
            )}
          </div>

          <div className="modal-links">
            {!product.sold && (
              <a className="modal-ask" href={whatsappLink(ask)} target="_blank" rel="noopener noreferrer">
                <IconWhatsApp width="18" height="18" /> {accessory ? 'Tirar dúvida sobre este produto' : 'Pedir mais fotos e vídeo'}
              </a>
            )}
            <button type="button" className="link-btn" onClick={share}>
              {shared === 'ok' ? 'Link copiado' : shared === 'erro' ? 'Copie o endereço da página' : 'Compartilhar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
