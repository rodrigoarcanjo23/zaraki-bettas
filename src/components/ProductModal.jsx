import { useEffect, useMemo, useRef, useState } from 'react';
import BettaArt from './BettaArt.jsx';
import { Badges } from './ProductCard.jsx';
import { IconClose, IconWhatsApp } from './Icons.jsx';
import { STORE, formatBRL, whatsappLink, notifyLink } from '../config.js';

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
  const variant = product.variants[variantIdx] || product.variants[0];
  const current = media[mediaIdx];
  const ask = `Olá, ${STORE.name}! Tenho interesse no Betta ${product.name} (${variant.sex}). Pode me mandar mais fotos e vídeo?`;

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
            {!current && <BettaArt art={product.art} />}
            {current?.type === 'photo' && (
              <img
                key={current.src}
                src={current.src}
                alt={`Betta ${product.name}, foto ${mediaIdx + 1} de ${media.length}`}
                className={tall ? 'is-tall' : ''}
                onLoad={(e) => setTall(e.target.naturalHeight > e.target.naturalWidth * 1.15)}
              />
            )}
            {current?.type === 'video' && (
              <video key={current.src} src={current.src} controls autoPlay muted loop playsInline poster={product.image || undefined} />
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
              <dt>Cauda</dt>
              <dd>{product.category}</dd>
            </div>
            <div>
              <dt>Tamanho</dt>
              <dd>{product.size}</dd>
            </div>
            <div>
              <dt>Idade</dt>
              <dd>{product.age}</dd>
            </div>
            <div>
              <dt>Disponibilidade</dt>
              <dd>{product.sold ? 'Vendido' : product.stock === 1 ? 'Exemplar único' : 'Sob consulta'}</dd>
            </div>
          </dl>

          <p className="modal-photo-note">
            {product.sold
              ? 'Este peixe já foi vendido. Toque em “Avise-me” e chamamos você quando chegar um parecido.'
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

          {!product.sold && (
            <a className="modal-ask" href={whatsappLink(ask)} target="_blank" rel="noopener noreferrer">
              <IconWhatsApp width="18" height="18" /> Pedir mais fotos e vídeo deste peixe
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
