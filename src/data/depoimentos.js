// Depoimentos de clientes: ficam em src/data/catalog.json (campo "depoimentos")
// e podem ser cadastrados pelo painel do site (/?painel).
// Enquanto a lista estiver vazia, a seção não aparece. Use só depoimentos reais.
import catalog from './catalog.json';

export const DEPOIMENTOS = catalog.depoimentos || [];
export const INSTAGRAM_POSTS = catalog.instagramPosts || [];
