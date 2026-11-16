import { useState } from 'react';
import BettaArt from './BettaArt.jsx';
import { formatBRL } from '../config.js';

export function Badges({ product }) {
  if (!product.badge && !product.realPhoto && !product.sold) return null;
  return (
    <div className="card-badges">
      {product.sold && <span className="card-badge is-sold">Vendido</span>}
      {!product.sold && product.badge && <span className="card-badge">{product.badge}</span>}
      {product.realPhoto && <span className="card-badge is-real">Foto real</span>}
    </div>
  );
}

export default function ProductCard({ product, onAdd, onOpen }) {
  const [variantIdx, setVariantIdx] = useState(0);
  const variant = product.variants[variantIdx];

  return (
    <article className={`card ${product.sold ? 'is-sold' : ''}`}>
      <button
        type="button"
        className="card-media"
        onClick={() => onOpen(product)}
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <Badges product={product} />
        {product.image ? (
          <img
            src={product.image}
            alt={`Betta ${product.name}`}
            loading="lazy"
            style={{ objectPosition: product.imagePos || 'center' }}
          />
        ) : (
          <BettaArt art={product.art} />
        )}
        <span className="card-zoom">Ver detalhes</span>
      </button>

      <div className="card-body">
        <div className="card-head">
          <p className="card-kicker">{product.category}</p>
          <h3 className="card-title">
            <button type="button" onClick={() => onOpen(product)}>
              {product.name}
            </button>
          </h3>
          <p className="card-tagline">{product.tagline}</p>
        </div>

        <dl className="card-specs">
          <div>
            <dt>Tamanho</dt>
            <dd>{product.size}</dd>
          </div>
          <div>
            <dt>Idade</dt>
            <dd>{product.age}</dd>
          </div>
        </dl>

        {product.variants.length === 1 ? (
          <p className="single-note">
            {product.variants[0].sex}
            {product.stock === 1 ? ' · exemplar único' : ''}
          </p>
        ) : (
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
                {v.sex}
              </button>
            ))}
          </div>
        )}

        <div className="card-foot">
          <p className="price">
            <span className="price-label">{variant.sex}</span>
            {formatBRL(variant.price)}
          </p>
          <button
            type="button"
            className="btn btn-red"
            disabled={product.sold}
            onClick={() => onAdd(product, variant)}
          >
            {product.sold ? 'Vendido' : 'Adicionar'}
          </button>
        </div>
      </div>
    </article>
  );
}
