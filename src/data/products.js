// ============================================================
//  O catálogo agora fica em  src/data/catalog.json
//  O jeito mais fácil de editar é pelo PAINEL do site:
//     https://SEU-SITE/?painel
//  (veja o README para configurar a senha do painel).
//
//  Também dá para editar o catalog.json na mão. Campos de cada item:
//    id            identificador único, sem espaços (ex.: "ct-camboja-lt")
//    name          nome que aparece no site
//    category      "Crowntail", "Halfmoon", "Dumbo", "Plakat", "Veiltail", "Outro",
//                  "Casal" ou "Acessório"
//    tagline       frase curta do card
//    description   texto da página de detalhes
//    size, age     tamanho e idade (podem ficar vazios em acessórios)
//    badge         selo vermelho do card (ex.: "Destaque", "Raro") ou null
//    image         foto principal (arquivo em /public/peixes/)
//    gallery       fotos extras:  ["/peixes/a.jpg", "/peixes/b.jpg"]
//    video         vídeo curto:   "/videos/nome.mp4"  (arquivo em /public/videos/)
//    variants      opções e preços: [{ "sex": "Macho", "price": 80 }]
//    realPhoto     true = selo "Foto real" (é exatamente o peixe da foto)
//    stock         quantidade máxima no pedido (1 = exemplar único)
//    featured      true = destaque do topo do site (use em um só)
//    sold          true = vai para "Vendidos recentemente", com botão "Avise-me"
// ============================================================
import catalog from './catalog.json';

export const PRODUCTS = catalog.products;

export const ACCESSORY = 'Acessório';
export const ALL_CATEGORIES = ['Crowntail', 'Halfmoon', 'Dumbo', 'Plakat', 'Veiltail', 'Outro', 'Casal', ACCESSORY];

export const isAccessory = (p) => p.category === ACCESSORY;

// Nome completo usado em mensagens e descrições: "Betta X", "Casal X" ou só "X" (acessório).
export const fullName = (p) =>
  isAccessory(p) ? p.name : p.category === 'Casal' ? `Casal de bettas ${p.name}` : `Betta ${p.name}`;

// Ilustração padrão para itens cadastrados sem foto.
export const DEFAULT_ART = { tail: 'half', body: ['#3c74e6', '#12317f'], fin: ['#2d63d8', '#0b1a4a'], ears: false };
