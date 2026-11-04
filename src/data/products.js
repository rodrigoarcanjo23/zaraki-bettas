// ============================================================
//  CATÁLOGO — os preços ainda são FICTÍCIOS, ajuste aqui.
//  Fotos ficam em /public/peixes/. Para trocar uma foto, substitua
//  o arquivo ou mude o caminho em  image.
//  imagePos ajusta o enquadramento da foto no card (CSS object-position).
//  Se  image  for null, o site desenha uma ilustração com as cores de  art.
// ============================================================

export const CATEGORIES = ['Todos', 'Crowntail', 'Dumbo', 'Halfmoon'];

export const PRODUCTS = [
  {
    id: 'red-dragon',
    name: 'Red Dragon Crowntail',
    category: 'Crowntail',
    tagline: 'Escamas brancas metálicas sobre vermelho',
    description:
      'Escamas grossas e prateadas cobrem o corpo como uma armadura, com nadadeiras vermelho-escuro em coroa.',
    size: '5–6 cm',
    age: '5 meses',
    badge: 'Destaque',
    image: '/peixes/red-dragon.jpg',
    imagePos: '50% 45%',
    variants: [
      { sex: 'Macho', price: 120 },
      { sex: 'Fêmea', price: 60 },
    ],
    art: { tail: 'crown', body: ['#f1ece6', '#c21d33'], fin: ['#d6182f', '#5e0715'], ears: false, scales: true },
  },
  {
    id: 'ct-super-red',
    name: 'Crowntail Super Red',
    category: 'Crowntail',
    tagline: 'Vermelho sólido do focinho à cauda',
    description:
      'Vermelho uniforme e saturado, sem manchas. Raios longos e bem separados, coroa volumosa.',
    size: '5–6 cm',
    age: '4 meses',
    badge: 'Mais pedido',
    image: '/peixes/crowntail-super-red.jpg',
    imagePos: '50% 45%',
    variants: [
      { sex: 'Macho', price: 70 },
      { sex: 'Fêmea', price: 35 },
    ],
    art: { tail: 'crown', body: ['#e32a3a', '#8e0a1e'], fin: ['#ef2a3a', '#6a0616'], ears: false },
  },
  {
    id: 'dumbo-lavanda',
    name: 'Dumbo Lavanda',
    category: 'Dumbo',
    tagline: 'Orelhas brancas, corpo lilás e cabeça cobre',
    description:
      'Peitorais grandes e brancos que ondulam ao nadar. Corpo lilás com escamas marcadas e bordas brancas nas nadadeiras.',
    size: '5 cm',
    age: '4 meses',
    badge: null,
    image: '/peixes/dumbo-lavanda.jpg',
    imagePos: '50% 50%',
    variants: [
      { sex: 'Macho', price: 90 },
      { sex: 'Fêmea', price: 45 },
    ],
    art: { tail: 'half', body: ['#d9785a', '#9b3fa8'], fin: ['#a8329c', '#f4eef6'], ears: ['#ffffff', '#e4dbe8'] },
  },
  {
    id: 'ct-azul-royal',
    name: 'Crowntail Azul Royal',
    category: 'Crowntail',
    tagline: 'Azul royal metálico, coroa longa',
    description:
      'Azul intenso e brilhante do corpo às pontas dos raios. Um dos tons que mais brilham sob LED branco.',
    size: '5–6 cm',
    age: '4 meses',
    badge: null,
    image: '/peixes/crowntail-azul-royal.jpg',
    imagePos: '50% 50%',
    variants: [
      { sex: 'Macho', price: 65 },
      { sex: 'Fêmea', price: 35 },
    ],
    art: { tail: 'crown', body: ['#3c74e6', '#12317f'], fin: ['#2d63d8', '#0b1a4a'], ears: false },
  },
  {
    id: 'ct-tricolor',
    name: 'Crowntail Tricolor',
    category: 'Crowntail',
    tagline: 'Corpo lilás, raios azuis e pontas vermelhas',
    description:
      'Três cores em degradê nas nadadeiras: azul perto do corpo e vermelho nas pontas da coroa.',
    size: '5 cm',
    age: '4 meses',
    badge: null,
    image: '/peixes/crowntail-tricolor.jpg',
    imagePos: '50% 46%',
    variants: [
      { sex: 'Macho', price: 75 },
      { sex: 'Fêmea', price: 35 },
    ],
    art: { tail: 'crown', body: ['#c9a0d6', '#5a5fb8'], fin: ['#2f6fe0', '#e3283c'], ears: false },
  },
  {
    id: 'hm-black-orchid',
    name: 'Halfmoon Black Orchid',
    category: 'Halfmoon',
    tagline: 'Preto com raios azul-elétrico',
    description:
      'Base quase preta com raios em azul iridescente. A cauda abre em meia-lua e muda de tom conforme a luz.',
    size: '5–6 cm',
    age: '5 meses',
    badge: null,
    image: '/peixes/halfmoon-black-orchid.jpg',
    imagePos: '50% 50%',
    variants: [
      { sex: 'Macho', price: 95 },
      { sex: 'Fêmea', price: 45 },
    ],
    art: { tail: 'half', body: ['#2a3550', '#0d1220'], fin: ['#3a8fd6', '#0b0f1a'], ears: false },
  },
  {
    id: 'hm-platinum',
    name: 'Halfmoon Platinum',
    category: 'Halfmoon',
    tagline: 'Branco perolado, cauda em meia-lua',
    description:
      'Todo em branco platinado com reflexo perolado. Cauda enorme e delicada, abrindo em 180°.',
    size: '5–6 cm',
    age: '5 meses',
    badge: 'Raro',
    image: '/peixes/halfmoon-platinum.jpg',
    imagePos: '50% 50%',
    variants: [
      { sex: 'Macho', price: 110 },
      { sex: 'Fêmea', price: 55 },
    ],
    art: { tail: 'half', body: ['#ffffff', '#c9d3df'], fin: ['#f7f9fc', '#aab7c8'], ears: false },
  },
  {
    id: 'hm-koi-galaxy',
    name: 'Halfmoon Koi Galaxy',
    category: 'Halfmoon',
    tagline: 'Manchas vermelhas, azuis e brancas',
    description:
      'Cada um tem um desenho diferente, como uma carpa koi: corpo branco marmorizado e cauda turquesa com vermelho.',
    size: '5 cm',
    age: '4 meses',
    badge: null,
    image: '/peixes/halfmoon-koi-galaxy.jpg',
    imagePos: '50% 50%',
    variants: [
      { sex: 'Macho', price: 100 },
      { sex: 'Fêmea', price: 50 },
    ],
    art: { tail: 'half', body: ['#fff4ea', '#d6233a'], fin: ['#3ab0d8', '#d6233a'], ears: false, koi: true },
  },
];
