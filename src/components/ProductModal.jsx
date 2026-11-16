import { useEffect, useRef, useState } from 'react';
import BettaArt from './BettaArt.jsx';
import { Badges } from './ProductCard.jsx';
import { IconClose, IconWhatsApp } from './Icons.jsx';
import { STORE, formatBRL, whatsappLink } from '../config.js';

export default function ProductModal({ product, onClose, onAdd }) {
  const [variantIdx, setVariantIdx] = useState(0);
  const closeRef = useRef(null);

  useEffect(() => {
    setVariantIdx(0);
    if (!product) return;
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  if (!product) return null;
  const variant = product.variants[variantIdx] || product.variants[0];
  const ask = `Olá, ${STORE.name}! Tenho interesse no Betta ${product.name} (${variant.sex}). Pode me mandar mais fotos e vídeo?`;

  return (
    <div className="modal-root" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="modal-scrim" onClick={onClose} />
      <div className="modal">
        <button ref={closeRef} type="button" className="icon-btn modal-close" onClick={onClose} aria-label="Fechar">
          <IconClose />
        </button>

        <div className="modal-media">
          <Badges product={product} />
          {product.image ? (
            <img src={product.heroImage || product.image} alt={`Betta ${product.name}`} />
          ) : (
            <BettaArt art={product.art} />
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
            {product.realPhoto
              ? 'Foto real: você recebe exatamente este peixe.'
              : 'Foto de referência da linhagem. Enviamos foto e vídeo do seu peixe antes de fechar.'}
          </p>

          {product.variants.length > 1 && (
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
              <span className="price-label">{variant.sex}</span>
              {formatBRL(variant.price)}
            </p>
            <button
              type="button"
              className="btn btn-red btn-lg"
              disabled={product.sold}
              onClick={() => {
                onAdd(product, variant);
                onClose();
              }}
            >
              {product.sold ? 'Vendido' : 'Adicionar ao pedido'}
            </button>
          </div>

          <a className="modal-ask" href={whatsappLink(ask)} target="_blank" rel="noopener noreferrer">
            <IconWhatsApp width="18" height="18" /> Pedir mais fotos e vídeo deste peixe
          </a>
        </div>
      </div>
    </div>
  );
}
