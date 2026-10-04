import fs from 'fs';
import path from 'path';
import { Product, Sauce } from './types.js';
import { syncProductToSupabase } from './supabase-sync.js';
import { autoProcessWebPImage } from '../helpers/image-utils.js';

export const initialSauces: Sauce[] = [
  { id: 1, name: 'Ají de Pollería Clásico', is_signature: true },
  { id: 2, name: 'Tártara Criolla', is_signature: true },
  { id: 3, name: 'Mayonesa de la Casa', is_signature: false },
  { id: 4, name: 'Crema de Rocoto Macho', is_signature: true },
  { id: 5, name: 'Salsa Acevichada', is_signature: true },
  { id: 6, name: 'Chimichurri Selvático', is_signature: true }
];

export const initialProducts: Product[] = [
  {
    id: 'PL0001',
    code: 'PL0001',
    name: 'PROMO BUCHI DUO',
    category_id: 'C0001',
    category: 'promociones',
    price: 22,
    description: 'Una experiencia pensada para dos. Disfruta de dos Hamburguesas Tipo Clásica elaboradas con nuestra hamburguesa artesanal premium, acompañadas de dos Gaseosas Personales Pepsi.',
    badge: 'DUO',
    popular: true,
    available: true,
    stock: 50,
    image: '/imagenes/portada/Portada2E.webp',
    includes_sauces: true,
    accompaniments: ['Papa crocante', 'Hamburguesa artesanal', 'Ensalada fresca'],
    cremas: ['Mayonesa', 'Mostaza', 'Ketchup', 'Ají de Rocoto', 'Tártara']
  },
  {
    id: 'PL0002',
    code: 'PL0002',
    name: 'PROMO BROASTER FAMILIAR',
    category_id: 'C0001',
    category: 'promociones',
    price: 38,
    description: 'La selección ideal para compartir en familia. Incluye un Broaster Presa Pecho, un Broaster Presa Pierna y un Broaster Presa Ala, más Inca Kola.',
    badge: 'FAMILIAR',
    popular: true,
    available: true,
    stock: 50,
    image: '/imagenes/portada/Portada1E.webp',
    includes_sauces: true,
    accompaniments: ['Papas Fritas', 'Inca Kola 1.5L'],
    cremas: ['Mostaza', 'Ketchup', 'Ají de Rocoto']
  },
  {
    id: 'PL0003',
    code: 'PL0003',
    name: 'PROMO SALCHI BURGER',
    category_id: 'C0001',
    category: 'promociones',
    price: 24,
    description: 'La fusión de nuestros dos clásicos más pedidos. Una Hamburguesa Tipo Cheese Burguer y una Salchipapa Clásica, con Coca Cola.',
    badge: 'COMBO',
    popular: true,
    available: true,
    stock: 50,
    image: '/imagenes/portada/Portada3E.webp',
    includes_sauces: true,
    accompaniments: ['Queso cheddar', 'Papa crocante', 'Ensalada fresca'],
    cremas: ['Mayonesa', 'Mostaza', 'Ketchup', 'Ají de Rocoto', 'Tártara']
  },
  {
    id: 'PL0004',
    code: 'PL0004',
    name: 'PROMO SELVA POWER',
    category_id: 'C0001',
    category: 'promociones',
    price: 29,
    description: 'Un homenaje a la Amazonía. Tacacho con Cecina y Salchibroaster Pierna Presa Pierna, con Gaseosa Fanta.',
    badge: 'AMAZÓNICO',
    popular: true,
    available: true,
    stock: 50,
    image: '/imagenes/portada/Portada4E.webp',
    includes_sauces: true,
    accompaniments: ['Maduros fritos', 'Sarza criolla', 'Papa crocante', 'Ensalada fresca'],
    cremas: ['Mayonesa', 'Mostaza', 'Ketchup', 'Ají de Rocoto', 'Tártara']
  }
];

const PRODUCTS_DIR = path.join(process.cwd(), 'backend', 'data', 'products');

export function loadProductsFromDisk(): Product[] {
  try {
    if (fs.existsSync(PRODUCTS_DIR)) {
      const files = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.json'));
      if (files.length > 0) {
        const loaded: Product[] = [];
        for (const file of files) {
          try {
            const raw = fs.readFileSync(path.join(PRODUCTS_DIR, file), 'utf-8');
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
    console.error('Error al cargar productos desde disco:', err);
  }

  saveProductsToDisk(initialProducts);
  return [...initialProducts];
}

export function saveProductsToDisk(data?: Product[]) {
  try {
    const list = data || productsStore;
    if (!fs.existsSync(PRODUCTS_DIR)) fs.mkdirSync(PRODUCTS_DIR, { recursive: true });

    const currentIds = new Set<string>();
    for (const item of list) {
      const fileId = item.id || item.code || `prod-${Date.now()}`;
      currentIds.add(fileId);
      fs.writeFileSync(path.join(PRODUCTS_DIR, `${fileId}.json`), JSON.stringify(item, null, 2), 'utf-8');
    }

    const filesOnDisk = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.json'));
    for (const file of filesOnDisk) {
      const id = path.basename(file, '.json');
      if (!currentIds.has(id)) {
        try { fs.unlinkSync(path.join(PRODUCTS_DIR, file)); } catch (e) {}
      }
    }
  } catch (err) {
    console.error('Error al guardar productos en disco:', err);
  }
}

let productsStore: Product[] = loadProductsFromDisk();
const saucesStore = [...initialSauces];

export function generateNextProductId(): string {
  productsStore = loadProductsFromDisk();
  let maxNum = 0;
  for (const p of productsStore) {
    const match = (p.id || '').match(/^PL(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  if (maxNum === 0) maxNum = 57;
  const nextNum = maxNum + 1;
  return `PL${String(nextNum).padStart(4, '0')}`;
}

export function normalizeName(str: string): string {
  return String(str || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function isDuplicateProductName(name: string, excludeId?: string): boolean {
  const norm = normalizeName(name);
  if (!norm) return false;
  productsStore = loadProductsFromDisk();
  return productsStore.some(p => 
    (excludeId ? (p.id !== excludeId && p.code !== excludeId) : true) && 
    normalizeName(p.name) === norm
  );
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
  productsStore = loadProductsFromDisk();
  let list = productsStore;
  if (categoryId) {
    list = list.filter(p => p.category_id === categoryId || p.category === categoryId);
  }
  return [...list].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
}

export async function getProductById(id: string): Promise<Product | null> {
  productsStore = loadProductsFromDisk();
  const product = productsStore.find(p => p.id === id || p.code === id);
  return product || null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  productsStore = loadProductsFromDisk();
  const search = normalizeName(slug);
  const found = productsStore.find(p => normalizeName(p.name) === search || p.id === slug || p.code === slug);
  return found || null;
}

export async function getSauces(): Promise<Sauce[]> {
  return saucesStore;
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  productsStore = loadProductsFromDisk();
  const rawName = data.name || 'Nuevo Plato';
  if (isDuplicateProductName(rawName, data.id)) {
    throw new Error(`Ya existe un plato registrado con el nombre "${rawName}". Evita nombres duplicados.`);
  }
  const nextId = (data.id && data.id.startsWith('PL')) ? data.id : generateNextProductId();
  const processedImage = await autoProcessWebPImage(data.image, 'productos', nextId);

  const newProduct: Product = {
    id: nextId,
    code: nextId,
    name: data.name || 'Nuevo Plato',
    category_id: data.category_id || data.category || 'C0001',
    category: data.category || data.category_id || 'promociones',
    price: typeof data.price === 'number' ? data.price : (parseFloat(String(data.price || '0')) || 0),
    description: data.description || '',
    badge: data.badge || null,
    popular: Boolean(data.popular),
    available: data.available !== false,
    stock: typeof data.stock === 'number' ? data.stock : (parseInt(String(data.stock || '0'), 10) || 0),
    image: processedImage,
    includes_sauces: Boolean(data.includes_sauces),
    accompaniments: Array.isArray(data.accompaniments) ? data.accompaniments : [],
    cremas: Array.isArray(data.cremas) ? data.cremas : []
  };
  productsStore.unshift(newProduct);
  saveProductsToDisk();
  syncProductToSupabase(newProduct, 'upsert');
  return newProduct;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  const index = productsStore.findIndex(p => p.id === id || p.code === id);
  if (index === -1) return null;
  
  if (data.name && isDuplicateProductName(data.name, id)) {
    throw new Error(`Ya existe otro plato registrado con el nombre "${data.name}". Evita nombres duplicados.`);
  }
  
  const processedImage = data.image !== undefined ? await autoProcessWebPImage(data.image, 'productos', id) : productsStore[index].image;

  productsStore[index] = {
    ...productsStore[index],
    ...data,
    image: processedImage,
    price: data.price !== undefined ? Number(data.price) : productsStore[index].price,
    stock: data.stock !== undefined ? Number(data.stock) : productsStore[index].stock,
    category_id: data.category_id || data.category || productsStore[index].category_id,
    category: data.category || data.category_id || productsStore[index].category,
    accompaniments: Array.isArray(data.accompaniments) ? data.accompaniments : productsStore[index].accompaniments,
    cremas: Array.isArray(data.cremas) ? data.cremas : productsStore[index].cremas
  };
  saveProductsToDisk();
  syncProductToSupabase(productsStore[index], 'upsert');
  return productsStore[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  productsStore = loadProductsFromDisk();
  const searchId = (id || '').trim().toLowerCase();
  const initialLen = productsStore.length;
  const target = productsStore.find(p => 
    (p.id || '').toLowerCase() === searchId || 
    (p.code || '').toLowerCase() === searchId
  );
  productsStore = productsStore.filter(p => 
    (p.id || '').toLowerCase() !== searchId && 
    (p.code || '').toLowerCase() !== searchId
  );
  saveProductsToDisk();
  if (target) {
    syncProductToSupabase(target, 'delete');
  }
  return productsStore.length < initialLen;
}

export async function updateProductStock(id: string, availableOrStock?: boolean | number, newStock?: number): Promise<Product | null> {
  if (typeof availableOrStock === 'boolean') {
    return await updateProduct(id, { available: availableOrStock, stock: newStock !== undefined ? newStock : (availableOrStock ? 15 : 0) });
  } else if (typeof availableOrStock === 'number') {
    return await updateProduct(id, { stock: availableOrStock, available: availableOrStock > 0 });
  }
  return await getProductById(id);
}

export async function checkCartStock(items: Array<{ id?: string; code?: string; name?: string; quantity: number }>): Promise<{ valid: boolean; message: string; outOfStockItems: string[] }> {
  productsStore = loadProductsFromDisk();
  const outOfStockItems: string[] = [];

  for (const item of items) {
    const p = productsStore.find(prod => 
      (item.id && (prod.id === item.id || prod.code === item.id)) ||
      (item.code && (prod.id === item.code || prod.code === item.code)) ||
      (item.name && normalizeName(prod.name) === normalizeName(item.name))
    );

    if (p) {
      if (!p.available || p.stock < item.quantity) {
        outOfStockItems.push(`${p.name} (Stock disponible: ${p.stock})`);
      }
    }
  }

  const valid = outOfStockItems.length === 0;
  const message = valid ? 'Stock disponible' : `Platos agotados o sin stock suficiente: ${outOfStockItems.join(', ')}`;

  return {
    valid,
    message,
    outOfStockItems
  };
}

export async function deductCartStock(items: Array<{ id?: string; code?: string; name?: string; quantity: number }>): Promise<boolean> {
  productsStore = loadProductsFromDisk();

  for (const item of items) {
    const p = productsStore.find(prod => 
      (item.id && (prod.id === item.id || prod.code === item.id)) ||
      (item.code && (prod.id === item.code || prod.code === item.code)) ||
      (item.name && normalizeName(prod.name) === normalizeName(item.name))
    );

    if (p) {
      p.stock = Math.max(0, p.stock - item.quantity);
      if (p.stock === 0) {
        p.available = false;
      }
    }
  }

  saveProductsToDisk();
  return true;
}
