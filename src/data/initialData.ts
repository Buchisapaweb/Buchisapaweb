import { Product, Category, StoreConfig, Order, SupplyItem, UtensilItem } from '../types';
import rawCategories from '../../datos/categorias.json';
import rawProducts from '../../datos/productos.json';

// Category banner image fallbacks for crisp visuals
export const CATEGORY_BANNERS: Record<string, string> = {
  'adicionales': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
  'alitas': 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&auto=format&fit=crop&q=80',
  'bebidas': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80',
  'broaster': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80',
  'hamburguesas': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
  'infusiones': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
  'platos-amazonicos': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
  'promociones': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80',
  'refrescos': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
  'salchipapas-y-salchibroasters': 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&auto=format&fit=crop&q=80',
};

// Map product local images to authentic food images
const PRODUCT_IMAGE_FALLBACKS: Record<string, string> = {
  'PL00006': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80', // Chaufa Amazónico
  'PL00055': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', // Tacacho con Cecina
};

export const INITIAL_CATEGORIES: Category[] = (rawCategories as Category[]).map(cat => ({
  ...cat,
  banner: CATEGORY_BANNERS[cat.slug] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
}));

export const INITIAL_PRODUCTS: Product[] = (rawProducts as Product[]).map(prod => {
  let img = prod.image;
  if (!img || img.startsWith('/') || img.includes('webp')) {
    img = PRODUCT_IMAGE_FALLBACKS[prod.id] || CATEGORY_BANNERS[prod.categoria_slug] || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80';
  }
  return {
    ...prod,
    image: img
  };
});

export const AVAILABLE_SAUCES = [
  { id: 'aji-pollero', name: 'Ají Pollero Artesanal', tag: 'Clásico' },
  { id: 'crema-rocoto', name: 'Crema de Rocoto', tag: 'Picante' },
  { id: 'aji-cocona', name: 'Ají de Cocona Amazónico', tag: 'Selva' },
  { id: 'mayonesa', name: 'Mayonesa Casera', tag: 'Suave' },
  { id: 'tartara', name: 'Salsa Tártara', tag: 'Especial' },
  { id: 'ketchup', name: 'Kétchup', tag: '' },
  { id: 'mostaza', name: 'Mostaza', tag: '' },
  { id: 'acevichada', name: 'Crema Acevichada', tag: 'Favorito' }
];

export const AVAILABLE_EXTRAS = [
  { id: 'extra-huevo', name: 'Huevo frito montado', price: 2.0 },
  { id: 'extra-queso', name: 'Queso fundido / cheddar', price: 2.0 },
  { id: 'extra-platano', name: 'Plátano maduro frito', price: 2.0 },
  { id: 'extra-tocino', name: 'Tocino crujiente', price: 2.0 },
  { id: 'extra-papas', name: 'Porción extra de papas fritas', price: 5.0 },
  { id: 'extra-carne', name: 'Carne artesanal adicional', price: 5.0 },
  { id: 'extra-arroz', name: 'Porción de arroz blanco', price: 3.0 }
];

export const INITIAL_STORE_CONFIG: StoreConfig = {
  isOpen: true,
  name: 'BuchiSapa',
  address: 'Av. Gran Chimú / Santa Clara, Ate',
  district: 'Santa Clara, Ate',
  city: 'Lima - Perú',
  schedule: 'Lunes a Domingo: 6:00 PM - 5:00 AM',
  phone: '+51 987 654 321',
  whatsapp: '51987654321',
  deliveryFee: 5.0,
  minOrder: 15.0
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    code: 'BS-8421',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
    customerName: 'Carlos Mendoza',
    customerPhone: '984512349',
    orderType: 'delivery',
    address: 'Jr. Los Sauces 342, Urb. Santa Clara, Ate',
    reference: 'Frente al parque infantil, reja negra',
    items: [
      {
        cartId: 'c1',
        product: INITIAL_PRODUCTS.find(p => p.id === 'PL00041') || INITIAL_PRODUCTS[0], // PROMO BROASTER FAMILIAR
        quantity: 1,
        selectedSauces: ['Ají Pollero Artesanal', 'Mayonesa Casera', 'Ají de Cocona Amazónico'],
        selectedExtras: [],
        notes: 'Bien doradito el pollo por favor',
        unitPriceWithExtras: 38,
        totalPrice: 38
      },
      {
        cartId: 'c2',
        product: INITIAL_PRODUCTS.find(p => p.id === 'PL00018') || INITIAL_PRODUCTS[1], // Cocona
        quantity: 2,
        selectedSauces: [],
        selectedExtras: [],
        notes: 'Heladita',
        unitPriceWithExtras: 3,
        totalPrice: 6
      }
    ],
    subtotal: 44,
    deliveryFee: 5,
    total: 49,
    paymentMethod: 'yape',
    status: 'preparing',
    notes: 'Cliente frecuente'
  },
  {
    id: 'ord-1002',
    code: 'BS-8422',
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 mins ago
    customerName: 'Lucía Fernández',
    customerPhone: '912845671',
    orderType: 'delivery',
    address: 'Mz. B Lote 14, Coop. Santa Clara, Ate',
    reference: 'A 2 cuadras de la Carretera Central',
    items: [
      {
        cartId: 'c3',
        product: INITIAL_PRODUCTS.find(p => p.id === 'PL00055') || INITIAL_PRODUCTS[2], // Tacacho con Cecina
        quantity: 2,
        selectedSauces: ['Ají de Cocona Amazónico', 'Crema de Rocoto'],
        selectedExtras: [
          { id: 'extra-platano', name: 'Plátano maduro frito', price: 2.0 }
        ],
        notes: 'Cecina bien jugosa',
        unitPriceWithExtras: 14,
        totalPrice: 28
      },
      {
        cartId: 'c4',
        product: INITIAL_PRODUCTS.find(p => p.id === 'PL00003') || INITIAL_PRODUCTS[3], // Aguajina
        quantity: 2,
        selectedSauces: [],
        selectedExtras: [],
        notes: '',
        unitPriceWithExtras: 3,
        totalPrice: 6
      }
    ],
    subtotal: 34,
    deliveryFee: 5,
    total: 39,
    paymentMethod: 'plin',
    status: 'pending'
  },
  {
    id: 'ord-1003',
    code: 'BS-8420',
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    customerName: 'Renzo Paredes',
    customerPhone: '956123487',
    orderType: 'pickup',
    address: 'Recojo en Local (Santa Clara)',
    reference: 'Pasa a recoger en moto',
    items: [
      {
        cartId: 'c5',
        product: INITIAL_PRODUCTS.find(p => p.id === 'PL00044') || INITIAL_PRODUCTS[4], // PROMO SELVA POWER
        quantity: 1,
        selectedSauces: ['Ají Pollero Artesanal', 'Tártara'],
        selectedExtras: [
          { id: 'extra-huevo', name: 'Huevo frito montado', price: 2.0 }
        ],
        notes: 'Para llevar en bolsa doble',
        unitPriceWithExtras: 31,
        totalPrice: 31
      }
    ],
    subtotal: 31,
    deliveryFee: 0,
    total: 31,
    paymentMethod: 'efectivo',
    cashChangeFor: 50,
    status: 'delivery'
  },
  {
    id: 'ord-1000',
    code: 'BS-8419',
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    customerName: 'Mariana Quispe',
    customerPhone: '974823199',
    orderType: 'delivery',
    address: 'Av. Nicolás Ayllón Km 11.5, Ate',
    reference: 'Edificio Los Robles dpto 302',
    items: [
      {
        cartId: 'c6',
        product: INITIAL_PRODUCTS.find(p => p.id === 'PL00001') || INITIAL_PRODUCTS[0], // Alitas Acevichadas
        quantity: 2,
        selectedSauces: ['Crema Acevichada', 'Ají Pollero Artesanal'],
        selectedExtras: [
          { id: 'extra-papas', name: 'Porción extra de papas fritas', price: 5.0 }
        ],
        notes: 'Papas bien crocantes',
        unitPriceWithExtras: 20,
        totalPrice: 40
      }
    ],
    subtotal: 40,
    deliveryFee: 5,
    total: 45,
    paymentMethod: 'yape',
    status: 'completed'
  }
];

export const INITIAL_SUPPLIES: SupplyItem[] = [
  { id: 'sup-1', name: 'Pollo fresco en presas (pecho, pierna, alas)', category: 'Carnes', quantity: 45, unit: 'kg', minStock: 20, status: 'ok' },
  { id: 'sup-2', name: 'Cecina ahumada de Tarapoto', category: 'Carnes', quantity: 18, unit: 'kg', minStock: 10, status: 'ok' },
  { id: 'sup-3', name: 'Chorizo amazónico parrillero', category: 'Carnes', quantity: 14, unit: 'kg', minStock: 8, status: 'ok' },
  { id: 'sup-4', name: 'Plátano verde bellaco (para tacacho)', category: 'Frutas / Verduras', quantity: 60, unit: 'racimos', minStock: 25, status: 'ok' },
  { id: 'sup-5', name: 'Plátano maduro de la selva', category: 'Frutas / Verduras', quantity: 40, unit: 'racimos', minStock: 15, status: 'ok' },
  { id: 'sup-6', name: 'Cocona fresca amazónica', category: 'Frutas / Verduras', quantity: 12, unit: 'kg', minStock: 15, status: 'low' },
  { id: 'sup-7', name: 'Pulpa de aguaje pura', category: 'Insumos bebidas', quantity: 8, unit: 'kg', minStock: 10, status: 'low' },
  { id: 'sup-8', name: 'Papas nativas procesadas para freír', category: 'Tubérculos', quantity: 80, unit: 'kg', minStock: 30, status: 'ok' },
  { id: 'sup-9', name: 'Harina especial y especias secretas broaster', category: 'Secos', quantity: 35, unit: 'kg', minStock: 15, status: 'ok' },
  { id: 'sup-10', name: 'Aceite vegetal de alto rendimiento', category: 'Aceites', quantity: 60, unit: 'litros', minStock: 20, status: 'ok' },
  { id: 'sup-11', name: 'Envases térmicos biodegradables para delivery', category: 'Descartables', quantity: 280, unit: 'unidades', minStock: 100, status: 'ok' }
];

export const INITIAL_UTENSILS: UtensilItem[] = [
  { id: 'ut-1', name: 'Freidora industrial a presión (Broaster)', location: 'Área de Freído 1', status: 'operativo', lastChecked: 'Hoy 16:30' },
  { id: 'ut-2', name: 'Freidora de papas de doble canastilla', location: 'Área de Freído 2', status: 'operativo', lastChecked: 'Hoy 16:30' },
  { id: 'ut-3', name: 'Plancha parrillera de hamburguesas y cecina', location: 'Estación de Plancha', status: 'operativo', lastChecked: 'Hoy 16:45' },
  { id: 'ut-4', name: 'Mazo tradicional de tacacho en madera', location: 'Estación Amazónica', status: 'operativo', lastChecked: 'Hoy 17:00' },
  { id: 'ut-5', name: 'Impresora térmica de comandas 80mm', location: 'Caja & Despacho', status: 'operativo', lastChecked: 'Hoy 17:15' },
  { id: 'ut-6', name: 'Conservadora / Congelador de carnes -18°C', location: 'Almacén Frío', status: 'operativo', lastChecked: 'Hoy 16:00' }
];
