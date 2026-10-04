import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { autoProcessWebPImage } from '../lib/image-utils.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckgvgfpcxeqyilfphnsu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_XLQDJByokKbI5m0UVkJHEw_KRTygH9M';
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncCategoryToSupabase(category: { id: string; slug?: string; name: string; image?: string }, action: 'upsert' | 'delete') {
  try {
    if (action === 'delete') {
      await supabase.from('categories').delete().eq('id', category.id);
    } else {
      await supabase.from('categories').upsert({
        id: category.id,
        slug: category.slug,
        name: category.name,
        image: category.image || ''
      }, { onConflict: 'id' });
    }
  } catch (err: any) {
    console.warn('⚠️ Error sincronizando categoría a Supabase:', err.message);
  }
}

async function syncProductToSupabase(product: Product, action: 'upsert' | 'delete') {
  try {
    if (action === 'delete') {
      await supabase.from('products').delete().eq('id', product.id);
    } else {
      await supabase.from('products').upsert({
        id: product.id,
        name: product.name,
        category_id: product.category_id,
        category: product.category || '',
        price: product.price,
        description: product.description || '',
        available: product.available !== false,
        stock: product.stock || 50,
        image: product.image,
        includes_sauces: Boolean(product.includes_sauces),
        accompaniments: product.accompaniments || [],
        cremas: product.cremas || []
      }, { onConflict: 'id' });
    }
  } catch (err: any) {
    console.warn('⚠️ Error sincronizando producto a Supabase:', err.message);
  }
}

export interface Category {
  id: string;
  code?: string;
  slug?: string;
  name: string;
  icon?: string;
  image?: string;
  phrase?: string;
  description?: string;
}

export interface Product {
  id: string;
  code?: string;
  name: string;
  category_id: string;
  price: number;
  originalPrice?: number;
  original_price?: number;
  description: string;
  badge?: string | null;
  popular?: boolean;
  available: boolean;
  stock: number;
  image: string;
  options?: any;
  includes_sauces?: boolean;
  category?: string;
  accompaniments?: string[];
  cremas?: string[];
}

export interface Sauce {
  id: number;
  name: string;
  is_signature: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  badge: string;
  active?: boolean;
  order?: number;
  features?: string[];
  createdAt?: string;
}

export interface Order {
  id: string;
  orderNumber: number | string;
  orderCode?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderType: 'delivery' | 'pickup' | 'salon';
  deliveryAddress?: string;
  deliveryReference?: string;
  tableNumber?: string;
  paymentMethod: string;
  notes?: string;
  status: string;
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  items: any;
  userId?: string;
  createdAt: string;
}

export interface Claim {
  id: number;
  claimCode: string;
  fullName: string;
  docType: string;
  docNumber: string;
  phone: string;
  email: string;
  address: string;
  department?: string;
  province?: string;
  district?: string;
  branch?: string;
  orderNumber?: string;
  orderDate?: string;
  isMinor?: boolean;
  tutorName?: string;
  tutorDoc?: string;
  claimType: 'queja' | 'reclamo';
  contractedGood?: 'producto' | 'servicio';
  claimedAmount?: number;
  productDescription?: string;
  detail: string;
  consumerRequest: string;
  attachmentName?: string;
  status: string;
  createdAt: string;
}

// 1. CATEGORÍAS OFICIALES BUCHISAPA
const initialCategories: Category[] = [
  { id: 'alitas', code: '1001', name: 'ALITAS', icon: 'Drumstick', image: '/imagenes/categorias/alitas/banner.webp' },
  { id: 'bebidas', code: '1002', name: 'BEBIDAS', icon: 'Coffee', image: '/imagenes/categorias/bebidas/banner.webp' },
  { id: 'broaster', code: '1003', name: 'BROASTER', icon: 'Drumstick', image: '/imagenes/categorias/broaster/banner.webp' },
  { id: 'hamburguesas', code: '1004', name: 'HAMBURGUESAS', icon: 'Beef', image: '/imagenes/categorias/hamburguesas/banner.webp' },
  { id: 'infusiones', code: '1005', name: 'INFUSIONES', icon: 'CupSoda', image: '/imagenes/categorias/infusiones/banner.webp' },
  { id: 'platos-amazonicos', code: '1006', name: 'PLATOS AMAZÓNICOS', icon: 'Flame', image: '/imagenes/categorias/platos-amazonicos/banner.webp' },
  { id: 'refrescos', code: '1007', name: 'REFRESCOS', icon: 'GlassWater', image: '/imagenes/categorias/refrescos/banner.webp' },
  { id: 'salchipapas', code: '1008', name: 'SALCHIPAPAS Y SALCHIBROASTERS', icon: 'Flame', image: '/imagenes/categorias/salchipapas-y-salchibroasters/banner.webp' },
  { id: 'promociones', code: '1009', name: 'PROMOCIONES', icon: 'BadgePercent', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80' },
  { id: 'adicional', code: '1010', name: 'ADICIONAL', icon: 'PlusCircle', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&auto=format&fit=crop&q=80' }
];

// 2. SALSAS DE LA CASA
const initialSauces: Sauce[] = [
  { id: 1, name: 'Ají de Pollería Clásico', is_signature: true },
  { id: 2, name: 'Tártara Criolla', is_signature: true },
  { id: 3, name: 'Mayonesa de la Casa', is_signature: false },
  { id: 4, name: 'Crema de Rocoto Macho', is_signature: true },
  { id: 5, name: 'Salsa Acevichada', is_signature: true },
  { id: 6, name: 'Chimichurri Selvático', is_signature: true }
];

// 3. PRODUCTOS OFICIALES DE BUCHISAPA (CATÁLOGO OFICIAL DE 45 PRODUCTOS)
const initialProducts: Product[] = [
  // 1. PLATOS AMAZÓNICOS (7)
  {
    id: 'ama-1',
    name: 'Patacones con Chorizo',
    category_id: 'platos-amazonicos',
    price: 12,
    description: 'Dorados y crujientes patacones artesanales con chorizo amazónico jugoso y salsa cremosa de la casa.',
    badge: 'SELVA',
    popular: true,
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'ama-2',
    name: 'Tacacho con Cecina',
    category_id: 'platos-amazonicos',
    price: 12,
    description: 'El abrazo de la selva. Tacacho ahumado en leña con cecina premium y madurito caramelizado.',
    badge: 'TÍPICO',
    popular: true,
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'ama-3',
    name: 'Juanes',
    category_id: 'platos-amazonicos',
    price: 15,
    description: 'Tradición envuelta en hoja de bijao. Arroz selvático jugoso con gallina de chacra y su toque de huevo.',
    badge: 'TRADICIONAL',
    popular: true,
    available: true,
    stock: 25,
    image: '/imagenes/categorias/platos-amazonicos/banner.webp',
    includes_sauces: true
  },
  {
    id: 'ama-4',
    name: 'Chilcano de Carachama o Pescado del Día',
    category_id: 'platos-amazonicos',
    price: 15,
    description: 'Caldo ancestral que revive. Pescado fresco de río, yuca nativa y culantro amazónico bien cargado.',
    badge: 'RECONSTITUYENTE',
    popular: false,
    available: true,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'ama-5',
    name: 'Palometa Frita con Maduro o Plátano',
    category_id: 'platos-amazonicos',
    price: 15,
    description: 'Palometa entera crocante y dorada, con arroz blanco graneado y plátanos maduros dulces.',
    badge: 'FRESCO',
    popular: true,
    available: true,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'ama-6',
    name: 'Caldo Amazónico',
    category_id: 'platos-amazonicos',
    price: 12,
    description: 'Nuestra sopa bandera. Potente, aromático y humeante, con pescado fresco y hierbas de la selva.',
    badge: 'CALIENTE',
    popular: false,
    available: true,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'ama-7',
    name: 'Arroz Chaufa Amazónico',
    category_id: 'platos-amazonicos',
    price: 15,
    description: 'El chaufa selvático salteado al fuego con cecina ahumada, chorizo y aroma a selva profunda.',
    badge: 'FAVORITO',
    popular: true,
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },

  // 2. HAMBURGUESAS (12)
  {
    id: 'ham-1',
    name: 'Clásica',
    category_id: 'hamburguesas',
    price: 10,
    description: 'La clásica que nunca falla. Carne artesanal jugosa, pan suave, papas doradas y ensalada fresca.',
    badge: 'CLÁSICA',
    popular: true,
    available: true,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'ham-2',
    name: 'Choripan',
    category_id: 'hamburguesas',
    price: 10,
    description: 'Chorizo a la parrilla chispeante con papas crujientes y cremas. Sabor callejero elevado a premium.',
    badge: 'PARRILLERO',
    popular: true,
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'ham-3',
    name: 'Hawaiana Carne',
    category_id: 'hamburguesas',
    price: 14,
    description: 'Fusión tropical irresistible. Carne jugosa, piña asada dulce, jamón ahumado y queso fundido.',
    badge: 'ESPECIAL',
    popular: true,
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'ham-4',
    name: 'Hawaiana Pollo',
    category_id: 'hamburguesas',
    price: 13,
    description: 'Pollo crispy extra crujiente con piña jugosa y queso derretido. Dulce, salado y adictivo.',
    badge: 'CRISPY',
    popular: true,
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'ham-5',
    name: 'Pollo Deshilachado',
    category_id: 'hamburguesas',
    price: 9,
    description: 'Pollo jugoso deshilachado a fuego lento, sazonado con nuestra receta secreta de la casa.',
    badge: 'ECONÓMICO',
    popular: false,
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'ham-6',
    name: 'Filete de Pollo',
    category_id: 'hamburguesas',
    price: 11,
    description: 'Filete empanizado dorado, crujiente por fuera y tierno por dentro. Ligero pero contundente.',
    popular: false,
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1525164286253-04e68b9d94c6?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'ham-7',
    name: 'Cheese Burguer',
    category_id: 'hamburguesas',
    price: 11,
    description: 'Para los queseros de corazón. Carne jugosa bañada en abundante cheddar derretido cremoso.',
    badge: 'CHEDDAR',
    popular: true,
    available: true,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'ham-8',
    name: 'Bacon Burguer',
    category_id: 'hamburguesas',
    price: 12,
    description: 'Pura tentación. Tocino ahumado crujiente, queso fundido y carne jugosa en cada mordida.',
    badge: 'TOCINO',
    popular: true,
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'ham-9',
    name: 'La Suprema',
    category_id: 'hamburguesas',
    price: 15,
    description: 'La más imponente. Carne, tocino, jamón, queso y huevo frito. Creada para paladares exigentes.',
    badge: 'MÁXIMA',
    popular: true,
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'ham-10',
    name: 'Hamburguesa a lo Pobre',
    category_id: 'hamburguesas',
    price: 14,
    description: 'Sabor 100% peruano. Con huevo frito, plátano maduro, jamón y queso sobre carne jugosa.',
    badge: 'A LO POBRE',
    popular: true,
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'ham-11',
    name: 'Royal',
    category_id: 'hamburguesas',
    price: 13,
    description: 'La mixtura perfecta. Carne artesanal, chorizo, pollo deshilachado y pollo crispy en una sola.',
    badge: 'ROYAL',
    popular: true,
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'ham-12',
    name: 'Royal a lo Pobre',
    category_id: 'hamburguesas',
    price: 14,
    description: 'La Royal llevada al extremo con huevo, plátano frito y jamón. Grande, completa y poderosa.',
    badge: 'COMPLETA',
    popular: true,
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },

  // 3. BROASTER (4)
  {
    id: 'bro-1',
    name: 'Pecho',
    category_id: 'broaster',
    price: 18,
    description: 'Pieza gigante extra crujiente y jugosa, con arroz graneado, papas doradas y ensalada fresca.',
    badge: 'PECHUGA',
    popular: true,
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'bro-2',
    name: 'Pierna',
    category_id: 'broaster',
    price: 12,
    description: 'Dorada, crujiente y suculenta. Nuestra pierna broaster más pedida, jugosa hasta el hueso.',
    badge: 'JUGOSO',
    popular: true,
    available: true,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'bro-3',
    name: 'Encuentro',
    category_id: 'broaster',
    price: 13,
    description: 'El dúo perfecto de muslo y pierna en un encuentro crujiente que no podrás olvidar.',
    badge: 'FAVORITO',
    popular: true,
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'bro-4',
    name: 'Ala',
    category_id: 'broaster',
    price: 10,
    description: 'Ideal para picar. Alita dorada, súper crujiente y sazonada con toque secreto amazónico.',
    badge: 'CLÁSICO',
    popular: false,
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },

  // 4. SALCHIPAPAS Y SALCHIBROASTERS (7)
  {
    id: 'sal-1',
    name: 'Salchipapa Clásica',
    category_id: 'salchipapas',
    price: 10,
    description: 'Papas doradas premium con salchicha crocante y lluvia de cremas caseras. La clásica infalible.',
    badge: 'CLÁSICA',
    popular: true,
    available: true,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'sal-2',
    name: 'Salchipapa a lo Pobre',
    category_id: 'salchipapas',
    price: 13,
    description: 'La clásica con poder extra: huevo frito y plátano maduro dulce para un sabor criollo total.',
    badge: 'A LO POBRE',
    popular: true,
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'sal-3',
    name: 'Salchibroaster Pecho',
    category_id: 'salchipapas',
    price: 20,
    description: 'Montaña de papas con pecho broaster gigante, crujiente por fuera y jugoso por dentro.',
    badge: 'CONTUNDENTE',
    popular: true,
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'sal-4',
    name: 'Salchibroaster Pierna',
    category_id: 'salchipapas',
    price: 14,
    description: 'Pierna broaster dorada sobre papas crujientes. Contundente, jugoso y perfecto para compartir.',
    badge: 'BROASTER',
    popular: true,
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'sal-5',
    name: 'Salchibroaster Encuentro',
    category_id: 'salchipapas',
    price: 16,
    description: 'Mix broaster generoso con papas doradas y cremas. Porción grande para hambre grande.',
    badge: 'POPULAR',
    popular: true,
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'sal-6',
    name: 'Salchibroaster Ala',
    category_id: 'salchipapas',
    price: 13,
    description: 'Ala broaster crujiente sobre base de papas doradas, con ensalada fresca y cremas.',
    popular: false,
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'sal-7',
    name: 'Salchichorizo',
    category_id: 'salchipapas',
    price: 13,
    description: 'Explosión de sabor con chorizo parrillero ahumado, papas crujientes y cremas picantitas.',
    badge: 'AMAZÓNICO',
    popular: true,
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },

  // 5. ALITAS (2)
  {
    id: 'ali-1',
    name: 'Acevichadas',
    category_id: 'alitas',
    price: 15,
    description: '5 alitas jugosas bañadas en cremosa salsa acevichada con toque marino, cítrico y picante.',
    badge: 'ACEVICHADAS',
    popular: true,
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },
  {
    id: 'ali-2',
    name: 'BBQ',
    category_id: 'alitas',
    price: 15,
    description: '5 alitas glaseadas en salsa BBQ ahumada, dulce y jugosa con un toque ahumado irresistible.',
    badge: 'BBQ',
    popular: true,
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80',
    includes_sauces: true
  },

  // 6. BEBIDAS (5)
  {
    id: 'beb-1',
    name: 'Inca Cola',
    category_id: 'bebidas',
    price: 5,
    description: 'La doradita peruana bien heladita. Burbujeante, dulce y perfecta para tu broaster crujiente.',
    badge: 'HELADA',
    popular: true,
    available: true,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'beb-2',
    name: 'Coca Cola',
    category_id: 'bebidas',
    price: 5,
    description: 'Clásica mundial, helada al punto. Refrescancia burbujeante que combina con todo.',
    badge: 'HELADA',
    popular: true,
    available: true,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'beb-3',
    name: 'Fanta',
    category_id: 'bebidas',
    price: 3.5,
    description: 'Naranja vibrante, dulce y chispeante. Ultra refrescante para el calor de la selva.',
    popular: false,
    available: true,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'beb-4',
    name: 'Pepsi',
    category_id: 'bebidas',
    price: 2,
    description: 'Ligera, refrescante y burbujeante. Ideal para acompañar tus hamburguesas artesanales.',
    popular: false,
    available: true,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'beb-5',
    name: 'Agua Cielo',
    category_id: 'bebidas',
    price: 2.5,
    description: 'Pura y cristalina. Natural, sin gas, perfecta para hidratarte de forma saludable.',
    badge: 'NATURAL',
    popular: false,
    available: true,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },

  // 7. REFRESCOS NATURALES (5)
  {
    id: 'ref-1',
    name: 'Maracuyá',
    category_id: 'refrescos',
    price: 3,
    description: 'Tropical y vibrante. Dulce y ácido a la vez, 100% fruta natural amazónica bien helado.',
    badge: '100% NATURAL',
    popular: true,
    available: true,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'ref-2',
    name: 'Chicha',
    category_id: 'refrescos',
    price: 3,
    description: 'Nuestra chicha morada casera, dulce, aromática y refrescante con receta tradicional andina.',
    badge: 'CASERA',
    popular: true,
    available: true,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'ref-3',
    name: 'Cocona',
    category_id: 'refrescos',
    price: 3,
    description: 'Exótico de la selva. Cítrico, refrescante y revitalizante. Un sabor amazónico que enamora.',
    badge: 'AMAZÓNICO',
    popular: true,
    available: true,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'ref-4',
    name: 'Aguajina',
    category_id: 'refrescos',
    price: 3,
    description: 'Dulce y cremosa del aguaje amazónico. Nutritiva, suave y refrescante. Pura selva.',
    badge: 'TÍPICO',
    popular: true,
    available: true,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'ref-5',
    name: 'Camu Camu',
    category_id: 'refrescos',
    price: 3,
    description: 'El shot natural de vitamina C. Ácido, refrescante y energizante. Directo de la Amazonía.',
    badge: 'VITAMINA C',
    popular: true,
    available: true,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },

  // 8. INFUSIONES (3)
  {
    id: 'inf-1',
    name: 'Anís',
    category_id: 'infusiones',
    price: 2.5,
    description: 'Calientita y aromática. Digestiva, suave y relajante. El cierre perfecto después de comer.',
    badge: 'CALIENTE',
    popular: false,
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'inf-2',
    name: 'Té',
    category_id: 'infusiones',
    price: 2.5,
    description: 'Clásico reconfortante y aromático. Calientito, equilibrado y perfecto para cerrar la velada.',
    badge: 'CALIENTE',
    popular: false,
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'inf-3',
    name: 'Manzanilla',
    category_id: 'infusiones',
    price: 2.5,
    description: 'Flores de manzanilla seleccionadas. Calma, descanso y aroma herbal que reconforta el alma.',
    badge: 'RELAJANTE',
    popular: false,
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  // 9. PROMOCIONES OFICIALES (4)
  {
    id: 'promo-1',
    name: 'PROMO BUCHI DUO',
    category_id: 'promociones',
    price: 22.00,
    original_price: 26.00,
    description: 'Una experiencia pensada para dos. Disfruta de dos Hamburguesas Tipo Clásica elaboradas con nuestra hamburguesa artesanal premium, acompañadas de dos Gaseosas Personales Pepsi.',
    badge: 'DUO',
    popular: true,
    available: true,
    stock: 50,
    image: '/imagenes/portada/Portada2E.webp',
    includes_sauces: true
  },
  {
    id: 'promo-2',
    name: 'PROMO BROASTER FAMILIAR',
    category_id: 'promociones',
    price: 38.00,
    original_price: 46.00,
    description: 'La selección ideal para compartir en familia. Incluye un Broaster Presa Pecho, un Broaster Presa Pierna y un Broaster Presa Ala, con el sabor crujiente que nos caracteriza, más una Gaseosa Personal Inca Kola.',
    badge: 'FAMILIAR',
    popular: true,
    available: true,
    stock: 50,
    image: '/imagenes/portada/Portada1E.webp',
    includes_sauces: true
  },
  {
    id: 'promo-3',
    name: 'PROMO SALCHI BURGER',
    category_id: 'promociones',
    price: 24.00,
    original_price: 29.00,
    description: 'La fusión de nuestros dos clásicos más pedidos. Una Hamburguesa Tipo Cheese Burguer y una Salchipapa Tipo Salchipapa Clásica, acompañadas de una Gaseosa Personal Coca Cola.',
    badge: 'COMBO',
    popular: true,
    available: true,
    stock: 50,
    image: '/imagenes/portada/Portada3E.webp',
    includes_sauces: true
  },
  {
    id: 'promo-4',
    name: 'PROMO SELVA POWER',
    category_id: 'promociones',
    price: 29.00,
    original_price: 35.00,
    description: 'Un homenaje a la Amazonía. Compuesto por un Plato Amazónico Tipo Tacacho con Cecina y un Salchibroaster Tipo Salchibroaster Pierna Presa Pierna, junto a una Gaseosa Personal Fanta.',
    badge: 'AMAZÓNICO',
    popular: true,
    available: true,
    stock: 50,
    image: '/imagenes/portada/Portada4E.webp',
    includes_sauces: true
  },
  // 10. ADICIONALES (8)
  {
    id: 'adic-1',
    name: 'Huevo',
    category_id: 'adicional',
    price: 2.00,
    description: 'Huevo frito adicional.',
    badge: 'EXTRA',
    popular: false,
    available: true,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'adic-2',
    name: 'Queso',
    category_id: 'adicional',
    price: 2.00,
    description: 'Lámina de queso extra.',
    badge: 'EXTRA',
    popular: false,
    available: true,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'adic-3',
    name: 'Piña',
    category_id: 'adicional',
    price: 2.00,
    description: 'Rodaja de piña a la plancha.',
    badge: 'EXTRA',
    popular: false,
    available: true,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'adic-4',
    name: 'Plátano',
    category_id: 'adicional',
    price: 2.00,
    description: 'Plátano maduro frito.',
    badge: 'EXTRA',
    popular: false,
    available: true,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'adic-5',
    name: 'Jamón',
    category_id: 'adicional',
    price: 2.00,
    description: 'Porción de jamón inglés.',
    badge: 'EXTRA',
    popular: false,
    available: true,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1524438418049-ab2acb7aa48f?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'adic-6',
    name: 'Tocino',
    category_id: 'adicional',
    price: 2.00,
    description: 'Tiras de tocino crocante.',
    badge: 'EXTRA',
    popular: false,
    available: true,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1606851094655-b2593a9af63f?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'adic-7',
    name: 'Pollo Broaster',
    category_id: 'adicional',
    price: 5.00,
    description: 'Presa adicional de pollo broaster crujiente.',
    badge: 'EXTRA',
    popular: true,
    available: true,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  },
  {
    id: 'adic-8',
    name: 'Hamburguesa',
    category_id: 'adicional',
    price: 5.00,
    description: 'Carne de hamburguesa artesanal extra.',
    badge: 'EXTRA',
    popular: true,
    available: true,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    includes_sauces: false
  }
];

// 4. PROMOCIONES
const PROMOTIONS_FILE = path.join(process.cwd(), 'data', 'promociones.json');

const initialPromotions: Promotion[] = [
  {
    id: 'promo-1',
    title: 'PROMO BUCHI DUO',
    description: 'Una experiencia pensada para dos. Disfruta de dos Hamburguesas Tipo Clásica elaboradas con nuestra hamburguesa artesanal premium, acompañadas de dos Gaseosas Personales Pepsi.',
    price: 22.00,
    originalPrice: 26.00,
    image: '/imagenes/portada/Portada2E.webp',
    badge: '🔥 DÚO FAVORITO',
    active: true,
    order: 1,
    features: [
      '🍔 2 Hamburguesas artesanales clásicas',
      '🍟 Papa crocante',
      '🥗 Ensalada fresca',
      '🥤 2 Gaseosas Personales Pepsi'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'promo-2',
    title: 'PROMO BROASTER FAMILIAR',
    description: 'La selección ideal para compartir en familia. Incluye un Broaster Presa Pecho, un Broaster Presa Pierna y un Broaster Presa Ala, con el sabor crujiente que nos caracteriza, más una Gaseosa Personal Inca Kola.',
    price: 38.00,
    originalPrice: 46.00,
    image: '/imagenes/portada/Portada1E.webp',
    badge: '🍗 FAMILIAR CRUNCH',
    active: true,
    order: 2,
    features: [
      '🍗 3 Presas Broaster (Pecho, Pierna, Ala)',
      '🍟 Papa crocante',
      '🥗 Ensalada fresca',
      '🍚 Arroz graneado',
      '🥤 1 Gaseosa Personal Inca Kola'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'promo-3',
    title: 'PROMO SALCHI BURGER',
    description: 'La fusión de nuestros dos clásicos más pedidos. Una Hamburguesa Tipo Cheese Burguer y una Salchipapa Tipo Salchipapa Clásica, acompañadas de una Gaseosa Personal Coca Cola.',
    price: 24.00,
    originalPrice: 29.00,
    image: '/imagenes/portada/Portada3E.webp',
    badge: '✨ COMBO FUSIÓN',
    active: true,
    order: 3,
    features: [
      '🍔 1 Hamburguesa Cheese Burguer',
      '🍟 1 Salchipapa Clásica con Papas crocantes',
      '🧀 Queso cheddar derretido',
      '🥗 Ensalada fresca',
      '🥤 1 Gaseosa Personal Coca Cola'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'promo-4',
    title: 'PROMO SELVA POWER',
    description: 'Un homenaje a la Amazonía. Compuesto por un Plato Amazónico Tipo Tacacho con Cecina y un Salchibroaster Tipo Salchibroaster Pierna Presa Pierna, junto a una Gaseosa Personal Fanta.',
    price: 29.00,
    originalPrice: 35.00,
    image: '/imagenes/portada/Portada4E.webp',
    badge: '🌴 100% AMAZÓNICO',
    active: true,
    order: 4,
    features: [
      '🌴 1 Plato Amazónico Tacacho con Cecina',
      '🍗 1 Salchibroaster Pierna',
      '🍌 Maduros fritos',
      '🧅 Sarza criolla',
      '🍟 Papa crocante',
      '🥗 Ensalada fresca',
      '🥤 1 Gaseosa Personal Fanta'
    ],
    createdAt: new Date().toISOString()
  }
];

function loadPromotionsFromDisk(): Promotion[] {
  try {
    if (fs.existsSync(PROMOTIONS_FILE)) {
      const raw = fs.readFileSync(PROMOTIONS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('No se pudo cargar promociones de disco, usando iniciales:', err);
  }
  return [...initialPromotions];
}

function savePromotionsToDisk() {
  try {
    const dir = path.dirname(PROMOTIONS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PROMOTIONS_FILE, JSON.stringify(promotionsStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar promociones en disco:', err);
  }
}

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');
const TICKETS_FILE = path.join(process.cwd(), 'data', 'tickets.json');

function generateInitialOrders(): Order[] {
  const now = new Date();
  const t1 = new Date(now.getTime() - 25 * 60000).toISOString();
  const t2 = new Date(now.getTime() - 50 * 60000).toISOString();
  const t3 = new Date(now.getTime() - 95 * 60000).toISOString();
  const t4 = new Date(now.getTime() - 140 * 60000).toISOString();

  return [
    {
      id: 'ord-101',
      orderNumber: 101,
      customerName: 'Juan Carlos Mendoza',
      customerPhone: '987654321',
      customerEmail: 'juan.mendoza@gmail.com',
      orderType: 'delivery',
      deliveryAddress: 'Av. Gran Chimú 450, Urb. Santa Clara, Ate',
      deliveryFee: 5.00,
      paymentMethod: 'Yape',
      subtotal: 38.00,
      total: 43.00,
      status: 'entregado',
      createdAt: t1,
      items: [
        {
          name: 'Tacacho con Cecina y Chorizo Amazónico',
          quantity: 1,
          price: 28.00,
          customization: {
            accompaniments: ['Patacones crocantes', 'Ají de cocona'],
            cremas: ['Crema de la casa', 'Ají charapita'],
            notes: 'Bien doradito el chorizo, por favor.'
          }
        },
        {
          name: 'Jarra de Refresco de Cocona 1L',
          quantity: 1,
          price: 10.00,
          customization: {
            notes: 'Bien heladita.'
          }
        }
      ]
    },
    {
      id: 'ord-102',
      orderNumber: 102,
      customerName: 'María Elena Vargas',
      customerPhone: '912345678',
      orderType: 'salon',
      deliveryAddress: 'Mesa 4 (Salón Principal)',
      deliveryFee: 0.00,
      paymentMethod: 'Plin',
      subtotal: 45.00,
      total: 45.00,
      status: 'preparando',
      createdAt: t2,
      items: [
        {
          name: '1/4 Pollo Broaster BuchiSapa + Papas Doradas',
          quantity: 2,
          price: 18.00,
          customization: {
            accompaniments: ['Papas fritas crocantes', 'Ensalada clásica'],
            cremas: ['Mayonesa casera', 'Tártara especial', 'Ají pollero'],
            notes: 'Parte pierna y pecho.'
          }
        },
        {
          name: 'Gaseosa Inka Cola 1.5L',
          quantity: 1,
          price: 9.00
        }
      ]
    },
    {
      id: 'ord-103',
      orderNumber: 103,
      customerName: 'Roberto Quispe T.',
      customerPhone: '955432198',
      orderType: 'pickup',
      deliveryAddress: 'Recojo en Mostrador',
      deliveryFee: 0.00,
      paymentMethod: 'Efectivo',
      subtotal: 40.00,
      total: 40.00,
      status: 'listo',
      createdAt: t3,
      items: [
        {
          name: 'Alitas Broaster Acevichadas (12 piezas)',
          quantity: 1,
          price: 32.00,
          customization: {
            accompaniments: ['Papas amarillas crocantes'],
            cremas: ['Salsa acevichada de la casa', 'Ají rocoto'],
            notes: 'Salsa acevichada bien bañada.'
          }
        },
        {
          name: 'Porción de Yuca Frita Amazónica',
          quantity: 1,
          price: 8.00
        }
      ]
    },
    {
      id: 'ord-104',
      orderNumber: 104,
      customerName: 'Lucía Morales',
      customerPhone: '944888333',
      orderType: 'delivery',
      deliveryAddress: 'Calle 28 de Julio Mz. B Lte. 12, Santa Clara',
      deliveryFee: 5.00,
      paymentMethod: 'Tarjeta',
      subtotal: 29.00,
      total: 34.00,
      status: 'pendiente',
      createdAt: t4,
      items: [
        {
          name: 'Hamburguesa BuchiSapa Artesanal Doble Carne',
          quantity: 1,
          price: 22.00,
          customization: {
            accompaniments: ['Papas al hilo', 'Queso cheddar fundido'],
            cremas: ['Golf', 'BBQ ahumada', 'Tártara'],
            notes: 'Sin cebolla, carne término 3/4.'
          }
        },
        {
          name: 'Refresco Natural de Aguajina Helada',
          quantity: 1,
          price: 7.00
        }
      ]
    }
  ];
}

function loadOrdersFromDisk(): Order[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error al cargar órdenes de disco:', err);
  }
  const initial = generateInitialOrders();
  saveOrdersToDisk(initial);
  return initial;
}

function saveOrdersToDisk(data?: Order[]) {
  try {
    const list = data || ordersStore;
    const dir = path.dirname(ORDERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar órdenes en disco:', err);
  }
}

// PERSISTENCIA DE PRODUCTOS Y CATEGORÍAS EN DISCO (SINCRONIZACIÓN TIENDA <-> ADMIN)
const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'products.json');
const CATEGORIES_FILE = path.join(process.cwd(), 'data', 'categories.json');

function loadCategoriesFromDisk(): Category[] {
  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      const raw = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Desduplicación estricta por ID y por nombre normalizado
        const seenIds = new Set<string>();
        const seenNames = new Set<string>();
        const cleanList: Category[] = [];

        for (const item of parsed) {
          if (!item || !item.name) continue;
          const normName = String(item.name).trim().toUpperCase();
          const cleanId = String(item.id || item.code || '').trim().toUpperCase();
          if (!seenNames.has(normName) && (!cleanId || !seenIds.has(cleanId))) {
            if (cleanId) seenIds.add(cleanId);
            seenNames.add(normName);
            cleanList.push({
              ...item,
              id: cleanId || item.id,
              name: normName,
              code: item.code || cleanId || item.id
            });
          }
        }
        return cleanList;
      }
    }
  } catch (err) {
    console.error('Error al cargar categorías desde disco:', err);
  }
  saveCategoriesToDisk(initialCategories);
  return [...initialCategories];
}

function saveCategoriesToDisk(data?: Category[]) {
  try {
    const list = data || categoriesStore;
    const dir = path.dirname(CATEGORIES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar categorías en disco:', err);
  }
}

function loadProductsFromDisk(): Product[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error al cargar productos desde disco:', err);
  }
  saveProductsToDisk(initialProducts);
  return [...initialProducts];
}

function saveProductsToDisk(data?: Product[]) {
  try {
    const list = data || productsStore;
    const dir = path.dirname(PRODUCTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar productos en disco:', err);
  }
}

// IN-MEMORY STORES CON PERSISTENCIA
let categoriesStore: Category[] = loadCategoriesFromDisk();
let productsStore: Product[] = loadProductsFromDisk();
const saucesStore = [...initialSauces];
let promotionsStore: Promotion[] = loadPromotionsFromDisk();
let ordersStore: Order[] = loadOrdersFromDisk();
const claimsStore: Claim[] = [];

// CATEGORÍAS CRUD
function generateNextCategoryId(): string {
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
    // Mantener C0001 PROMOCIONES al inicio si existe, luego ordenar alfabéticamente
    const isPromoA = (a.slug === 'promociones' || a.id === 'C0001');
    const isPromoB = (b.slug === 'promociones' || b.id === 'C0001');
    if (isPromoA && !isPromoB) return -1;
    if (!isPromoA && isPromoB) return 1;
    return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
  });
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  categoriesStore = loadCategoriesFromDisk();
  const nameUpper = (data.name || 'NUEVA CATEGORÍA').toUpperCase().trim();
  const slug = data.slug || nameUpper.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-') || `cat-${Date.now()}`;

  // Verificar si ya existe una categoría con el mismo nombre o slug o id
  const existingIndex = categoriesStore.findIndex(c => 
    c.name.trim().toUpperCase() === nameUpper || 
    (c.slug && c.slug.toLowerCase() === slug.toLowerCase()) ||
    (data.id && (c.id === data.id || c.code === data.id))
  );

  if (existingIndex !== -1) {
    const processedImage = data.image ? await autoProcessWebPImage(data.image, 'categorias', categoriesStore[existingIndex].slug || slug) : categoriesStore[existingIndex].image;
    categoriesStore[existingIndex] = {
      ...categoriesStore[existingIndex],
      name: nameUpper,
      slug: categoriesStore[existingIndex].slug || slug,
      image: processedImage || categoriesStore[existingIndex].image,
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
  // Sincronización en tiempo real a Supabase (asíncrona)
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
  const product = productsStore.find(p => p.id === id);
  return product || null;
}

export async function getSauces(): Promise<Sauce[]> {
  return saucesStore;
}

export async function getPromotions(includeInactive = false): Promise<Promotion[]> {
  let list = [...promotionsStore];
  if (!includeInactive) {
    list = list.filter(p => p.active !== false);
  }
  return list.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  const p = promotionsStore.find(item => item.id === id);
  return p || null;
}

export async function createPromotion(data: Partial<Promotion>): Promise<Promotion> {
  const newPromo: Promotion = {
    id: data.id || `promo-${Date.now()}`,
    title: data.title || 'NUEVA PROMOCIÓN',
    description: data.description || 'Promoción especial BuchiSapa',
    price: Number(data.price) || 0,
    originalPrice: Number(data.originalPrice) || Number(data.price) || 0,
    image: data.image || '/imagenes/portada/Portada1E.webp',
    badge: data.badge || '🔥 OFERTA',
    active: data.active !== undefined ? data.active : true,
    order: data.order !== undefined ? data.order : promotionsStore.length + 1,
    features: Array.isArray(data.features) ? data.features : (typeof data.features === 'string' ? (data.features as string).split('\n').filter(Boolean) : ['✦ CALIDAD BUCHISAPA', '🔥 PREPARADO AL MOMENTO']),
    createdAt: new Date().toISOString()
  };

  promotionsStore.push(newPromo);
  savePromotionsToDisk();
  return newPromo;
}

export async function updatePromotion(id: string, data: Partial<Promotion>): Promise<Promotion | null> {
  const index = promotionsStore.findIndex(item => item.id === id);
  if (index === -1) return null;

  const current = promotionsStore[index];
  promotionsStore[index] = {
    ...current,
    ...data,
    price: data.price !== undefined ? Number(data.price) : current.price,
    originalPrice: data.originalPrice !== undefined ? Number(data.originalPrice) : current.originalPrice,
    id // preserve id
  };
  savePromotionsToDisk();
  return promotionsStore[index];
}

export async function deletePromotion(id: string): Promise<boolean> {
  const initialLength = promotionsStore.length;
  promotionsStore = promotionsStore.filter(item => item.id !== id);
  savePromotionsToDisk();
  return promotionsStore.length < initialLength;
}

export async function reorderPromotions(orderedIds: string[]): Promise<Promotion[]> {
  orderedIds.forEach((id, index) => {
    const p = promotionsStore.find(item => item.id === id);
    if (p) p.order = index + 1;
  });
  savePromotionsToDisk();
  return promotionsStore.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function formatOrderCode(orderNumberOrId: any): string {
  if (!orderNumberOrId) return 'PC00001';
  const str = String(orderNumberOrId).trim();
  if (str.toUpperCase().startsWith('PC')) {
    const numPart = str.substring(2).replace(/\D/g, '');
    if (numPart) {
      return `PC${numPart.padStart(5, '0')}`;
    }
    return str.toUpperCase();
  }
  const digits = str.replace(/\D/g, '');
  if (digits) {
    const num = parseInt(digits, 10);
    if (num < 100000) {
      return `PC${String(num).padStart(5, '0')}`;
    } else {
      const shortNum = num % 100000 || 1;
      return `PC${String(shortNum).padStart(5, '0')}`;
    }
  }
  return `PC00001`;
}

export async function getOrders(status?: string, email?: string): Promise<Order[]> {
  ordersStore = loadOrdersFromDisk().map((o, index) => {
    const code = formatOrderCode(o.orderCode || o.orderNumber || (index + 1));
    return {
      ...o,
      orderCode: code,
      orderNumber: code
    };
  });

  let list = [...ordersStore];
  if (status && status !== 'todos') {
    list = list.filter(o => o.status.toLowerCase() === status.toLowerCase());
  }
  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    list = list.filter(o => (o.customerEmail || '').toLowerCase().trim() === cleanEmail);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrderById(id: string): Promise<Order | null> {
  const order = ordersStore.find(o => o.id === id || String(o.orderNumber) === id);
  return order || null;
}

export function getNextOrderCode(): string {
  let maxNumber = 0;
  for (const o of ordersStore) {
    const raw = String(o.orderCode || o.orderNumber || o.id || '');
    const match = raw.match(/PC(\d+)/i);
    if (match) {
      const val = parseInt(match[1], 10);
      if (val > maxNumber) maxNumber = val;
    } else {
      const digits = raw.replace(/\D/g, '');
      if (digits) {
        const val = parseInt(digits, 10);
        if (val < 100000 && val > maxNumber) maxNumber = val;
      }
    }
  }
  const nextNum = maxNumber + 1;
  return `PC${String(nextNum).padStart(5, '0')}`;
}

export async function createOrder(data: any): Promise<Order> {
  let code = data.orderCode;
  if (!code && data.orderNumber && String(data.orderNumber).toUpperCase().startsWith('PC')) {
    code = String(data.orderNumber).toUpperCase();
  }
  if (!code) {
    code = getNextOrderCode();
  }

  const newOrder: Order = {
    id: data.id || `ORD-${Date.now()}`,
    orderNumber: code,
    orderCode: code,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    orderType: data.orderType || 'delivery',
    deliveryAddress: data.deliveryAddress,
    deliveryReference: data.deliveryReference,
    tableNumber: data.tableNumber,
    paymentMethod: data.paymentMethod || 'Yape',
    notes: data.notes,
    status: data.status || 'recibido',
    subtotal: Number(data.subtotal || data.total) || 0,
    deliveryFee: Number(data.deliveryFee) || (data.orderType === 'pickup' ? 0 : 4.00),
    total: Number(data.total) || 0,
    items: typeof data.items === 'string' ? data.items : JSON.stringify(data.items),
    userId: data.userId,
    createdAt: new Date().toISOString()
  };

  ordersStore.unshift(newOrder);
  saveOrdersToDisk();
  return newOrder;
}

export async function updateOrderStatus(id: string, status: string): Promise<Order | null> {
  const order = ordersStore.find(o => o.id === id || String(o.orderNumber) === id);
  if (!order) return null;
  order.status = status;
  saveOrdersToDisk();
  return order;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const rawId = id.replace(/^tk-/, '');
  const filtered = ordersStore.filter(o => o.id !== id && o.id !== rawId && String(o.orderNumber) !== id && String(o.orderNumber) !== rawId);
  ordersStore.length = 0;
  ordersStore.push(...filtered);
  customTicketsStore = customTicketsStore.filter(t => t.id !== id && t.id !== `tk-${id}` && t.orderId !== id && String(t.orderNumber) !== id);
  saveOrdersToDisk();
  return true;
}

export async function getClaims(): Promise<Claim[]> {
  return claimsStore;
}

export async function createClaim(data: any): Promise<Claim> {
  const newClaim: Claim = {
    id: claimsStore.length + 1,
    claimCode: data.claimCode || `REC-${Date.now()}`,
    fullName: data.fullName,
    docType: data.docType || 'DNI',
    docNumber: data.docNumber || '',
    phone: data.phone,
    email: data.email,
    address: data.address || '',
    department: data.department || 'Lima',
    province: data.province || 'Lima',
    district: data.district || 'Ate',
    branch: data.branch || 'BuchiSapa - Sede Central (Santa Clara, Ate)',
    orderNumber: data.orderNumber || '',
    orderDate: data.orderDate || '',
    isMinor: Boolean(data.isMinor),
    tutorName: data.tutorName || '',
    tutorDoc: data.tutorDoc || '',
    claimType: (data.claimType || 'reclamo').toLowerCase().includes('queja') ? 'queja' : 'reclamo',
    contractedGood: data.contractedGood || 'producto',
    claimedAmount: data.claimedAmount ? Number(data.claimedAmount) : undefined,
    productDescription: data.productDescription || 'Consumo en restaurante / Pedido delivery',
    detail: data.detail,
    consumerRequest: data.consumerRequest || '',
    attachmentName: data.attachmentName || '',
    status: 'pendiente',
    createdAt: new Date().toISOString()
  };

  claimsStore.unshift(newClaim);
  return newClaim;
}

export async function checkCartStock(checkItems: { id: string; quantity: number; name?: string }[]) {
  const outOfStockItems: any[] = [];
  const itemsStatus: any[] = [];

  for (const item of checkItems) {
    const product = productsStore.find(p => p.id === item.id);
    if (!product) {
      // If product not found in database by id, allow by default
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
  saveProductsToDisk();
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
  saveProductsToDisk();
  syncProductToSupabase(product, 'upsert');
  return product;
}

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

// 5. INSUMOS Y UTENSILIOS (PARA GESTIÓN DEL RESTAURANTE)
export interface Supply {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  status: 'ok' | 'bajo' | 'critico';
  lastRestocked: string;
}

const initialSupplies: Supply[] = [
  { id: 'ins-1', name: 'Carne Molida Premium (Res)', category: 'Carnes', stock: 45, unit: 'kg', minStock: 20, status: 'ok', lastRestocked: '2026-09-24' },
  { id: 'ins-2', name: 'Pollo Fresco para Broaster', category: 'Carnes', stock: 85, unit: 'kg', minStock: 30, status: 'ok', lastRestocked: '2026-09-24' },
  { id: 'ins-3', name: 'Pan Brioche Artesanal', category: 'Panadería', stock: 120, unit: 'und', minStock: 50, status: 'ok', lastRestocked: '2026-09-24' },
  { id: 'ins-4', name: 'Papa Amarilla Seleccionada', category: 'Verduras', stock: 150, unit: 'kg', minStock: 40, status: 'ok', lastRestocked: '2026-09-23' },
  { id: 'ins-5', name: 'Salchicha Frankfurt Ahumada', category: 'Embutidos', stock: 35, unit: 'kg', minStock: 15, status: 'ok', lastRestocked: '2026-09-24' },
  { id: 'ins-6', name: 'Queso Cheddar en Láminas', category: 'Lácteos', stock: 22, unit: 'paq', minStock: 10, status: 'ok', lastRestocked: '2026-09-23' },
  { id: 'ins-7', name: 'Aceite Vegetal para Freidoras', category: 'Abarrotes', stock: 60, unit: 'L', minStock: 25, status: 'ok', lastRestocked: '2026-09-22' },
  { id: 'ins-8', name: 'Maíz Morado de la Sierra', category: 'Abarrotes', stock: 28, unit: 'kg', minStock: 15, status: 'ok', lastRestocked: '2026-09-21' },
  { id: 'ins-9', name: 'Empaques Biodegradables Delivery', category: 'Empaques', stock: 350, unit: 'und', minStock: 100, status: 'ok', lastRestocked: '2026-09-20' },
  { id: 'ins-10', name: 'Potes de Crema 2oz', category: 'Empaques', stock: 500, unit: 'und', minStock: 150, status: 'ok', lastRestocked: '2026-09-20' }
];

let suppliesStore: Supply[] = [...initialSupplies];

export async function getSupplies(): Promise<Supply[]> {
  return suppliesStore;
}

export async function updateSupplyStock(id: string, newStock: number): Promise<Supply | null> {
  const item = suppliesStore.find(s => s.id === id);
  if (!item) return null;
  item.stock = newStock;
  item.status = item.stock <= item.minStock * 0.5 ? 'critico' : item.stock <= item.minStock ? 'bajo' : 'ok';
  item.lastRestocked = new Date().toISOString().split('T')[0];
  return item;
}

export interface Utensil {
  id: string;
  name: string;
  area: string;
  quantity: number;
  condition: 'Operativo' | 'Excelente' | 'Mantenimiento';
  lastInspection: string;
}

const initialUtensils: Utensil[] = [
  { id: 'ut-1', name: 'Freidora Industrial Doble Canastilla', area: 'Broaster', quantity: 2, condition: 'Excelente', lastInspection: '2026-09-20' },
  { id: 'ut-2', name: 'Plancha Hamburguesera de Cromo Duro', area: 'Parrilla', quantity: 1, condition: 'Operativo', lastInspection: '2026-09-21' },
  { id: 'ut-3', name: 'Cortadora Profesional de Papas Bastón', area: 'Preparación', quantity: 2, condition: 'Excelente', lastInspection: '2026-09-18' },
  { id: 'ut-4', name: 'Campana Extractora de Alto Caudal', area: 'Extracción', quantity: 1, condition: 'Operativo', lastInspection: '2026-09-15' },
  { id: 'ut-5', name: 'Espátulas Grill y Pinzas Térmicas', area: 'Parrilla', quantity: 8, condition: 'Excelente', lastInspection: '2026-09-23' },
  { id: 'ut-6', name: 'Termómetro Digital de Sonda', area: 'Control Calidad', quantity: 3, condition: 'Excelente', lastInspection: '2026-09-24' }
];

export async function getUtensils(): Promise<Utensil[]> {
  return initialUtensils;
}

export interface CajaMovement {
  id: string;
  hora: string;
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  monto: number;
  motivo: string;
  responsable: string;
  comprobante?: string;
  createdAt: string;
}

export interface CajaClosure {
  id: string;
  fecha: string;
  turno: string;
  apertura: number;
  ventasTotal: number;
  efectivoEsperado: number;
  efectivoReal: number;
  diferencia: number;
  responsable: string;
  cerradoAt: string;
  notas?: string;
}

export interface TicketRecord {
  id: string;
  ticketNumber: string;
  orderNumber: number;
  orderId?: string;
  customerName: string;
  customerPhone?: string;
  orderType: 'delivery' | 'pickup' | 'salon';
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: 'pagado' | 'pendiente' | 'anulado';
  createdAt: string;
}

// Estado persistente en memoria para caja y turnos
let cajaState = {
  isOpen: false,
  openedAt: null as string | null,
  responsable: 'Admin BuchiSapa',
  initialCash: 0.00
};

let cajaMovementsStore: CajaMovement[] = [];

let cajaClosuresStore: CajaClosure[] = [];

export async function getCajaSummary() {
  const orders = await getOrders();
  
  // Calcular ventas reales desde los pedidos
  let totalSales = 0;
  let efectivo = 0;
  let yapePlin = 0;
  let tarjeta = 0;

  orders.forEach(o => {
    const amount = Number(o.total || 0);
    totalSales += amount;
    const method = (o.paymentMethod || '').toLowerCase();
    if (method.includes('yape') || method.includes('plin')) {
      yapePlin += amount;
    } else if (method.includes('tarjeta') || method.includes('card') || method.includes('pos')) {
      tarjeta += amount;
    } else {
      efectivo += amount;
    }
  });

  // Egresos e ingresos extraordinarios
  const egresosTotal = cajaMovementsStore
    .filter(m => m.tipo === 'egreso')
    .reduce((sum, m) => sum + m.monto, 0);

  const ingresosExtra = cajaMovementsStore
    .filter(m => m.tipo === 'ingreso' && m.categoria !== 'Fondo Inicial')
    .reduce((sum, m) => sum + m.monto, 0);

  const efectivoEsperado = (cajaState.initialCash + efectivo + ingresosExtra) - egresosTotal;

  const deliveryOrders = orders.filter(o => o.orderType === 'delivery').length;
  const pickupOrders = orders.filter(o => o.orderType === 'pickup').length;
  const salonOrders = orders.filter(o => o.orderType === 'salon').length;

  return {
    isOpen: cajaState.isOpen,
    openedAt: cajaState.openedAt,
    responsable: cajaState.responsable,
    initialCash: cajaState.initialCash,
    totalSales: Number(totalSales.toFixed(2)),
    efectivo: Number(efectivo.toFixed(2)),
    yapePlin: Number(yapePlin.toFixed(2)),
    tarjeta: Number(tarjeta.toFixed(2)),
    egresosTotal: Number(egresosTotal.toFixed(2)),
    ingresosExtra: Number(ingresosExtra.toFixed(2)),
    efectivoEsperado: Number(efectivoEsperado.toFixed(2)),
    totalOrders: orders.length,
    activeOrders: orders.filter(o => o.status !== 'entregado' && o.status !== 'cancelado').length,
    deliveryOrders,
    pickupOrders,
    salonOrders,
    movimientos: cajaMovementsStore,
    historialCierres: cajaClosuresStore
  };
}

export async function addCajaMovement(data: {
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  monto: number;
  motivo: string;
  responsable?: string;
  comprobante?: string;
}): Promise<CajaMovement> {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  const newMov: CajaMovement = {
    id: `mov-${Date.now()}`,
    hora: `${hours}:${minutes}`,
    tipo: data.tipo,
    categoria: data.categoria || 'Gasto General',
    monto: Math.abs(Number(data.monto) || 0),
    motivo: data.motivo || 'Movimiento de caja chica',
    responsable: data.responsable || cajaState.responsable || 'Admin BuchiSapa',
    comprobante: data.comprobante || `REC-${Date.now().toString().slice(-4)}`,
    createdAt: now.toISOString()
  };

  cajaMovementsStore.unshift(newMov);
  return newMov;
}

export async function abrirCaja(data: { montoInicial: number; responsable?: string }) {
  cajaState.isOpen = true;
  cajaState.initialCash = Number(data.montoInicial) || 250.00;
  cajaState.openedAt = new Date().toISOString();
  if (data.responsable) cajaState.responsable = data.responsable;

  await addCajaMovement({
    tipo: 'ingreso',
    categoria: 'Fondo Inicial',
    monto: cajaState.initialCash,
    motivo: 'Apertura de turno con sencillo para cambio en caja',
    responsable: cajaState.responsable,
    comprobante: `AP-${Date.now().toString().slice(-4)}`
  });

  return getCajaSummary();
}

export async function cerrarCaja(data: {
  efectivoReal: number;
  notas?: string;
  responsable?: string;
}) {
  const summary = await getCajaSummary();
  const real = Number(data.efectivoReal) || summary.efectivoEsperado;
  const dif = Number((real - summary.efectivoEsperado).toFixed(2));

  const closure: CajaClosure = {
    id: `cierre-${Date.now()}`,
    fecha: new Date().toISOString().split('T')[0],
    turno: 'Turno Tarde/Noche',
    apertura: summary.initialCash,
    ventasTotal: summary.totalSales,
    efectivoEsperado: summary.efectivoEsperado,
    efectivoReal: real,
    diferencia: dif,
    responsable: data.responsable || summary.responsable,
    cerradoAt: new Date().toISOString(),
    notas: data.notas || (dif === 0 ? 'Cuadre de caja exacto' : `Diferencia de S/ ${dif.toFixed(2)}`)
  };

  cajaClosuresStore.unshift(closure);
  cajaState.isOpen = false;

  return {
    success: true,
    closure,
    cajaSummary: await getCajaSummary()
  };
}

// Tickets de venta y boletas
let customTicketsStore: TicketRecord[] = [];

export async function getTickets(): Promise<TicketRecord[]> {
  const orders = await getOrders();
  
  // Convertir órdenes existentes a tickets formateados
  const orderTickets: TicketRecord[] = orders.map((o, idx) => {
    let rawItems: any[] = [];
    if (Array.isArray(o.items)) rawItems = o.items;
    else if (typeof o.items === 'string') {
      try { rawItems = JSON.parse(o.items); } catch (e) { rawItems = []; }
    }

    const items = rawItems.map(it => ({
      name: it.name || it.nombre || 'Plato BuchiSapa',
      quantity: Number(it.quantity || it.cant || 1),
      price: Number(it.price || it.precio || 0),
      notes: it.notes || it.customization?.notes || ''
    }));

    const rawNum = typeof o.orderNumber === 'number' ? o.orderNumber : parseInt(String(o.orderNumber).replace(/\D/g, ''), 10) || (orders.length - idx);
    const formattedNum = String(rawNum).padStart(6, '0');

    return {
      id: `tk-${o.id}`,
      ticketNumber: `TK${formattedNum}`,
      orderNumber: rawNum,
      orderId: o.id,
      customerName: o.customerName || 'Cliente Mostrador',
      customerPhone: o.customerPhone || '',
      orderType: (o.orderType as any) || 'delivery',
      paymentMethod: o.paymentMethod || 'Efectivo',
      items: items.length > 0 ? items : [{ name: 'BuchiBurger Doble Artesanal', quantity: 1, price: Number(o.total || 22) }],
      subtotal: Number(o.subtotal || o.total || 0),
      deliveryFee: Number(o.deliveryFee || 0),
      discount: 0,
      total: Number(o.total || 0),
      status: o.status === 'cancelado' ? 'anulado' : 'pagado',
      createdAt: o.createdAt || new Date().toISOString()
    };
  });

  // Combinar con tickets rápidos generados manualmente
  const combined = [...customTicketsStore, ...orderTickets];
  return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createQuickTicket(data: Partial<TicketRecord>): Promise<TicketRecord> {
  const now = new Date();
  const nextNumber = customTicketsStore.length + 1;
  const seq = String(nextNumber).padStart(6, '0');

  const newTicket: TicketRecord = {
    id: `tk-quick-${Date.now()}`,
    ticketNumber: `TK${seq}`,
    orderNumber: nextNumber,
    customerName: data.customerName || 'Cliente Mostrador',
    customerPhone: data.customerPhone || '',
    orderType: data.orderType || 'salon',
    paymentMethod: data.paymentMethod || 'Efectivo',
    items: data.items && data.items.length > 0 ? data.items : [
      { name: 'BuchiSapa Clásica Burger', quantity: 1, price: 16.00 }
    ],
    subtotal: Number(data.subtotal || data.total || 16.00),
    deliveryFee: Number(data.deliveryFee || 0),
    discount: Number(data.discount || 0),
    total: Number(data.total || 16.00),
    status: data.status || 'pagado',
    createdAt: now.toISOString()
  };

  customTicketsStore.unshift(newTicket);
  return newTicket;
}

export async function deleteTicket(id: string): Promise<boolean> {
  const rawId = id.replace(/^tk-/, '');
  const initialTicketsLen = customTicketsStore.length;
  customTicketsStore = customTicketsStore.filter(t => t.id !== id && t.id !== `tk-${id}` && t.orderId !== id && String(t.orderNumber) !== id && String(t.orderNumber) !== rawId);
  
  // Also delete corresponding order from ordersStore
  const filteredOrders = ordersStore.filter(o => o.id !== id && o.id !== rawId && String(o.orderNumber) !== id && String(o.orderNumber) !== rawId);
  ordersStore.length = 0;
  ordersStore.push(...filteredOrders);
  
  return true;
}

export async function clearAllTickets(): Promise<boolean> {
  customTicketsStore = [];
  ordersStore.length = 0;
  return true;
}

// ============================================================================
// GESTIÓN DE PORTADAS / HERO CAROUSEL BANNERS
// ============================================================================
export interface PortadaBanner {
  id: string;
  title?: string;
  highlight?: string;
  subtitle?: string;
  badge?: string;
  badgeType?: string;
  image: string;
  imageMobile?: string;
  secretPillIcon?: string;
  secretPillText?: string;
  buttonText?: string;
  buttonCategory?: string;
  features?: string[];
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

const PORTADAS_FILE = path.join(process.cwd(), 'data', 'portadas.json');

const initialPortadas: PortadaBanner[] = [
  {
    id: 'portada-1',
    title: 'Portada 1',
    image: '/imagenes/portada/Portada1E.webp',
    imageMobile: '/imagenes/portada/Portada1M.webp',
    active: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'portada-2',
    title: 'Portada 2',
    image: '/imagenes/portada/Portada2E.webp',
    imageMobile: '/imagenes/portada/Portada2M.webp',
    active: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'portada-3',
    title: 'Portada 3',
    image: '/imagenes/portada/Portada3E.webp',
    imageMobile: '/imagenes/portada/Portada3M.webp',
    active: true,
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'portada-4',
    title: 'Portada 4',
    image: '/imagenes/portada/Portada4E.webp',
    imageMobile: '/imagenes/portada/Portada4M.webp',
    active: true,
    order: 4,
    createdAt: new Date().toISOString()
  }
];

function loadPortadasFromDisk(): PortadaBanner[] {
  try {
    const targetDir = path.join(process.cwd(), 'public', 'imagenes', 'portada');
    const distDir = path.join(process.cwd(), 'dist', 'imagenes', 'portada');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

    // Auto-reparar archivos WebP corruptos (< 500 bytes)
    for (let i = 1; i <= 10; i++) {
      const eFile = path.join(targetDir, `Portada${i}E.webp`);
      const mFile = path.join(targetDir, `Portada${i}M.webp`);

      const eExist = fs.existsSync(eFile) && fs.statSync(eFile).size > 500;
      const mExist = fs.existsSync(mFile) && fs.statSync(mFile).size > 500;

      if (!eExist && mExist) {
        try { fs.copyFileSync(mFile, eFile); } catch (e) {}
      } else if (eExist && !mExist) {
        try { fs.copyFileSync(eFile, mFile); } catch (e) {}
      }

      // Sincronizar hacia dist
      if (fs.existsSync(eFile) && fs.statSync(eFile).size > 500) {
        try { fs.copyFileSync(eFile, path.join(distDir, `Portada${i}E.webp`)); } catch (e) {}
      }
      if (fs.existsSync(mFile) && fs.statSync(mFile).size > 500) {
        try { fs.copyFileSync(mFile, path.join(distDir, `Portada${i}M.webp`)); } catch (e) {}
      }
    }

    if (fs.existsSync(PORTADAS_FILE)) {
      const raw = fs.readFileSync(PORTADAS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('No se pudo cargar portadas de disco, usando iniciales:', err);
  }
  return [...initialPortadas];
}

function savePortadasToDisk() {
  try {
    const dir = path.dirname(PORTADAS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PORTADAS_FILE, JSON.stringify(portadasStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar portadas en disco:', err);
  }
}

let portadasStore: PortadaBanner[] = loadPortadasFromDisk();

export async function getPortadas(includeInactive = false): Promise<PortadaBanner[]> {
  let list = [...portadasStore];
  if (!includeInactive) {
    list = list.filter(p => p.active);
  }
  return list.sort((a, b) => a.order - b.order);
}

export async function getPortadaById(id: string): Promise<PortadaBanner | null> {
  const p = portadasStore.find(item => item.id === id);
  return p || null;
}

export function savePortadaImageBase64(base64Str: string, slideNumber: number, type: 'E' | 'M'): string {
  if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image')) {
    return base64Str;
  }
  try {
    const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const targetDir = path.join(process.cwd(), 'public', 'imagenes', 'portada');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const fileName = `Portada${slideNumber}${type}.webp`;
    const filePath = path.join(targetDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Guardar también en la otra versión (E/M) para que tanto móviles como escritorios y tabletas se sincronicen de inmediato
    const otherType = type === 'E' ? 'M' : 'E';
    const otherFileName = `Portada${slideNumber}${otherType}.webp`;
    const otherFilePath = path.join(targetDir, otherFileName);
    fs.writeFileSync(otherFilePath, buffer);

    return `/imagenes/portada/${fileName}`;
  } catch (e) {
    console.error('Error saving portada image:', e);
    return base64Str;
  }
}

export async function createPortada(data: Partial<PortadaBanner>): Promise<PortadaBanner> {
  const slideNum = data.order || (portadasStore.length + 1);
  let finalImage = data.image || `/imagenes/portada/Portada${slideNum}E.webp`;
  let finalImageMobile = data.imageMobile || `/imagenes/portada/Portada${slideNum}M.webp`;

  if (finalImage && finalImage.startsWith('data:image')) {
    finalImage = savePortadaImageBase64(finalImage, slideNum, 'E');
  }
  if (finalImageMobile && finalImageMobile.startsWith('data:image')) {
    finalImageMobile = savePortadaImageBase64(finalImageMobile, slideNum, 'M');
  }

  const newPortada: PortadaBanner = {
    id: data.id || `portada-${Date.now()}`,
    title: data.title || `Portada ${slideNum}`,
    highlight: data.highlight || '',
    subtitle: data.subtitle || 'Promoción especial BuchiSapa Burger & Broaster',
    badge: data.badge || '✨ DESTACADO',
    badgeType: data.badgeType || 'red-pill',
    image: finalImage,
    imageMobile: finalImageMobile,
    secretPillIcon: data.secretPillIcon || '💡',
    secretPillText: data.secretPillText || '',
    buttonText: data.buttonText || 'VER CARTA',
    buttonCategory: data.buttonCategory || 'todos',
    features: data.features || ['✦ SABOR AMAZÓNICO', '🔥 PREPARADO AL MOMENTO'],
    active: data.active !== undefined ? data.active : true,
    order: data.order !== undefined ? data.order : portadasStore.length + 1,
    createdAt: new Date().toISOString()
  };

  portadasStore.push(newPortada);
  savePortadasToDisk();
  return newPortada;
}

export async function updatePortada(id: string, data: Partial<PortadaBanner>): Promise<PortadaBanner | null> {
  const index = portadasStore.findIndex(item => item.id === id);
  if (index === -1) return null;

  const current = portadasStore[index];
  const slideNum = data.order || current.order || (index + 1);

  let finalImage = data.image !== undefined ? data.image : current.image;
  let finalImageMobile = data.imageMobile !== undefined ? data.imageMobile : current.imageMobile;

  if (finalImage && finalImage.startsWith('data:image')) {
    finalImage = savePortadaImageBase64(finalImage, slideNum, 'E');
  }
  if (finalImageMobile && finalImageMobile.startsWith('data:image')) {
    finalImageMobile = savePortadaImageBase64(finalImageMobile, slideNum, 'M');
  }

  portadasStore[index] = {
    ...current,
    ...data,
    image: finalImage,
    imageMobile: finalImageMobile,
    updatedAt: new Date().toISOString(),
    id // preserve id
  };
  savePortadasToDisk();
  return portadasStore[index];
}

export async function deletePortada(id: string): Promise<boolean> {
  const initialLength = portadasStore.length;
  portadasStore = portadasStore.filter(item => item.id !== id);
  portadasStore.forEach((p, idx) => {
    p.order = idx + 1;
  });
  savePortadasToDisk();
  return portadasStore.length < initialLength;
}

export async function reorderPortadas(orderedIds: string[]): Promise<PortadaBanner[]> {
  orderedIds.forEach((id, index) => {
    const p = portadasStore.find(item => item.id === id);
    if (p) p.order = index + 1;
  });
  savePortadasToDisk();
  return portadasStore.sort((a, b) => a.order - b.order);
}

export function loadProfilesFromDisk(): any[] {
  try {
    const file = path.join(process.cwd(), 'data', 'profiles.json');
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
  } catch(e) {}
  return [
    { id: '1', nombre: 'Juan Pérez', email: 'juan.perez@gmail.com', telefono: '987654321', created_at: '2026-09-20T10:00:00Z' },
    { id: '2', nombre: 'Maria Garcia', email: 'maria.garcia@gmail.com', telefono: '912345678', created_at: '2026-09-22T14:30:00Z' },
    { id: '3', nombre: 'Carlos López', email: 'carlos.lopez@gmail.com', telefono: '955443322', created_at: '2026-09-25T18:15:00Z' }
  ];
}

function simpleHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function getProfiles(): Promise<any[]> {
  const orders = await getOrders();
  const map = new Map<string, any>();

  loadProfilesFromDisk().forEach(p => {
    if (p.email) map.set(p.email.toLowerCase().trim(), p);
    else if (p.id) map.set(p.id, p);
  });

  orders.forEach(o => {
    if (o.customerEmail) {
      const emailKey = o.customerEmail.toLowerCase().trim();
      if (!map.has(emailKey)) {
        map.set(emailKey, {
          id: 'cl-' + simpleHashCode(emailKey),
          nombre: o.customerName || 'Cliente Buchisapa',
          email: o.customerEmail,
          telefono: o.customerPhone || '987654321',
          created_at: o.createdAt || new Date().toISOString()
        });
      }
    }
  });

  return Array.from(map.values());
}


