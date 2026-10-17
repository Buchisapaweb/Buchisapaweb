import categoriesData from '../../datos/categorias.json';
import productsData from '../../datos/productos.json';
import creamsData from '../../datos/cremas.json';
import accompanimentsData from '../../datos/acompanamientos.json';
import { Category, Product, Cream, Accompaniment, CoverBanner, SupplyItem, UtensilItem } from '../types';

export const INITIAL_CATEGORIES: Category[] = categoriesData.map((c, idx) => ({
  ...c,
  order: idx + 1,
  active: true,
}));

export const INITIAL_PRODUCTS: Product[] = productsData.map((p) => ({
  ...p,
  stock: 20,
  available: true,
}));

export const INITIAL_CREAMS: Cream[] = creamsData;

export const INITIAL_ACCOMPANIMENTS: Accompaniment[] = accompanimentsData;

export const INITIAL_COVERS: CoverBanner[] = [
  {
    id: 'portada-1',
    title: '¡El Auténtico Sabor Amazónico & Pollo a la Brasa!',
    subtitle: 'Crujiente, jugoso y preparado con el toque inconfundible de la selva en Santa Clara, Ate.',
    desktopImage: '/imagenes/portada/Portada1E.webp',
    mobileImage: '/imagenes/portada/Portada1M.webp',
    linkText: 'Pedir Ahora',
    linkAction: '#carta',
    active: true,
    order: 1,
  },
  {
    id: 'portada-2',
    title: 'Hamburguesas & Broasters Buchisapa',
    subtitle: 'Hechas con carne 100% artesanal, papas nativas crocantes y nuestras cremas caseras.',
    desktopImage: '/imagenes/portada/Portada2E.webp',
    mobileImage: '/imagenes/portada/Portada2M.webp',
    linkText: 'Ver Promos',
    linkAction: '#carta',
    active: true,
    order: 2,
  },
  {
    id: 'portada-3',
    title: 'Combos & Alitas para Compartir',
    subtitle: 'Bañadas en salsa BBQ, Acevichada, Maracuyá o Ají Charapita. ¡Pide en línea y recibe en minutos!',
    desktopImage: '/imagenes/portada/Portada3E.webp',
    mobileImage: '/imagenes/portada/Portada3M.webp',
    linkText: 'Explorar Menú',
    linkAction: '#carta',
    active: true,
    order: 3,
  },
  {
    id: 'portada-4',
    title: 'Horario Nocturno Imparable',
    subtitle: 'Atendemos de Lunes a Domingo de 6:00 PM a 5:00 AM. Delivery a Huaycán, Santa Clara y Ate.',
    desktopImage: '/imagenes/portada/Portada4E.webp',
    mobileImage: '/imagenes/portada/Portada4M.webp',
    linkText: 'Hacer Pedido',
    linkAction: '#carta',
    active: true,
    order: 4,
  },
];

export const INITIAL_SUPPLIES: SupplyItem[] = [
  { id: 'ins-1', nombre: 'Pollo Fresco Entero', unidad: 'Unidades', stockActual: 38, stockMinimo: 15, estado: 'ok' },
  { id: 'ins-2', nombre: 'Papas Amarillas / Huamantanga', unidad: 'Kg', stockActual: 75, stockMinimo: 25, estado: 'ok' },
  { id: 'ins-3', nombre: 'Carne de Res Artesanal', unidad: 'Kg', stockActual: 22, stockMinimo: 10, estado: 'ok' },
  { id: 'ins-4', nombre: 'Aceite Vegetal de Alto Rendimiento', unidad: 'Litros', stockActual: 14, stockMinimo: 20, estado: 'bajo' },
  { id: 'ins-5', nombre: 'Ají Charapita Fresco', unidad: 'Kg', stockActual: 5.5, stockMinimo: 3, estado: 'ok' },
  { id: 'ins-6', nombre: 'Cecina Ahumada de Tarapoto', unidad: 'Kg', stockActual: 18, stockMinimo: 8, estado: 'ok' },
  { id: 'ins-7', nombre: 'Chorizo Amazónico Regional', unidad: 'Kg', stockActual: 12, stockMinimo: 6, estado: 'ok' },
  { id: 'ins-8', nombre: 'Plátano Bellaco Maduro/Verde', unidad: 'Docenas', stockActual: 20, stockMinimo: 8, estado: 'ok' },
  { id: 'ins-9', nombre: 'Huevos de Granja', unidad: 'Jabas (30u)', stockActual: 8, stockMinimo: 4, estado: 'ok' },
  { id: 'ins-10', nombre: 'Mayonesa Casera Base', unidad: 'Litros', stockActual: 6, stockMinimo: 10, estado: 'bajo' },
];

export const INITIAL_UTENSILS: UtensilItem[] = [
  { id: 'ut-1', nombre: 'Cajas Térmicas Broaster 1 Pieza', unidad: 'Unidades', stockActual: 240, stockMinimo: 100, estado: 'ok' },
  { id: 'ut-2', nombre: 'Cajas Broaster Familiares / Grandes', unidad: 'Unidades', stockActual: 180, stockMinimo: 80, estado: 'ok' },
  { id: 'ut-3', nombre: 'Bolsas Kraft Biodegradables', unidad: 'Unidades', stockActual: 320, stockMinimo: 150, estado: 'ok' },
  { id: 'ut-4', nombre: 'Potes para Cremas (2 oz)', unidad: 'Unidades', stockActual: 450, stockMinimo: 200, estado: 'ok' },
  { id: 'ut-5', nombre: 'Juegos de Cubiertos Descartables', unidad: 'Packs', stockActual: 90, stockMinimo: 100, estado: 'bajo' },
  { id: 'ut-6', nombre: 'Vasos Térmicos 16 oz para Bebidas', unidad: 'Unidades', stockActual: 120, stockMinimo: 60, estado: 'ok' },
  { id: 'ut-7', nombre: 'Papel Manteca Antigrasa', unidad: 'Pliegos', stockActual: 350, stockMinimo: 100, estado: 'ok' },
];

export const STORE_INFO = {
  name: 'BuchiSapa',
  tagline: 'Pollería & Sabor Amazónico',
  address: 'Av. La Estrella con Calle 28 de Julio (Esquina de la posta, a 1 cuadra de Real Plaza Santa Clara), Santa Clara, Ate - Lima, Perú',
  phone: '924 955 869',
  whatsapp: 'https://wa.me/51924955869',
  schedule: 'Lunes a Domingo de 6:00 PM a 5:00 AM (Atención Nocturna & Madrugadas)',
  deliveryFee: 4.0,
  minOrder: 15.0,
  yapeNumber: '924 955 869',
  yapeHolder: 'BuchiSapa Santa Clara SAC',
};
