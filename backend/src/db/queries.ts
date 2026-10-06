import fs from 'fs';
import path from 'path';

export interface Category {
  id: string;
  code?: string;
  name: string;
  icon: string;
  description: string;
  banner?: string;
  image?: string;
  order?: number;
  slug?: string;
}

export interface Product {
  id: string;
  code?: string;
  name: string;
  category_id: string;
  category?: string;
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

// 1. CATEGORÍAS OFICIALES BUCHISAPA (10 CATEGORÍAS ENLAZADAS AL CLIENTE)
const initialCategories: Category[] = [
  {
    "id": "C0001",
    "code": "C0001",
    "name": "ADICIONALES",
    "icon": "Plus",
    "description": "Complementos y adicionales para personalizar los pedidos.",
    "banner": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80",
    "order": 1
  },
  {
    "id": "C0002",
    "code": "C0002",
    "name": "ALITAS",
    "icon": "Drumstick",
    "description": "Alitas crujientes en salsa acevichada y BBQ.",
    "banner": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80",
    "order": 2
  },
  {
    "id": "C0003",
    "code": "C0003",
    "name": "BEBIDAS",
    "icon": "Coffee",
    "description": "Gaseosas heladas, agua y bebidas en botella.",
    "banner": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
    "order": 3
  },
  {
    "id": "C0004",
    "code": "C0004",
    "name": "BROASTER",
    "icon": "Drumstick",
    "description": "Pollo broaster ultra crocante con papas, arroz y cremas.",
    "banner": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "order": 4
  },
  {
    "id": "C0005",
    "code": "C0005",
    "name": "HAMBURGUESAS",
    "icon": "Beef",
    "description": "Hamburguesas artesanales, choripanes y sándwiches especiales.",
    "banner": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    "order": 5
  },
  {
    "id": "C0006",
    "code": "C0006",
    "name": "INFUSIONES",
    "icon": "CupSoda",
    "description": "Infusiones calientes y café aromático pasado.",
    "banner": "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80",
    "order": 6
  },
  {
    "id": "C0007",
    "code": "C0007",
    "name": "PLATOS AMAZÓNICOS",
    "icon": "Flame",
    "description": "Auténticos sabores de la selva peruana: tacacho, cecina, juanes y patacones.",
    "banner": "/imagenes/categorias/platos-amazonicos/banner.webp",
    "order": 7
  },
  {
    "id": "C0008",
    "code": "C0008",
    "name": "PROMOCIONES",
    "icon": "Sparkles",
    "description": "Promociones y combos especiales de BuchiSapa.",
    "banner": "/imagenes/portada/Portada1E.webp",
    "order": 8
  },
  {
    "id": "C0009",
    "code": "C0009",
    "name": "REFRESCOS",
    "icon": "GlassWater",
    "description": "Refrescos naturales de frutas amazónicas: cocona, aguajina y maracuyá.",
    "banner": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
    "order": 9
  },
  {
    "id": "C0010",
    "code": "C0010",
    "name": "SALCHIPAPAS Y SALCHIBROASTERS",
    "icon": "Flame",
    "description": "Papas crocantes, salchichas, chorizos y combinaciones broaster.",
    "banner": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "order": 10
  }
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

// 3. PRODUCTOS OFICIALES DE BUCHISAPA (CATÁLOGO OFICIAL DE 57 PRODUCTOS)
const initialProducts: Product[] = [
  {
    "id": "PL00001",
    "code": "PL00001",
    "name": "Acevichadas",
    "category": "ALITAS",
    "category_id": "C0002",
    "price": 15,
    "description": "Acompañamiento: 5 alitas + Papas crocantes",
    "badge": "ACEVICHADAS",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00002",
    "code": "PL00002",
    "name": "Agua Cielo",
    "category": "BEBIDAS",
    "category_id": "C0003",
    "price": 2.5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "NATURAL",
    "popular": false,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00003",
    "code": "PL00003",
    "name": "Aguajina",
    "category": "REFRESCOS",
    "category_id": "C0009",
    "price": 3,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "SELVÁTICO",
    "popular": true,
    "available": true,
    "stock": 40,
    "image": "https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00004",
    "code": "PL00004",
    "name": "Ala",
    "category": "BROASTER",
    "category_id": "C0004",
    "price": 10,
    "description": "Acompañamiento: Papa crocante + Ensalada fresca + Arroz",
    "badge": "ECONÓMICO",
    "popular": false,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00005",
    "code": "PL00005",
    "name": "Anís",
    "category": "INFUSIONES",
    "category_id": "C0006",
    "price": 2.5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "CALIENTE",
    "popular": false,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00006",
    "code": "PL00006",
    "name": "Arroz Chaufa Amazónico",
    "category": "PLATOS AMAZÓNICOS",
    "category_id": "C0007",
    "price": 15,
    "description": "Acompañamiento: Cecina y chorizo amazónico salteado",
    "badge": "FUSIÓN",
    "popular": true,
    "available": true,
    "stock": 20,
    "image": "/imagenes/categorias/platos-amazonicos/banner.webp",
    "includes_sauces": true
  },
  {
    "id": "PL00007",
    "code": "PL00007",
    "name": "Bacon Burguer",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 12,
    "description": "Acompañamiento: Papas crocantes + Tocino + Queso",
    "badge": "TOCINO",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00008",
    "code": "PL00008",
    "name": "BBQ",
    "category": "ALITAS",
    "category_id": "C0002",
    "price": 15,
    "description": "Acompañamiento: 5 alitas + Papas crocantes",
    "badge": "BBQ",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1527477378308-140ae2443325?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00009",
    "code": "PL00009",
    "name": "Café",
    "category": "INFUSIONES",
    "category_id": "C0006",
    "price": 3,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "PASADO",
    "popular": true,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00010",
    "code": "PL00010",
    "name": "Caldo Amazónico",
    "category": "PLATOS AMAZÓNICOS",
    "category_id": "C0007",
    "price": 12,
    "description": "Acompañamiento: Yuca + Verduras de la selva",
    "badge": "TRADICIONAL",
    "popular": false,
    "available": true,
    "stock": 15,
    "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00011",
    "code": "PL00011",
    "name": "Camu Camu",
    "category": "REFRESCOS",
    "category_id": "C0009",
    "price": 3,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "VITAMINA C",
    "popular": true,
    "available": true,
    "stock": 40,
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00012",
    "code": "PL00012",
    "name": "Cheese Burguer",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 11,
    "description": "Acompañamiento: Queso cheddar",
    "badge": "CHEDDAR",
    "popular": true,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00013",
    "code": "PL00013",
    "name": "Chicha",
    "category": "REFRESCOS",
    "category_id": "C0009",
    "price": 3,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "CASERA",
    "popular": true,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00014",
    "code": "PL00014",
    "name": "Chilcano de Carachama o Pescado del Día",
    "category": "PLATOS AMAZÓNICOS",
    "category_id": "C0007",
    "price": 15,
    "description": "Acompañamiento: Inguiri + Plátano",
    "badge": "RECONSTITUYENTE",
    "popular": false,
    "available": true,
    "stock": 15,
    "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00015",
    "code": "PL00015",
    "name": "Choripán",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 10,
    "description": "Acompañamiento: Papas crocantes + Chorizo + Ensalada fresca",
    "badge": "PARRILLERO",
    "popular": false,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00016",
    "code": "PL00016",
    "name": "Clásica",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 10,
    "description": "Acompañamiento: Hamburguesa artesanal + Papa crocante + Ensalada fresca",
    "badge": "CLÁSICA",
    "popular": true,
    "available": true,
    "stock": 35,
    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00017",
    "code": "PL00017",
    "name": "Coca Cola",
    "category": "BEBIDAS",
    "category_id": "C0003",
    "price": 5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "PERSONAL",
    "popular": true,
    "available": true,
    "stock": 45,
    "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00018",
    "code": "PL00018",
    "name": "Cocona",
    "category": "REFRESCOS",
    "category_id": "C0009",
    "price": 3,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "TÍPICO",
    "popular": true,
    "available": true,
    "stock": 40,
    "image": "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00019",
    "code": "PL00019",
    "name": "Encuentro",
    "category": "BROASTER",
    "category_id": "C0004",
    "price": 13,
    "description": "Acompañamiento: Papa crocante + Ensalada fresca + Arroz",
    "badge": "BROASTER",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00020",
    "code": "PL00020",
    "name": "Fanta",
    "category": "BEBIDAS",
    "category_id": "C0003",
    "price": 3.5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "PERSONAL",
    "popular": false,
    "available": true,
    "stock": 35,
    "image": "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00021",
    "code": "PL00021",
    "name": "Filete de Pollo",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 11,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "popular": false,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1525164286253-04e68b9d94c6?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00022",
    "code": "PL00022",
    "name": "Hamburguesa",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00023",
    "code": "PL00023",
    "name": "Hamburguesa a lo Pobre",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 14,
    "description": "Acompañamiento: Huevo frito + Queso + Jamón + Plátano",
    "badge": "A LO POBRE",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00024",
    "code": "PL00024",
    "name": "Hawaiana Carne",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 14,
    "description": "Acompañamiento: Papa crocante + Carne artesanal + Huevo + Jamón + Queso + Piña + Ensalada fresca",
    "badge": "HAWAIANA",
    "popular": true,
    "available": true,
    "stock": 20,
    "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00025",
    "code": "PL00025",
    "name": "Hawaiana Pollo",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 13,
    "description": "Acompañamiento: Papa crocante + Pollo crispy + Huevo + Jamón + Queso + Piña + Ensalada fresca",
    "badge": "CRISPY",
    "popular": true,
    "available": true,
    "stock": 20,
    "image": "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00026",
    "code": "PL00026",
    "name": "Huevo",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 2,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 100,
    "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00027",
    "code": "PL00027",
    "name": "Inca Kola",
    "category": "BEBIDAS",
    "category_id": "C0003",
    "price": 5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "POPULAR",
    "popular": true,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00028",
    "code": "PL00028",
    "name": "Jamón",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 2,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 80,
    "image": "https://images.unsplash.com/photo-1524438418049-ab2acb7aa48f?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00029",
    "code": "PL00029",
    "name": "Juanes",
    "category": "PLATOS AMAZÓNICOS",
    "category_id": "C0007",
    "price": 15,
    "description": "Acompañamiento: Maduros fritos",
    "badge": "TRADICIÓN",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00030",
    "code": "PL00030",
    "name": "La Suprema",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 15,
    "description": "Acompañamiento: Tocino + Queso + Huevo frito + Jamón",
    "badge": "SUPREMA",
    "popular": true,
    "available": true,
    "stock": 20,
    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00031",
    "code": "PL00031",
    "name": "Maracuyá",
    "category": "REFRESCOS",
    "category_id": "C0009",
    "price": 3,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "REFRESCANTE",
    "popular": true,
    "available": true,
    "stock": 45,
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00032",
    "code": "PL00032",
    "name": "Palometa Frita con Maduro o Plátano",
    "category": "PLATOS AMAZÓNICOS",
    "category_id": "C0007",
    "price": 15,
    "description": "Acompañamiento: Arroz + Maduro frito",
    "badge": "RÍO",
    "popular": false,
    "available": true,
    "stock": 15,
    "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00033",
    "code": "PL00033",
    "name": "Patacones con Chorizo",
    "category": "PLATOS AMAZÓNICOS",
    "category_id": "C0007",
    "price": 12,
    "description": "Acompañamiento: Patacones + Chorizo",
    "badge": "ENTRADA",
    "popular": true,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00034",
    "code": "PL00034",
    "name": "Pecho",
    "category": "BROASTER",
    "category_id": "C0004",
    "price": 18,
    "description": "Acompañamiento: Papa crocante + Ensalada fresca + Arroz",
    "badge": "PREMIUM",
    "popular": true,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00035",
    "code": "PL00035",
    "name": "Pepsi",
    "category": "BEBIDAS",
    "category_id": "C0003",
    "price": 2,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "PERSONAL",
    "popular": false,
    "available": true,
    "stock": 40,
    "image": "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00036",
    "code": "PL00036",
    "name": "Pierna",
    "category": "BROASTER",
    "category_id": "C0004",
    "price": 12,
    "description": "Acompañamiento: Papa crocante + Ensalada fresca + Arroz",
    "badge": "CLÁSICO",
    "popular": true,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00037",
    "code": "PL00037",
    "name": "Piña",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 2,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 80,
    "image": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00038",
    "code": "PL00038",
    "name": "Plátano",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 2,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 80,
    "image": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00039",
    "code": "PL00039",
    "name": "Pollo Broaster",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00040",
    "code": "PL00040",
    "name": "Pollo Deshilachado",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 9,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "DESHILACHADO",
    "popular": false,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1525164286253-04e68b9d94c6?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00041",
    "code": "PL00041",
    "name": "PROMO BROASTER FAMILIAR",
    "category": "PROMOCIONES",
    "category_id": "C0008",
    "price": 38,
    "description": "La selección ideal para compartir en familia. Incluye un Broaster Presa Pecho, un Broaster Presa Pierna y un Broaster Presa Ala, con el sabor crujiente que nos caracteriza, más una Gaseosa Personal Inca Kola. / Acompañamientos: Papa crocante + Ensalada fresca + Arroz",
    "badge": "FAMILIAR",
    "popular": true,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00042",
    "code": "PL00042",
    "name": "PROMO BUCHI DUO",
    "category": "PROMOCIONES",
    "category_id": "C0008",
    "price": 22,
    "description": "Una experiencia pensada para dos. Disfruta de dos Hamburguesas Tipo Clásica elaboradas con nuestra hamburguesa artesanal premium, acompañadas de dos Gaseosas Personales Pepsi. / Acompañamientos: Papa crocante + Hamburguesa artesanal + Ensalada fresca",
    "badge": "DUO",
    "popular": true,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00043",
    "code": "PL00043",
    "name": "PROMO SALCHI BURGER",
    "category": "PROMOCIONES",
    "category_id": "C0008",
    "price": 24,
    "description": "La fusión de nuestros dos clásicos más pedidos. Una Hamburguesa Tipo Cheese Burguer y una Salchipapa Tipo Salchipapa Clásica, acompañadas de una Gaseosa Personal Coca Cola. / Acompañamientos: Queso cheddar + Papa crocante + Ensalada fresca",
    "badge": "COMBO",
    "popular": true,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00044",
    "code": "PL00044",
    "name": "PROMO SELVA POWER",
    "category": "PROMOCIONES",
    "category_id": "C0008",
    "price": 29,
    "description": "Un homenaje a la Amazonía. Compuesto por un Plato Amazónico Tipo Tacacho con Cecina y un Salchibroaster Tipo Salchibroaster Pierna Presa Pierna, junto a una Gaseosa Personal Fanta. / Acompañamientos: Maduros fritos + Sarza criolla + Papa crocante + Ensalada fresca",
    "badge": "SELVA",
    "popular": true,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00045",
    "code": "PL00045",
    "name": "Queso",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 2,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 80,
    "image": "https://images.unsplash.com/photo-1552767059-ce182ead8c1b?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00046",
    "code": "PL00046",
    "name": "Royal",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 13,
    "description": "Acompañamiento: Carne casera + Pollo deshilachado + Pollo + Chorizo",
    "badge": "ROYAL",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00047",
    "code": "PL00047",
    "name": "Royal a lo Pobre",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 14,
    "description": "Acompañamiento: Papa crocante + Carne artesanal + Huevo + Jamón + Queso + Plátano + Ensalada fresca",
    "badge": "ESPECIAL",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00048",
    "code": "PL00048",
    "name": "Salchibroaster Ala",
    "category": "SALCHIPAPAS Y SALCHIBROASTERS",
    "category_id": "C0010",
    "price": 13,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "BROASTER",
    "popular": false,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00049",
    "code": "PL00049",
    "name": "Salchibroaster Encuentro",
    "category": "SALCHIPAPAS Y SALCHIBROASTERS",
    "category_id": "C0010",
    "price": 16,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "ENCUENTRO",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00050",
    "code": "PL00050",
    "name": "Salchibroaster Pecho",
    "category": "SALCHIPAPAS Y SALCHIBROASTERS",
    "category_id": "C0010",
    "price": 20,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "PECHO",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00051",
    "code": "PL00051",
    "name": "Salchibroaster Pierna",
    "category": "SALCHIPAPAS Y SALCHIBROASTERS",
    "category_id": "C0010",
    "price": 14,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "PIERNA",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00052",
    "code": "PL00052",
    "name": "Salchichorizo",
    "category": "SALCHIPAPAS Y SALCHIBROASTERS",
    "category_id": "C0010",
    "price": 13,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "PARRILLERO",
    "popular": false,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00053",
    "code": "PL00053",
    "name": "Salchipapa a lo Pobre",
    "category": "SALCHIPAPAS Y SALCHIBROASTERS",
    "category_id": "C0010",
    "price": 13,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "A LO POBRE",
    "popular": true,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00054",
    "code": "PL00054",
    "name": "Salchipapa Clásica",
    "category": "SALCHIPAPAS Y SALCHIBROASTERS",
    "category_id": "C0010",
    "price": 10,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "CLÁSICA",
    "popular": true,
    "available": true,
    "stock": 40,
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00055",
    "code": "PL00055",
    "name": "Tacacho con Cecina",
    "category": "PLATOS AMAZÓNICOS",
    "category_id": "C0007",
    "price": 12,
    "description": "Acompañamiento: Maduros fritos + Sarza criolla",
    "badge": "ESTRELLA",
    "popular": true,
    "available": true,
    "stock": 35,
    "image": "/imagenes/categorias/platos-amazonicos/banner.webp",
    "includes_sauces": true
  },
  {
    "id": "PL00056",
    "code": "PL00056",
    "name": "Té",
    "category": "INFUSIONES",
    "category_id": "C0006",
    "price": 2.5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "CALIENTE",
    "popular": false,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00057",
    "code": "PL00057",
    "name": "Tocino",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 2,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 80,
    "image": "https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  }
];

// 4. PROMOCIONES
const initialPromotions: Promotion[] = [
  {
    "id": "PL00041",
    "title": "PROMO BROASTER FAMILIAR",
    "price": 38,
    "originalPrice": 44,
    "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "badge": "FAMILIAR",
    "description": "La selección ideal para compartir en familia. Incluye un Broaster Presa Pecho, un Broaster Presa Pierna y un Broaster Presa Ala, con el sabor crujiente que nos caracteriza, más una Gaseosa Personal Inca Kola.",
    "features": [
      "Papa crocante",
      "Ensalada fresca",
      "Arroz",
      "Gaseosa Personal Inca Kola"
    ]
  },
  {
    "id": "PL00042",
    "title": "PROMO BUCHI DUO",
    "price": 22,
    "originalPrice": 28,
    "image": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80",
    "badge": "DUO",
    "description": "Una experiencia pensada para dos. Disfruta de dos Hamburguesas Tipo Clásica elaboradas con nuestra hamburguesa artesanal premium, acompañadas de dos Gaseosas Personales Pepsi.",
    "features": [
      "Papa crocante",
      "Hamburguesa artesanal",
      "Ensalada fresca",
      "2 Gaseosas Personales Pepsi"
    ]
  },
  {
    "id": "PL00043",
    "title": "PROMO SALCHI BURGER",
    "price": 24,
    "originalPrice": 30,
    "image": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop&q=80",
    "badge": "COMBO",
    "description": "La fusión de nuestros dos clásicos más pedidos. Una Hamburguesa Tipo Cheese Burguer y una Salchipapa Tipo Salchipapa Clásica, acompañadas de una Gaseosa Personal Coca Cola.",
    "features": [
      "Queso cheddar",
      "Papa crocante",
      "Ensalada fresca",
      "Gaseosa Personal Coca Cola"
    ]
  },
  {
    "id": "PL00044",
    "title": "PROMO SELVA POWER",
    "price": 29,
    "originalPrice": 35,
    "image": "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80",
    "badge": "SELVA",
    "description": "Un homenaje a la Amazonía. Compuesto por un Plato Amazónico Tipo Tacacho con Cecina y un Salchibroaster Tipo Salchibroaster Pierna Presa Pierna, junto a una Gaseosa Personal Fanta.",
    "features": [
      "Maduros fritos",
      "Sarza criolla",
      "Papa crocante",
      "Ensalada fresca",
      "Gaseosa Personal Fanta"
    ]
  }
];

let promotionsStore: Promotion[] = [...initialPromotions];

// IN-MEMORY STORES
const categoriesStore = [...initialCategories];
let productsStore = [...initialProducts];
const saucesStore = [...initialSauces];
const ordersStore: Order[] = [];
const claimsStore: Claim[] = [];

// QUERIES
export async function getCategories(): Promise<Category[]> {
  return [...categoriesStore].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
}

export async function updateCategory(id: string, patch: Partial<Pick<Category, 'name' | 'icon' | 'description'>>): Promise<Category | null> {
  const category = categoriesStore.find(c => c.id === id);
  if (!category) return null;
  if (typeof patch.name === 'string' && patch.name.trim()) category.name = patch.name.trim().toUpperCase();
  if (typeof patch.icon === 'string' && patch.icon.trim()) category.icon = patch.icon.trim();
  if (typeof patch.description === 'string') category.description = patch.description.trim();
  return { ...category };
}

const CATEGORY_SLUG_TO_ID: Record<string, string> = {
  'hamburguesas': 'C0001',
  'broaster': 'C0002',
  'salchipapas': 'C0003',
  'salchipapas-y-salchibroasters': 'C0003',
  'alitas': 'C0004',
  'platos-amazonicos': 'C0005',
  'bebidas': 'C0006',
  'refrescos': 'C0007',
  'infusiones': 'C0008',
  'promociones': 'C0009',
  'adicionales': 'C0010',
  'extras': 'C0010'
};

export async function getProducts(categoryId?: string): Promise<Product[]> {
  let list = productsStore;
  if (categoryId) {
    const norm = categoryId.toLowerCase().trim();
    const mapped = CATEGORY_SLUG_TO_ID[norm] || categoryId;
    list = list.filter(p => p.category_id === mapped || p.category_id === categoryId || p.category_id.toLowerCase() === norm);
  }
  return [...list].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
}

export async function getProductById(id: string): Promise<Product | null> {
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
  return promotionsStore[index];
}

export async function deletePromotion(id: string): Promise<boolean> {
  const initialLength = promotionsStore.length;
  promotionsStore = promotionsStore.filter(item => item.id !== id);
  return promotionsStore.length < initialLength;
}

export async function reorderPromotions(orderedIds: string[]): Promise<Promotion[]> {
  orderedIds.forEach((id, index) => {
    const p = promotionsStore.find(item => item.id === id);
    if (p) p.order = index + 1;
  });
  return promotionsStore.sort((a, b) => (a.order || 0) - (b.order || 0));
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

export async function deleteOrder(id: string): Promise<boolean> {
  const rawId = id.replace(/^tk-/, '');
  const filtered = ordersStore.filter(o => o.id !== id && o.id !== rawId && String(o.orderNumber) !== id && String(o.orderNumber) !== rawId);
  ordersStore.length = 0;
  ordersStore.push(...filtered);
  customTicketsStore = customTicketsStore.filter(t => t.id !== id && t.id !== `tk-${id}` && t.orderId !== id && String(t.orderNumber) !== id);
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

    const rawNum = typeof o.orderNumber === 'number' ? o.orderNumber : parseInt(String(o.orderNumber).replace(/\D/g, ''), 10) || (orders.length - idx);
    const formattedNum = String(rawNum).padStart(5, '0');

    return {
      id: `tk-${o.id}`,
      ticketNumber: `TK-${formattedNum}`,
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
  const seq = String(nextNumber).padStart(5, '0');

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
// GESTIÓN DE PORTADAS / HERO CAROUSEL BANNERS (FORMATO PT0001)
// ============================================================================
export interface PortadaBanner {
  id: string;
  title: string;
  image: string;
  imageMobile: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

const initialPortadas: PortadaBanner[] = [
  {
    id: 'PT0001',
    title: 'Portada 1',
    image: '/imagenes/portada/Portada1E.webp',
    imageMobile: '/imagenes/portada/Portada1M.webp',
    active: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PT0002',
    title: 'Portada 2',
    image: '/imagenes/portada/Portada2E.webp',
    imageMobile: '/imagenes/portada/Portada2M.webp',
    active: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PT0003',
    title: 'Portada 3',
    image: '/imagenes/portada/Portada3E.webp',
    imageMobile: '/imagenes/portada/Portada3M.webp',
    active: true,
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PT0004',
    title: 'Portada 4',
    image: '/imagenes/portada/Portada4E.webp',
    imageMobile: '/imagenes/portada/Portada4M.webp',
    active: true,
    order: 4,
    createdAt: new Date().toISOString()
  }
];

let portadasStore: PortadaBanner[] = [...initialPortadas];

export async function getPortadas(includeInactive = false): Promise<PortadaBanner[]> {
  let list = [...portadasStore];
  if (!includeInactive) {
    list = list.filter(p => p.active !== false);
  }
  return list.sort((a, b) => a.order - b.order);
}

export async function getPortadaById(id: string): Promise<PortadaBanner | null> {
  const p = portadasStore.find(item => item.id === id);
  return p || null;
}

export function generateNextPortadaId(): string {
  const existingNums = portadasStore
    .map(p => {
      const match = p.id.match(/^PT(\d+)$/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
  const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
  const nextNum = maxNum + 1;
  return `PT${String(nextNum).padStart(4, '0')}`;
}

export function savePortadaImageBase64(base64Str: string, id: string, type: 'E' | 'M'): string {
  if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image')) {
    return base64Str;
  }
  try {
    const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const targetDir = path.join(process.cwd(), 'public', 'imagenes', 'portada');
    const distDir = path.join(process.cwd(), 'dist', 'imagenes', 'portada');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

    const cleanId = id.replace(/[^a-zA-Z0-9]/g, '');
    const fileName = `Portada_${cleanId}_${type}.webp`;
    const filePath = path.join(targetDir, fileName);
    fs.writeFileSync(filePath, buffer);

    try {
      fs.copyFileSync(filePath, path.join(distDir, fileName));
    } catch (e) {}

    return `/imagenes/portada/${fileName}`;
  } catch (e) {
    console.error('Error saving portada image:', e);
    return base64Str;
  }
}

export async function createPortada(data: Partial<PortadaBanner>): Promise<PortadaBanner> {
  const newId = data.id && data.id.startsWith('PT') ? data.id : generateNextPortadaId();
  const nextOrder = data.order !== undefined ? data.order : portadasStore.length + 1;

  let finalImage = data.image || `/imagenes/portada/Portada1E.webp`;
  let finalImageMobile = data.imageMobile || data.image || `/imagenes/portada/Portada1M.webp`;

  if (finalImage && finalImage.startsWith('data:image')) {
    finalImage = savePortadaImageBase64(finalImage, newId, 'E');
  }
  if (finalImageMobile && finalImageMobile.startsWith('data:image')) {
    finalImageMobile = savePortadaImageBase64(finalImageMobile, newId, 'M');
  }

  const newPortada: PortadaBanner = {
    id: newId,
    title: data.title || `Portada ${nextOrder}`,
    image: finalImage,
    imageMobile: finalImageMobile,
    active: data.active !== undefined ? Boolean(data.active) : true,
    order: nextOrder,
    createdAt: new Date().toISOString()
  };

  portadasStore.push(newPortada);
  return newPortada;
}

export async function updatePortada(id: string, data: Partial<PortadaBanner>): Promise<PortadaBanner | null> {
  const index = portadasStore.findIndex(item => item.id === id);
  if (index === -1) return null;

  const current = portadasStore[index];
  let finalImage = data.image !== undefined ? data.image : current.image;
  let finalImageMobile = data.imageMobile !== undefined ? data.imageMobile : current.imageMobile;

  if (finalImage && finalImage.startsWith('data:image')) {
    finalImage = savePortadaImageBase64(finalImage, id, 'E');
  }
  if (finalImageMobile && finalImageMobile.startsWith('data:image')) {
    finalImageMobile = savePortadaImageBase64(finalImageMobile, id, 'M');
  }

  portadasStore[index] = {
    ...current,
    ...data,
    image: finalImage,
    imageMobile: finalImageMobile,
    active: data.active !== undefined ? Boolean(data.active) : current.active,
    order: data.order !== undefined ? Number(data.order) : current.order,
    updatedAt: new Date().toISOString(),
    id // preserve id
  };
  return portadasStore[index];
}

export async function deletePortada(id: string): Promise<boolean> {
  const initialLength = portadasStore.length;
  portadasStore = portadasStore.filter(item => item.id !== id);
  portadasStore.forEach((p, idx) => {
    p.order = idx + 1;
  });
  return portadasStore.length < initialLength;
}

export async function reorderPortadas(orderedIds: string[]): Promise<PortadaBanner[]> {
  orderedIds.forEach((id, index) => {
    const p = portadasStore.find(item => item.id === id);
    if (p) p.order = index + 1;
  });
  return portadasStore.sort((a, b) => a.order - b.order);
}


