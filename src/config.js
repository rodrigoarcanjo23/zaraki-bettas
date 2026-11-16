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

  city: 'Fortaleza – CE',

  // Onde vocês entregam (aparece no topo do site, no carrinho e nas dúvidas)
  deliveryArea: 'Fortaleza e Região Metropolitana',

  // Seção "Sobre a criação". Enquanto estiver  about: null  ela não aparece no site.
  // Para ativar, troque por algo assim:
  //
  //   about: {
  //     title: 'Uma criação pequena, feita com cuidado',
  //     text: [
  //       'Primeiro parágrafo: como você começou a criar bettas.',
  //       'Segundo parágrafo: como é a sua criação hoje.',
  //     ],
  //     photo: '/sobre.jpg',   // opcional: foto do espaço da criação, em /public/
  //   },
  about: null,

  // Dados do Pix mostrados ao cliente depois que ele envia o pedido.
  // Para esconder o Pix do site, troque todo o bloco por:  pix: null,
  pix: {
    keyType: 'CPF',
    key: '05026642314', // só números (é o que vai no QR Code e no botão "Copiar chave")
    keyDisplay: '050.266.423-14', // como a chave aparece escrita
    name: 'Franscisco Georvane da Costa',
    bank: 'Nubank (Nu Pagamentos)',
    city: 'Fortaleza',
  },
};

export function whatsappLink(message = '') {
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${STORE.whatsapp}${text}`;
}

// Link do botão "Avise-me" dos peixes vendidos
export function notifyLink(product) {
  return whatsappLink(
    `Olá, ${STORE.name}! Vi no site que o Betta ${product.name} já foi vendido. Pode me avisar quando chegar um parecido?`
  );
}

export const formatBRL = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
