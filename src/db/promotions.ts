import { Promotion } from './types.js';
import { getProducts, createProduct, updateProduct, deleteProduct } from './products.js';

export async function getPromotions(includeInactive = false): Promise<Promotion[]> {
  const products = await getProducts();
  let promoProducts = products.filter(p => p.category_id === 'C0001' || p.category_id === 'promociones' || p.category === 'promociones');
  if (!includeInactive) {
    promoProducts = promoProducts.filter(p => p.available !== false);
  }
  return promoProducts.map((p, idx) => ({
    id: p.id,
    title: p.name,
    description: p.description,
    price: p.price,
    originalPrice: p.originalPrice || p.original_price || p.price,
    image: p.image,
    badge: p.badge || '🔥 OFERTA',
    active: p.available !== false,
    order: idx + 1,
    features: p.accompaniments || [],
    createdAt: new Date().toISOString()
  }));
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  const promos = await getPromotions(true);
  return promos.find(item => item.id === id) || null;
}

export async function createPromotion(data: Partial<Promotion>): Promise<Promotion> {
  const newProd = await createProduct({
    name: data.title || 'NUEVA PROMOCIÓN',
    category_id: 'C0001',
    category: 'promociones',
    price: Number(data.price) || 0,
    originalPrice: Number(data.originalPrice) || Number(data.price) || 0,
    description: data.description || 'Promoción especial BuchiSapa',
    image: data.image || '/imagenes/portada/Portada1E.webp',
    badge: data.badge || 'PROMO',
    available: data.active !== false,
    stock: 50,
    accompaniments: Array.isArray(data.features) ? data.features : []
  });

  return {
    id: newProd.id,
    title: newProd.name,
    description: newProd.description,
    price: newProd.price,
    originalPrice: newProd.originalPrice || newProd.price,
    image: newProd.image,
    badge: newProd.badge || '🔥 OFERTA',
    active: newProd.available !== false,
    order: 1,
    features: newProd.accompaniments || [],
    createdAt: new Date().toISOString()
  };
}

export async function updatePromotion(id: string, data: Partial<Promotion>): Promise<Promotion | null> {
  const updatedProd = await updateProduct(id, {
    name: data.title,
    price: data.price,
    description: data.description,
    image: data.image,
    badge: data.badge,
    available: data.active
  });

  if (!updatedProd) return null;

  return {
    id: updatedProd.id,
    title: updatedProd.name,
    description: updatedProd.description,
    price: updatedProd.price,
    originalPrice: updatedProd.originalPrice || updatedProd.price,
    image: updatedProd.image,
    badge: updatedProd.badge || '🔥 OFERTA',
    active: updatedProd.available !== false,
    order: 1,
    features: updatedProd.accompaniments || [],
    createdAt: new Date().toISOString()
  };
}

export async function deletePromotion(id: string): Promise<boolean> {
  return await deleteProduct(id);
}

export async function reorderPromotions(orderedIds: string[]): Promise<Promotion[]> {
  return await getPromotions(true);
}
