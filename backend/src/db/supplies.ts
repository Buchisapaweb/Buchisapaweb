import { Supply, Utensil } from './types';

export const suppliesStore: Supply[] = [
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

export const utensilsStore: Utensil[] = [
  { id: 'ut-1', name: 'Freidora Industrial Doble Canastilla', area: 'Broaster', quantity: 2, condition: 'Excelente', lastInspection: '2026-09-20' },
  { id: 'ut-2', name: 'Plancha Hamburguesera de Cromo Duro', area: 'Parrilla', quantity: 1, condition: 'Operativo', lastInspection: '2026-09-21' },
  { id: 'ut-3', name: 'Cortadora Profesional de Papas Bastón', area: 'Preparación', quantity: 2, condition: 'Excelente', lastInspection: '2026-09-18' },
  { id: 'ut-4', name: 'Campana Extractora de Alto Caudal', area: 'Extracción', quantity: 1, condition: 'Operativo', lastInspection: '2026-09-15' },
  { id: 'ut-5', name: 'Espátulas Grill y Pinzas Térmicas', area: 'Parrilla', quantity: 8, condition: 'Excelente', lastInspection: '2026-09-23' },
  { id: 'ut-6', name: 'Termómetro Digital de Sonda', area: 'Control Calidad', quantity: 3, condition: 'Excelente', lastInspection: '2026-09-24' }
];
