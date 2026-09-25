export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  price: number;
  description: string;
  badge?: string | null;
  popular?: boolean;
  available: boolean;
  stock: number;
  image: string;
  options?: any;
  includes_sauces?: boolean;
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
}

export interface Order {
  id: string;
  orderNumber: number;
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
  claimType: 'queja' | 'reclamo';
  contractedGood: 'producto' | 'servicio';
  claimedAmount?: number;
  productDescription?: string;
  detail: string;
  consumerRequest: string;
  status: string;
  createdAt: string;
}

// 1. CATEGORÍAS OFICIALES BUCHISAPA
const initialCategories: Category[] = [
  { id: 'hamburguesas', name: 'Burgers', icon: 'Beef', description: 'Hamburguesas artesanales, choripanes y sándwiches especiales.' },
  { id: 'broaster', name: 'Broaster', icon: 'Drumstick', description: 'Pollo broaster ultra crocante con papas, arroz, ensalada y cremas.' },
  { id: 'combos', name: 'Combos', icon: 'Sparkles', description: 'Combos familiares y promociones especiales.' },
  { id: 'bebidas', name: 'Bebidas', icon: 'Coffee', description: 'Gaseosas heladas, chicha morada casera y refrescos naturales.' },
  { id: 'extras', name: 'Extras', icon: 'Utensils', description: 'Papas fritas, porciones de cremas caseras y complementos.' },
  { id: 'salchipapas', name: 'Salchipapas', icon: 'Flame', description: 'Papas crocantes, salchichas, chorizos y combinaciones broaster.' },
  { id: 'platos-amazonicos', name: 'Platos Amazónicos', icon: 'Flame', description: 'Auténticos sabores de la selva peruana: tacacho, cecina, juanes y patacones.' },
  { id: 'refrescos', name: 'Refrescos', icon: 'GlassWater', description: 'Refrescos naturales de frutas amazónicas: cocona, aguajina y maracuyá.' },
  { id: 'infusiones', name: 'Infusiones', icon: 'CupSoda', description: 'Infusiones calientes y café aromático pasado.' }
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
    image: '/imagenes/categorias/platos-amazonicos/banner.jpg',
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
  }
];

// 4. PROMOCIONES
const initialPromotions: Promotion[] = [
  {
    id: 'promo-1',
    title: 'Combo Familiar Amazónico',
    description: '1 Juane + 1 Tacacho con Cecina + 1/4 Pollo Broaster + 2 Refrescos de Cocona',
    price: 45.00,
    originalPrice: 55.00,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    badge: 'POPULAR'
  },
  {
    id: 'promo-2',
    title: 'Dúo Broaster Crocante',
    description: '2 Porciones de 1/4 Broaster (Pecho y Pierna) + Papas familiares + 2 Gaseosas',
    price: 32.00,
    originalPrice: 38.00,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    badge: 'OFERTA'
  }
];

// IN-MEMORY STORES
const categoriesStore = [...initialCategories];
let productsStore = [...initialProducts];
const saucesStore = [...initialSauces];
const promotionsStore = [...initialPromotions];
const ordersStore: Order[] = [
  {
    id: 'ORD-1001',
    orderNumber: 101,
    customerName: 'Juan Pérez',
    customerPhone: '943 312 024',
    customerEmail: 'juan.perez@example.com',
    orderType: 'delivery',
    deliveryAddress: 'Av. La Estrella 124, Santa Clara, Ate',
    deliveryReference: 'Frente al parque',
    paymentMethod: 'Yape',
    notes: 'Por favor enviar bastante ají de pollería',
    status: 'en_camino',
    total: 35.00,
    items: JSON.stringify([
      { id: 'ama-2', name: 'Tacacho con Cecina', quantity: 1, price: 12.00 },
      { id: 'bro-1', name: 'Broaster Pecho', quantity: 1, price: 18.00 },
      { id: 'ref-1', name: 'Maracuyá', quantity: 1, price: 3.00 }
    ]),
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];
const claimsStore: Claim[] = [];

// QUERIES
export async function getCategories(): Promise<Category[]> {
  return categoriesStore;
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
  if (categoryId) {
    return productsStore.filter(p => p.category_id === categoryId);
  }
  return productsStore;
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = productsStore.find(p => p.id === id);
  return product || null;
}

export async function getSauces(): Promise<Sauce[]> {
  return saucesStore;
}

export async function getPromotions(): Promise<Promotion[]> {
  return promotionsStore;
}

export async function getOrders(status?: string, email?: string): Promise<Order[]> {
  let list = [...ordersStore];
  if (status) {
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

export async function createOrder(data: any): Promise<Order> {
  const newOrder: Order = {
    id: data.id || `ORD-${Date.now()}`,
    orderNumber: data.orderNumber || Math.floor(100 + Math.random() * 900),
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
    total: Number(data.total) || 0,
    items: typeof data.items === 'string' ? data.items : JSON.stringify(data.items),
    userId: data.userId,
    createdAt: new Date().toISOString()
  };

  ordersStore.unshift(newOrder);
  return newOrder;
}

export async function updateOrderStatus(id: string, status: string): Promise<Order | null> {
  const order = ordersStore.find(o => o.id === id || String(o.orderNumber) === id);
  if (!order) return null;
  order.status = status;
  return order;
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
    claimType: data.claimType || 'reclamo',
    contractedGood: data.contractedGood || 'producto',
    claimedAmount: data.claimedAmount ? Number(data.claimedAmount) : undefined,
    productDescription: data.productDescription || 'Atención en restaurante',
    detail: data.detail,
    consumerRequest: data.consumerRequest || '',
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
    includes_sauces: Boolean(data.includes_sauces)
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
  isOpen: true,
  openedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  responsable: 'Admin BuchiSapa',
  initialCash: 250.00
};

let cajaMovementsStore: CajaMovement[] = [
  {
    id: 'mov-1',
    hora: '17:00',
    tipo: 'ingreso',
    categoria: 'Fondo Inicial',
    monto: 250.00,
    motivo: 'Apertura de turno tarde/noche con sencillo para cambio',
    responsable: 'Admin BuchiSapa',
    comprobante: 'APERTURA-001',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: 'mov-2',
    hora: '18:30',
    tipo: 'egreso',
    categoria: 'Insumos de Cocina',
    monto: 25.00,
    motivo: 'Compra de 2 bolsas de hielo frappé para refrescos de camu camu',
    responsable: 'Admin BuchiSapa',
    comprobante: 'BOL-0921',
    createdAt: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString()
  },
  {
    id: 'mov-3',
    hora: '19:45',
    tipo: 'egreso',
    categoria: 'Empaques y Despacho',
    monto: 20.00,
    motivo: 'Paquete de bolsas térmicas kraft para hamburguesas delivery',
    responsable: 'Admin BuchiSapa',
    comprobante: 'TK-4821',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  }
];

let cajaClosuresStore: CajaClosure[] = [
  {
    id: 'cierre-prev-1',
    fecha: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
    turno: 'Turno Tarde/Noche',
    apertura: 250.00,
    ventasTotal: 2140.00,
    efectivoEsperado: 890.00,
    efectivoReal: 890.00,
    diferencia: 0.00,
    responsable: 'Admin BuchiSapa',
    cerradoAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    notas: 'Cuadre exacto sin novedades. Alta salida de BuchiBurgers.'
  }
];

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

  // Si no hay pedidos suficientes, usar datos representativos
  if (totalSales === 0) {
    totalSales = 1850.50;
    efectivo = 720.00;
    yapePlin = 880.50;
    tarjeta = 250.00;
  }

  // Egresos e ingresos extraordinarios
  const egresosTotal = cajaMovementsStore
    .filter(m => m.tipo === 'egreso')
    .reduce((sum, m) => sum + m.monto, 0);

  const ingresosExtra = cajaMovementsStore
    .filter(m => m.tipo === 'ingreso' && m.categoria !== 'Fondo Inicial')
    .reduce((sum, m) => sum + m.monto, 0);

  const efectivoEsperado = (cajaState.initialCash + efectivo + ingresosExtra) - egresosTotal;

  const deliveryOrders = orders.filter(o => o.orderType === 'delivery').length || 24;
  const pickupOrders = orders.filter(o => o.orderType === 'pickup').length || 10;
  const salonOrders = orders.filter(o => o.orderType === 'salon').length || 4;

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
    totalOrders: orders.length > 0 ? orders.length : 38,
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

    const ticketSeq = String(orders.length - idx).padStart(4, '0');
    const orderNum = o.orderNumber || 1000 + idx;

    return {
      id: `tk-${o.id}`,
      ticketNumber: `TK-${ticketSeq}`,
      orderNumber: orderNum,
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
  const nextNumber = customTicketsStore.length + 1050;
  const seq = String(nextNumber).slice(-4);

  const newTicket: TicketRecord = {
    id: `tk-quick-${Date.now()}`,
    ticketNumber: `TK-${seq}`,
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

// ============================================================================
// GESTIÓN DE PORTADAS / HERO CAROUSEL BANNERS
// ============================================================================
export interface PortadaBanner {
  id: string;
  title: string;
  highlight?: string;
  subtitle: string;
  badge?: string;
  badgeType?: string;
  image: string;
  secretPillIcon?: string;
  secretPillText?: string;
  buttonText: string;
  buttonCategory: string;
  features?: string[];
  active: boolean;
  order: number;
  createdAt: string;
}

let portadasStore: PortadaBanner[] = [
  {
    id: 'portada-1',
    title: 'POLLO BROASTER',
    highlight: 'ULTRA CROCANTE',
    subtitle: 'Empanizado artesanal dorado a la perfección, jugoso por dentro con papas crocantes y nuestras mejores cremas caseras.',
    badge: '✨ ESPECIALIDAD DE LA CASA',
    badgeType: 'red-pill',
    image: '/imagenes/portada/portada-1.jpg',
    secretPillIcon: '💡',
    secretPillText: 'RECETA SECRETA BUCHISAPA | Pecho, Pierna, Encuentro y Alitas desde S/ 12.00',
    buttonText: 'PIDE TU BROASTER AQUÍ',
    buttonCategory: 'broaster',
    features: ['✦ 100% POLLO FRESCO', '👤 EMPANIZADO CRUJIENTE', '🤍 CREMAS CASERAS'],
    active: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'portada-2',
    title: 'AUTÉNTICO JUANE',
    highlight: '& SABORES AMAZÓNICOS',
    subtitle: 'Elaborado con aromática hoja de bijao, arroz sazonado con mishkina, gallina tierna, huevo y aceitunas. Acompañado de tacacho con cecina y patacones crocantes.',
    badge: '🌿 ESPECIALIDAD DE LA SELVA',
    badgeType: 'red-pill',
    image: '/imagenes/portada/portada-2.jpg',
    secretPillIcon: '🌴',
    secretPillText: '100% SAZÓN REGIONAL | Juanes, Tacacho con Cecina y Patacones desde S/ 12.00',
    buttonText: 'PEDIR PLATOS AMAZÓNICOS',
    buttonCategory: 'platos-amazonicos',
    features: ['✦ HOJA DE BIJAO FRESCA', '🔥 CECINA AHUMADA', '🌶️ AJÍ DE COCONA'],
    active: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'portada-3',
    title: 'HAMBURGUESAS ARTESANALES',
    highlight: 'AL CARBÓN',
    subtitle: 'Carne jugosa, queso cheddar, huevo, tocino, plátano y papas fritas doradas.',
    badge: 'BURGUERS & ROYALS',
    badgeType: 'text',
    image: '/imagenes/portada/portada-3.jpg',
    secretPillIcon: '🍔',
    secretPillText: 'SABOR AUTÉNTICO | 100% Carne de res seleccionada con papas artesanales',
    buttonText: 'VER HAMBURGUESAS',
    buttonCategory: 'hamburguesas',
    features: ['✦ CARNE PREMIUM', '🔥 PAN ARTESANAL', '🧀 CHEDDAR FUNDIDO'],
    active: true,
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'portada-4',
    title: 'HAMBURGUESA',
    highlight: 'AMAZÓNICA BUCHISAPA',
    subtitle: 'Carne jugosa artesanal de res con fina cecina ahumada de Tarapoto, queso cheddar derretido, plátano bellaco crujiente y cremosa salsa de cocona con ají charapita.',
    badge: '🔥 EDICIÓN ESPECIAL AMAZÓNICA',
    badgeType: 'red-pill',
    image: '/imagenes/portada/portada-4.jpg',
    secretPillIcon: '🌴',
    secretPillText: 'NUEVO DE TEMPORADA | Incluye Papas Nativas Crocantes + Refresco desde S/ 18.00',
    buttonText: 'PROBAR HAMBURGUESA AMAZÓNICA',
    buttonCategory: 'hamburguesas',
    features: ['✦ CECINA DE TARAPOTO', '🌴 PLÁTANO BELLACO CRISPY', '🔥 SALSA CHARAPITA & COCONA'],
    active: true,
    order: 4,
    createdAt: new Date().toISOString()
  }
];

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

export async function createPortada(data: Partial<PortadaBanner>): Promise<PortadaBanner> {
  const newPortada: PortadaBanner = {
    id: data.id || `portada-${Date.now()}`,
    title: data.title || 'NUEVA PORTADA',
    highlight: data.highlight || '',
    subtitle: data.subtitle || 'Promoción especial BuchiSapa Burger & Broaster',
    badge: data.badge || '✨ DESTACADO',
    badgeType: data.badgeType || 'red-pill',
    image: data.image || '/imagenes/portada/portada-1.jpg',
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
  return newPortada;
}

export async function updatePortada(id: string, data: Partial<PortadaBanner>): Promise<PortadaBanner | null> {
  const index = portadasStore.findIndex(item => item.id === id);
  if (index === -1) return null;

  portadasStore[index] = {
    ...portadasStore[index],
    ...data,
    id // preserve id
  };
  return portadasStore[index];
}

export async function deletePortada(id: string): Promise<boolean> {
  const initialLength = portadasStore.length;
  portadasStore = portadasStore.filter(item => item.id !== id);
  return portadasStore.length < initialLength;
}

export async function reorderPortadas(orderedIds: string[]): Promise<PortadaBanner[]> {
  orderedIds.forEach((id, index) => {
    const p = portadasStore.find(item => item.id === id);
    if (p) p.order = index + 1;
  });
  return portadasStore.sort((a, b) => a.order - b.order);
}


