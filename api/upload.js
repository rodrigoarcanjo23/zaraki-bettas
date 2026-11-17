// ============================================================
//  Envio de fotos e vídeos do painel (função da Vercel).
//  O arquivo vai direto do celular para o Vercel Blob (armazenamento de
//  arquivos da Vercel). Esta função só confere a senha do painel e libera
//  um envio por vez, com tipo e tamanho controlados.
//
//  Requer, na Vercel:  Storage → Blob → conectado ao projeto
//  (isso cria a variável BLOB_READ_WRITE_TOKEN automaticamente).
// ============================================================
import crypto from 'node:crypto';
import { handleUpload } from '@vercel/blob/client';

const MB = 1024 * 1024;
const LIMITS = { photo: 10 * MB, video: 60 * MB };

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

function passwordOk(given) {
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected || typeof given !== 'string') return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'O armazenamento de fotos e vídeos (Vercel Blob) ainda não foi conectado ao projeto.' });
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let payload = {};
        try {
          payload = JSON.parse(clientPayload || '{}');
        } catch {
          /* payload inválido */
        }
        if (!passwordOk(payload.password)) throw new Error('Senha incorreta.');

        // Só estas pastas, com nomes simples (sem "..", sem barras extras).
        const m = String(pathname).match(/^(peixes|clientes|videos)\/[a-z0-9-]+\.(jpg|jpeg|png|webp|mp4|mov|webm)$/);
        if (!m) throw new Error('Nome de arquivo inválido.');
        const isVideo = m[1] === 'videos';

        return {
          allowedContentTypes: isVideo ? VIDEO_TYPES : IMAGE_TYPES,
          maximumSizeInBytes: isVideo ? LIMITS.video : LIMITS.photo,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 365,
        };
      },
    });
    return res.status(200).json(result);
  } catch (err) {
    const msg = err?.message === 'Senha incorreta.' ? err.message : 'Não foi possível liberar o envio do arquivo.';
    return res.status(err?.message === 'Senha incorreta.' ? 401 : 400).json({ error: msg });
  }
}
