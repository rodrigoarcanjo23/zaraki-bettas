// Gera o código "Pix Copia e Cola" (padrão BR Code do Banco Central) a partir da chave.
// Sem valor fixo: o cliente digita o valor combinado no WhatsApp (peixes + entrega).

const field = (id, value) => `${id}${String(value.length).padStart(2, '0')}${value}`;

// Sem acentos, só letras/números/espaço, maiúsculas, com tamanho máximo.
const clean = (text, max) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase()
    .slice(0, max)
    .trim();

function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function pixPayload({ key, name, city, amount }) {
  const account = field('00', 'br.gov.bcb.pix') + field('01', key);
  let payload =
    field('00', '01') +
    field('26', account) +
    field('52', '0000') +
    field('53', '986') +
    (amount ? field('54', amount.toFixed(2)) : '') +
    field('58', 'BR') +
    field('59', clean(name, 25)) +
    field('60', clean(city, 15)) +
    field('62', field('05', '***')) +
    '6304';
  return payload + crc16(payload);
}
