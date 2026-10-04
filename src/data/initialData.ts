import { Category, Product, BusinessConfig, HeroBanner } from '../types';

export const initialCategories: Category[] = [
  { id: 'C0001', slug: 'promociones', name: 'PROMOCIONES', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80' },
  { id: 'C0002', slug: 'alitas', name: 'ALITAS', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80' },
  { id: 'C0003', slug: 'bebidas', name: 'BEBIDAS', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80' },
  { id: 'C0004', slug: 'broaster', name: 'BROASTER', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80' },
  { id: 'C0005', slug: 'hamburguesas', name: 'HAMBURGUESAS', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80' },
  { id: 'C0006', slug: 'infusiones', name: 'INFUSIONES', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80' },
  { id: 'C0007', slug: 'platos-amazonicos', name: 'PLATOS AMAZÓNICOS', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80' },
  { id: 'C0008', slug: 'refrescos', name: 'REFRESCOS', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80' },
  { id: 'C0009', slug: 'salchipapas', name: 'SALCHIPAPAS Y SALCHIBROASTERS', image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80' },
  { id: 'C0010', slug: 'adicional', name: 'ADICIONALES', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&auto=format&fit=crop&q=80' }
];

const defaultCremas = ['Mayonesa', 'Mostaza', 'Ketchup', 'Ají de Rocoto', 'Tártara', 'Salsa Golf'];

export const initialProducts: Product[] = [
  // PROMOCIONES
  {
    id: 'PL0001',
    name: 'PROMO BUCHI DUO',
    categoryId: 'C0001',
    categorySlug: 'promociones',
    price: 22.0,
    description: 'Dos hamburguesas artesanales premium más dos gaseosas personales Pepsi.',
    available: true,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Papa crocante', 'Hamburguesa artesanal', 'Ensalada fresca'],
    cremas: defaultCremas
  },
  {
    id: 'PL0002',
    name: 'PROMO BROASTER FAMILIAR',
    categoryId: 'C0001',
    categorySlug: 'promociones',
    price: 38.0,
    description: 'Tres presas broaster (pecho, pierna, ala) con papas crocantes, arroz graneado y gaseosa Inca Kola 1.5L.',
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Papas Fritas', 'Arroz graneado', 'Ensalada fresca', 'Inca Kola 1.5L'],
    cremas: defaultCremas
  },
  {
    id: 'PL0003',
    name: 'PROMO SALCHI BURGER',
    categoryId: 'C0001',
    categorySlug: 'promociones',
    price: 24.0,
    description: 'Hamburguesa Cheese Burguer y Salchipapa Clásica más Coca Cola personal.',
    available: true,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Queso cheddar', 'Papa crocante', 'Ensalada fresca'],
    cremas: defaultCremas
  },
  {
    id: 'PL0004',
    name: 'PROMO SELVA POWER',
    categoryId: 'C0001',
    categorySlug: 'promociones',
    price: 29.0,
    description: 'Tacacho con Cecina de Tarapoto y Salchibroaster Pierna más Gaseosa Fanta.',
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Maduros fritos', 'Sarza criolla', 'Papa crocante', 'Ensalada fresca'],
    cremas: defaultCremas
  },

  // ALITAS
  {
    id: 'PL0005',
    name: 'Alitas Acevichadas',
    categoryId: 'C0002',
    categorySlug: 'alitas',
    price: 29.0,
    description: '5 alitas jugosas bañadas en cremosa salsa acevichada con toque crocante.',
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['5 alitas', 'Papas crocantes'],
    cremas: defaultCremas
  },
  {
    id: 'PL0006',
    name: 'Alitas BBQ Ahumadas',
    categoryId: 'C0002',
    categorySlug: 'alitas',
    price: 15.0,
    description: '5 alitas glaseadas en salsa BBQ ahumada con especias de la casa.',
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['5 alitas', 'Papas crocantes'],
    cremas: defaultCremas
  },

  // BEBIDAS
  {
    id: 'PL0007',
    name: 'Inca Kola 500ml',
    categoryId: 'C0003',
    categorySlug: 'bebidas',
    price: 5.0,
    description: 'Gaseosa peruana personal bien helada.',
    available: true,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
    includesSauces: false,
    accompaniments: [],
    cremas: []
  },
  {
    id: 'PL0008',
    name: 'Coca Cola 500ml',
    categoryId: 'C0003',
    categorySlug: 'bebidas',
    price: 5.0,
    description: 'Gaseosa clásica personal helada.',
    available: true,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&auto=format&fit=crop&q=80',
    includesSauces: false,
    accompaniments: [],
    cremas: []
  },

  // BROASTER
  {
    id: 'PL0012',
    name: 'Pollo Broaster Pecho Gigante',
    categoryId: 'C0004',
    categorySlug: 'broaster',
    price: 18.0,
    description: 'Pechuga broaster gigante crocante con papas doradas, arroz y ensalada fresca.',
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Papa crocante', 'Ensalada fresca', 'Arroz'],
    cremas: defaultCremas
  },
  {
    id: 'PL0013',
    name: 'Pollo Broaster Pierna',
    categoryId: 'C0004',
    categorySlug: 'broaster',
    price: 12.0,
    description: 'Pierna broaster crocante y sazonada con papas, arroz y ensalada.',
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Papa crocante', 'Ensalada fresca', 'Arroz'],
    cremas: defaultCremas
  },

  // HAMBURGUESAS
  {
    id: 'PL0016',
    name: 'Hamburguesa Clásica',
    categoryId: 'C0005',
    categorySlug: 'hamburguesas',
    price: 10.0,
    description: 'Carne artesanal de la casa a la plancha, papas crocantes y ensalada fresca.',
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Hamburguesa artesanal', 'Papa crocante', 'Ensalada fresca'],
    cremas: defaultCremas
  },
  {
    id: 'PL0024',
    name: 'La Suprema Buchi',
    categoryId: 'C0005',
    categorySlug: 'hamburguesas',
    price: 15.0,
    description: 'Doble carne artesanal, tocino crocante, queso, huevo frito y jamón.',
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Tocino', 'Queso', 'Huevo frito', 'Jamón', 'Papa crocante'],
    cremas: defaultCremas
  },
  {
    id: 'PL0025',
    name: 'Hamburguesa a lo Pobre',
    categoryId: 'C0005',
    categorySlug: 'hamburguesas',
    price: 14.0,
    description: 'Carne artesanal, huevo frito montado, plátano maduro frito, queso y papas.',
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Huevo frito', 'Queso', 'Jamón', 'Plátano maduro', 'Papa crocante'],
    cremas: defaultCremas
  },

  // PLATOS AMAZONICOS
  {
    id: 'PL0031',
    name: 'Patacones con Chorizo Amazónico',
    categoryId: 'C0007',
    categorySlug: 'platos-amazonicos',
    price: 12.0,
    description: 'Patacones crujientes de plátano verde con chorizo amazónico parrillero y salsa criolla.',
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Patacones', 'Chorizo selvático', 'Sarza criolla'],
    cremas: defaultCremas
  },
  {
    id: 'PL0032',
    name: 'Tacacho con Cecina de Tarapoto',
    categoryId: 'C0007',
    categorySlug: 'platos-amazonicos',
    price: 12.0,
    description: 'Tacacho tradicional machacado con cecina ahumada de Tarapoto, maduros fritos y sarza criolla.',
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Maduros fritos', 'Sarza criolla', 'Ají de cocona'],
    cremas: defaultCremas
  },
  {
    id: 'PL0033',
    name: 'Juane Tradicional Selvático',
    categoryId: 'C0007',
    categorySlug: 'platos-amazonicos',
    price: 15.0,
    description: 'Arroz selvático con mishkina, huevo duro, aceituna y presa de gallina envuelta en hoja de bijao.',
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Maduros fritos', 'Ají de cocona'],
    cremas: defaultCremas
  },
  {
    id: 'PL0037',
    name: 'Arroz Chaufa Amazónico',
    categoryId: 'C0007',
    categorySlug: 'platos-amazonicos',
    price: 15.0,
    description: 'Chaufa al wok salteado al instante con cecina ahumada y chorizo amazónico.',
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Cecina y chorizo amazónico salteado', 'Plátano frito'],
    cremas: defaultCremas
  },

  // REFRESCOS
  {
    id: 'PL0038',
    name: 'Refresco de Maracuyá 1L',
    categoryId: 'C0008',
    categorySlug: 'refrescos',
    price: 3.0,
    description: 'Refresco de pura maracuyá natural bien helada.',
    available: true,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    includesSauces: false,
    accompaniments: [],
    cremas: []
  },
  {
    id: 'PL0039',
    name: 'Chicha Morada Casera 1L',
    categoryId: 'C0008',
    categorySlug: 'refrescos',
    price: 3.0,
    description: 'Chicha morada casera de maíz morado, manzana, canela y piña.',
    available: true,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80',
    includesSauces: false,
    accompaniments: [],
    cremas: []
  },
  {
    id: 'PL0040',
    name: 'Refresco de Cocona Amazónica',
    categoryId: 'C0008',
    categorySlug: 'refrescos',
    price: 3.0,
    description: 'Refresco amazónico de pura pulpa de cocona fresca.',
    available: true,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
    includesSauces: false,
    accompaniments: [],
    cremas: []
  },

  // SALCHIPAPAS
  {
    id: 'PL0043',
    name: 'Salchipapa Clásica',
    categoryId: 'C0009',
    categorySlug: 'salchipapas',
    price: 10.0,
    description: 'Papas fritas crocantes, salchichas doradas y ensalada fresca con todas las cremas.',
    available: true,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Papas crocantes', 'Ensalada fresca'],
    cremas: defaultCremas
  },
  {
    id: 'PL0044',
    name: 'Salchipapa a lo Pobre',
    categoryId: 'C0009',
    categorySlug: 'salchipapas',
    price: 13.0,
    description: 'Salchipapa con huevo frito montado y plátano maduro frito dulce.',
    available: true,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Papas crocantes', 'Huevo frito', 'Plátano maduro', 'Ensalada fresca'],
    cremas: defaultCremas
  },
  {
    id: 'PL0045',
    name: 'Salchibroaster Pecho Gigante',
    categoryId: 'C0009',
    categorySlug: 'salchipapas',
    price: 20.0,
    description: 'Papas crocantes con pecho broaster gigante y salchichas.',
    available: true,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    includesSauces: true,
    accompaniments: ['Papas crocantes', 'Pecho broaster', 'Ensalada fresca'],
    cremas: defaultCremas
  }
];

export const initialHeroBanners: HeroBanner[] = [
  {
    id: '1',
    title: '¡Sabor Auténtico Amazónico & Broaster!',
    subtitle: 'Av. La Estrella con Calle 28 de Julio, Santa Clara',
    tag: 'NOCHE & MADRUGADA',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    title: 'Promo Buchi Dúo S/ 22.00',
    subtitle: '2 Hamburguesas artesanales + 2 Gaseosas Pepsi',
    tag: 'MÁS VENDIDO',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    title: 'Broaster Familiar Crujiente',
    subtitle: 'Pecho + Pierna + Ala + Papas + Inca Kola',
    tag: 'COMBO FAMILIAR',
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80'
  }
];

export const initialBusinessConfig: BusinessConfig = {
  id: 'principal',
  businessName: 'BuchiSapa - Pollería & Sabor Amazónico',
  ruc: '10723456781',
  address: 'Av. La Estrella con Calle 28 de Julio, Santa Clara, Ate - Lima',
  phone: '+51 942 475 459',
  email: 'buchisapaweb@gmail.com',
  deliveryFee: 4.00,
  printerIp: '192.168.8.100',
  printerPort: 80,
  openingHours: 'Lunes a Domingo: 6:00 PM - 5:00 AM',
  isOpen: true
};
