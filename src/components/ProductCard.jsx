import { useState } from 'react';
import BettaArt from './BettaArt.jsx';
import { formatBRL } from '../config.js';

export default function ProductCard({ product, onAdd }) {
  const [variantIdx, setVariantIdx] = useState(0);
  const variant = product.variants[variantIdx];

  return (
    <article className="card">
      <div className="card-media">
        {product.badge && <span className="card-badge">{product.badge}</span>}
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
      </div>

      <div className="card-body">
        <div className="card-head">
          <p className="card-kicker">{product.category}</p>
          <h3 className="card-title">{product.name}</h3>
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

        <div className="card-foot">
          <p className="price">
            <span className="price-label">{variant.sex}</span>
            {formatBRL(variant.price)}
          </p>
          <button type="button" className="btn btn-red" onClick={() => onAdd(product, variant)}>
            Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}
