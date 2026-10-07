import { Category } from './types';

export const categoriesStore: Category[] = [
  { id: "C0001", name: "ADICIONALES", icon: "Plus", description: "Complementos y adicionales", banner: "/imagenes/categorias/adicionales/banner.webp", order: 1, slug: "adicionales" },
  { id: "C0002", name: "ALITAS", icon: "Drumstick", description: "Alitas crujientes", banner: "/imagenes/categorias/alitas/banner.webp", order: 2, slug: "alitas" },
  { id: "C0003", name: "BEBIDAS", icon: "Coffee", description: "Bebidas", banner: "/imagenes/categorias/bebidas/banner.webp", order: 3, slug: "bebidas" },
  { id: "C0004", name: "BROASTER", icon: "Drumstick", description: "Pollo broaster", banner: "/imagenes/categorias/broaster/banner.webp", order: 4, slug: "broaster" },
  { id: "C0005", name: "HAMBURGUESAS", icon: "Beef", description: "Hamburguesas", banner: "/imagenes/categorias/hamburguesas/banner.webp", order: 5, slug: "hamburguesas" },
  { id: "C0006", name: "INFUSIONES", icon: "CupSoda", description: "Infusiones", banner: "/imagenes/categorias/infusiones/banner.webp", order: 6, slug: "infusiones" },
  { id: "C0007", name: "PLATOS AMAZÓNICOS", icon: "Flame", description: "Platos amazonicos", banner: "/imagenes/categorias/platos-amazonicos/banner.webp", order: 7, slug: "platos-amazonicos" },
  { id: "C0008", name: "PROMOCIONES", icon: "Sparkles", description: "Promociones", banner: "/imagenes/categorias/promociones/banner.webp", order: 8, slug: "promociones" },
  { id: "C0009", name: "REFRESCOS", icon: "GlassWater", description: "Refrescos", banner: "/imagenes/categorias/refrescos/banner.webp", order: 9, slug: "refrescos" },
  { id: "C0010", name: "SALCHIPAPAS Y SALCHIBROASTERS", icon: "Flame", description: "Salchipapas", banner: "/imagenes/categorias/salchipapas-y-salchibroasters/banner.webp", order: 10, slug: "salchipapas" }
];

export async function getCategories(): Promise<Category[]> {
  return [...categoriesStore].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const newCatId = data.id || `C00${categoriesStore.length + 1}`.slice(-5);
  const newCat: Category = {
    id: newCatId,
    code: data.code || newCatId,
    name: (data.name || 'NUEVA CATEGORÍA').toUpperCase().trim(),
    icon: data.icon || 'Flame',
    description: data.description || '',
    banner: data.banner || '/imagenes/categorias/platos-amazonicos/banner.webp',
    order: data.order || categoriesStore.length + 1,
    slug: data.slug || (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  };
  categoriesStore.push(newCat);
  return { ...newCat };
}
