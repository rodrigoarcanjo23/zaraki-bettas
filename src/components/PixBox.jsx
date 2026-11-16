import { useMemo, useState } from 'react';
import qrcode from '../lib/qrcode-generator.js';
import { pixPayload } from '../lib/pix.js';
import { STORE, formatBRL } from '../config.js';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      el.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function QrCode({ value }) {
  const { size, path } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    let d = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (qr.isDark(r, c)) d += `M${c},${r}h1v1h-1z`;
      }
    }
    return { size: n, path: d };
  }, [value]);

  // QR sempre preto no branco, com margem, para qualquer banco conseguir ler.
  return (
    <svg className="pix-qr" viewBox={`-3 -3 ${size + 6} ${size + 6}`} role="img" aria-label="QR Code do Pix" shapeRendering="crispEdges">
      <rect x="-3" y="-3" width={size + 6} height={size + 6} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  );
}

export default function PixBox({ total, pickup }) {
  const pix = STORE.pix;
  const [copied, setCopied] = useState(null);
  const code = useMemo(() => pixPayload({ key: pix.key, name: pix.name, city: pix.city }), [pix]);

  const copy = async (what, text) => {
    const ok = await copyText(text);
    setCopied(ok ? what : 'erro');
    setTimeout(() => setCopied(null), 2200);
  };

  return (
    <section className="pix" aria-label="Pagamento por Pix">
      <h4>Pagar com Pix</h4>
      <p className="pix-warn">
        Pague só depois que confirmarmos o pedido{pickup ? '' : ' e o valor da entrega'} no WhatsApp.
      </p>

      <div className="pix-row">
        <QrCode value={code} />
        <dl className="pix-data">
          <div>
            <dt>Favorecido</dt>
            <dd>{pix.name}</dd>
          </div>
          <div>
            <dt>Banco</dt>
            <dd>{pix.bank}</dd>
          </div>
          <div>
            <dt>Chave ({pix.keyType})</dt>
            <dd className="pix-key">{pix.keyDisplay}</dd>
          </div>
          {total > 0 && (
            <div>
              <dt>Total dos peixes</dt>
              <dd>{formatBRL(total)}{pickup ? '' : ' + entrega'}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="pix-actions">
        <button type="button" className="btn btn-ghost" onClick={() => copy('chave', pix.key)}>
          {copied === 'chave' ? 'Chave copiada' : 'Copiar chave'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => copy('codigo', code)}>
          {copied === 'codigo' ? 'Código copiado' : 'Copiar Pix Copia e Cola'}
        </button>
      </div>
      {copied === 'erro' && (
        <p className="field-error">Não foi possível copiar. Selecione a chave acima e copie manualmente.</p>
      )}
      <p className="muted small">O QR Code não tem valor fixo: digite no app do banco o valor combinado.</p>
    </section>
  );
}
