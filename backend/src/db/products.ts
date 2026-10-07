import fs from 'fs';
import path from 'path';
import { Product } from './types';

const initialProducts: Product[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'backend/src/db/products.json'), 'utf8')
);

export let productsStore: Product[] = [...initialProducts];

export async function getProducts(categoryId?: string): Promise<Product[]> {
  let list = productsStore;
  if (categoryId) {
    const norm = categoryId.toLowerCase().trim();
    // Assuming CATEGORY_SLUG_TO_ID map is available or imported from categories.ts
    // For now, let's just keep the filtering logic
    list = list.filter(p => p.category_id === categoryId || p.category_id.toLowerCase() === norm);
  }
  return [...list].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
}

export async function getProductById(id: string): Promise<Product | null> {
  return productsStore.find(p => p.id === id) || null;
}

export async function checkCartStock(checkItems: { id: string; quantity: number; name?: string }[]) {
  const outOfStockItems: any[] = [];
  const itemsStatus: any[] = [];

  for (const item of checkItems) {
    const product = productsStore.find(p => p.id === item.id);
    if (!product) {
      itemsStatus.push({ id: item.id, available: true, stock: 10 });
      continue;
    }

    const isAvailable = product.available && product.stock >= item.quantity;
    itemsStatus.push({
      id: product.id,
      name: product.name,
      available: isAvailable,
      stock: product.stock,
      requested: item.quantity
    });

    if (!isAvailable) {
      outOfStockItems.push({
        id: product.id,
        name: product.name,
        available: product.available,
        stock: product.stock,
        requested: item.quantity
      });
    }
  }

  const valid = outOfStockItems.length === 0;
  return {
    valid,
    message: valid ? 'Stock disponible' : 'Algunos productos no tienen stock suficiente',
    outOfStockItems,
    itemsStatus
  };
}

export async function deductCartStock(checkItems: { id: string; quantity: number; name?: string }[]) {
  for (const item of checkItems) {
    const product = productsStore.find(p => p.id === item.id);
    if (product) {
      product.stock = Math.max(0, product.stock - (item.quantity || 1));
      if (product.stock === 0) {
        product.available = false;
      }
    }
  }
}

export async function updateProductStock(id: string, available: boolean, stock?: number): Promise<Product | null> {
  const product = productsStore.find(p => p.id === id);
  if (!product) return null;
  product.available = available;
  if (typeof stock === 'number') {
    product.stock = stock;
    if (product.stock === 0) {
      product.available = false;
    }
  }
  return product;
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const newProduct: Product = {
    id: data.id || `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: data.name || 'Nuevo Producto',
    category_id: data.category_id || 'hamburguesas',
    price: Number(data.price) || 10,
    description: data.description || '',
    badge: data.badge || null,
    popular: Boolean(data.popular),
    available: data.available !== false,
    stock: typeof data.stock === 'number' ? data.stock : 25,
    image: data.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    includes_sauces: Boolean(data.includes_sauces),
    has_accompaniment: Boolean(data.has_accompaniment),
    has_notes: Boolean(data.has_notes)
  };
  productsStore.unshift(newProduct);
  return newProduct;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  const index = productsStore.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  productsStore[index] = {
    ...productsStore[index],
    ...data,
    price: data.price !== undefined ? Number(data.price) : productsStore[index].price,
    stock: data.stock !== undefined ? Number(data.stock) : productsStore[index].stock
  };
  return productsStore[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const initialLen = productsStore.length;
  productsStore = productsStore.filter(p => p.id !== id);
  return productsStore.length < initialLen;
}
