// ============================================================
//  CONFIGURAÇÕES DA LOJA — edite aqui
// ============================================================

export const STORE = {
  name: 'Zaraki Bettas',

  // Número do WhatsApp que recebe os pedidos
  // Formato: 55 + DDD + número, só dígitos
  whatsapp: '558592927935',

  // Como o número aparece escrito no site
  whatsappDisplay: '(85) 9292-7935',

  instagram: 'https://instagram.com/zarakibettas',
  instagramHandle: '@zarakibettas',

  city: 'Ceará',
};

export function whatsappLink(message = '') {
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${STORE.whatsapp}${text}`;
}

export const formatBRL = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
