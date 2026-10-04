import fs from 'fs';
import path from 'path';
import { Category } from './types.js';
import { syncCategoryToSupabase } from './supabase-sync.js';
import { autoProcessWebPImage } from '../helpers/image-utils.js';

export const initialCategories: Category[] = [
  { id: 'C0001', code: 'C0001', slug: 'promociones', name: 'PROMOCIONES', icon: 'BadgePercent', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80' },
  { id: 'C0002', code: 'C0002', slug: 'alitas', name: 'ALITAS', icon: 'Flame', image: '/imagenes/categorias/alitas/banner.webp' },
  { id: 'C0003', code: 'C0003', slug: 'bebidas', name: 'BEBIDAS', icon: 'CupSoda', image: '/imagenes/categorias/bebidas/banner.webp' },
  { id: 'C0004', code: 'C0004', slug: 'broaster', name: 'BROASTER', icon: 'Drumstick', image: '/imagenes/categorias/broaster/banner.webp' },
  { id: 'C0005', code: 'C0005', slug: 'hamburguesas', name: 'HAMBURGUESAS', icon: 'Beef', image: '/imagenes/categorias/hamburguesas/banner.webp' },
  { id: 'C0006', code: 'C0006', slug: 'infusiones', name: 'INFUSIONES', icon: 'Coffee', image: '/imagenes/categorias/infusiones/banner.webp' },
  { id: 'C0007', code: 'C0007', slug: 'platos-amazonicos', name: 'PLATOS AMAZÓNICOS', icon: 'Utensils', image: '/imagenes/categorias/platos-amazonicos/banner.webp' },
  { id: 'C0008', code: 'C0008', slug: 'refrescos', name: 'REFRESCOS', icon: 'GlassWater', image: '/imagenes/categorias/refrescos/banner.webp' },
  { id: 'C0009', code: 'C0009', slug: 'salchipapas', name: 'SALCHIPAPAS Y SALCHIBROASTERS', icon: 'Layers', image: '/imagenes/categorias/salchipapas-y-salchibroasters/banner.webp' },
  { id: 'C0010', code: 'C0010', slug: 'adicional', name: 'ADICIONAL', icon: 'PlusCircle', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&auto=format&fit=crop&q=80' }
];

const CATEGORIES_DIR = path.join(process.cwd(), 'data', 'categories');

export function loadCategoriesFromDisk(): Category[] {
  try {
    if (fs.existsSync(CATEGORIES_DIR)) {
      const files = fs.readdirSync(CATEGORIES_DIR).filter(f => f.endsWith('.json'));
      if (files.length > 0) {
        const loaded: Category[] = [];
        for (const file of files) {
          try {
            const raw = fs.readFileSync(path.join(CATEGORIES_DIR, file), 'utf-8');
            const parsed = JSON.parse(raw);
            if (parsed && (parsed.id || parsed.name)) {
              loaded.push(parsed);
            }
          } catch (e) {}
        }
        if (loaded.length > 0) return loaded;
      }
    }
  } catch (err) {
    console.error('Error al cargar categorías desde disco:', err);
  }

  saveCategoriesToDisk(initialCategories);
  return [...initialCategories];
}

export function saveCategoriesToDisk(data?: Category[]) {
  try {
    const list = data || categoriesStore;
    if (!fs.existsSync(CATEGORIES_DIR)) fs.mkdirSync(CATEGORIES_DIR, { recursive: true });

    const currentIds = new Set<string>();
    for (const item of list) {
      const fileId = item.id || item.code || `cat-${Date.now()}`;
      currentIds.add(fileId);
      fs.writeFileSync(path.join(CATEGORIES_DIR, `${fileId}.json`), JSON.stringify(item, null, 2), 'utf-8');
    }

    const filesOnDisk = fs.readdirSync(CATEGORIES_DIR).filter(f => f.endsWith('.json'));
    for (const file of filesOnDisk) {
      const id = path.basename(file, '.json');
      if (!currentIds.has(id)) {
        try { fs.unlinkSync(path.join(CATEGORIES_DIR, file)); } catch (e) {}
      }
    }
  } catch (err) {
    console.error('Error al guardar categorías en disco:', err);
  }
}

let categoriesStore: Category[] = loadCategoriesFromDisk();

export function generateNextCategoryId(): string {
  categoriesStore = loadCategoriesFromDisk();
  let maxNum = 0;
  for (const c of categoriesStore) {
    const match = (c.id || c.code || '').match(/^C(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const nextNum = maxNum + 1;
  return `C${String(nextNum).padStart(4, '0')}`;
}

export async function getCategories(): Promise<Category[]> {
  categoriesStore = loadCategoriesFromDisk();
  return [...categoriesStore].sort((a, b) => {
    const isPromoA = (a.slug === 'promociones' || a.id === 'C0001');
    const isPromoB = (b.slug === 'promociones' || b.id === 'C0001');
    if (isPromoA && !isPromoB) return -1;
    if (!isPromoA && isPromoB) return 1;
    return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
  });
}

export async function getCategoryById(id: string): Promise<Category | null> {
  categoriesStore = loadCategoriesFromDisk();
  const searchId = (id || '').trim().toLowerCase();
  const found = categoriesStore.find(c => 
    (c.id || '').toLowerCase() === searchId || 
    (c.code || '').toLowerCase() === searchId || 
    (c.slug || '').toLowerCase() === searchId
  );
  return found || null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  categoriesStore = loadCategoriesFromDisk();
  const searchSlug = (slug || '').trim().toLowerCase();
  const found = categoriesStore.find(c => 
    (c.slug || '').toLowerCase() === searchSlug || 
    (c.id || '').toLowerCase() === searchSlug
  );
  return found || null;
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  categoriesStore = loadCategoriesFromDisk();
  const nameUpper = (data.name || 'NUEVA CATEGORÍA').toUpperCase().trim();
  const slug = data.slug || nameUpper.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-') || `cat-${Date.now()}`;

  const existingIndex = categoriesStore.findIndex(c => 
    c.name.trim().toUpperCase() === nameUpper || 
    (c.slug && c.slug.toLowerCase() === slug.toLowerCase()) ||
    (data.id && (c.id === data.id || c.code === data.id))
  );

  if (existingIndex !== -1) {
    const processedImage = data.image !== undefined ? await autoProcessWebPImage(data.image, 'categorias', slug) : (categoriesStore[existingIndex].image || '');
    categoriesStore[existingIndex] = {
      ...categoriesStore[existingIndex],
      name: nameUpper,
      slug: slug || categoriesStore[existingIndex].slug,
      image: processedImage,
      icon: data.icon || categoriesStore[existingIndex].icon || 'Utensils',
      description: data.description || categoriesStore[existingIndex].description || `Especialidades de ${nameUpper}`
    };
    saveCategoriesToDisk();
    syncCategoryToSupabase(categoriesStore[existingIndex], 'upsert');
    return categoriesStore[existingIndex];
  }

  const nextId = (data.id && data.id.startsWith('C')) ? data.id : generateNextCategoryId();
  const processedImage = await autoProcessWebPImage(data.image, 'categorias', slug);

  const newCat: Category = {
    id: nextId,
    code: nextId,
    slug,
    name: nameUpper,
    icon: data.icon || 'Utensils',
    image: processedImage || '/imagenes/categorias/postres/banner.webp',
    description: data.description || `Especialidades de ${nameUpper}`
  };
  categoriesStore.push(newCat);
  saveCategoriesToDisk();
  syncCategoryToSupabase(newCat, 'upsert');
  return newCat;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
  categoriesStore = loadCategoriesFromDisk();
  const searchId = (id || '').trim().toLowerCase();
  const index = categoriesStore.findIndex(c => 
    (c.id || '').toLowerCase() === searchId || 
    (c.code || '').toLowerCase() === searchId || 
    (c.slug || '').toLowerCase() === searchId
  );
  if (index === -1) return null;
  const nameUpper = data.name ? data.name.toUpperCase().trim() : categoriesStore[index].name;
  const slug = data.slug || nameUpper.toLowerCase().replace(/[^a-z0-9]+/g, '-') || categoriesStore[index].slug;
  const processedImage = data.image !== undefined ? await autoProcessWebPImage(data.image, 'categorias', slug) : (categoriesStore[index].image || '');

  categoriesStore[index] = {
    ...categoriesStore[index],
    name: nameUpper,
    slug,
    image: processedImage
  };
  saveCategoriesToDisk();
  syncCategoryToSupabase(categoriesStore[index], 'upsert');
  return categoriesStore[index];
}

export async function deleteCategory(id: string): Promise<boolean> {
  categoriesStore = loadCategoriesFromDisk();
  const searchId = (id || '').trim().toLowerCase();
  const initialLen = categoriesStore.length;
  const target = categoriesStore.find(c => 
    (c.id || '').toLowerCase() === searchId || 
    (c.code || '').toLowerCase() === searchId || 
    (c.slug || '').toLowerCase() === searchId
  );
  const filtered = categoriesStore.filter(c => 
    (c.id || '').toLowerCase() !== searchId && 
    (c.code || '').toLowerCase() !== searchId && 
    (c.slug || '').toLowerCase() !== searchId
  );
  categoriesStore.length = 0;
  categoriesStore.push(...filtered);
  saveCategoriesToDisk();
  if (target) {
    syncCategoryToSupabase(target, 'delete');
  }
  return categoriesStore.length < initialLen;
}
