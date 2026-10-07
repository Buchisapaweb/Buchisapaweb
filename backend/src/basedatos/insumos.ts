import { Insumo, Utensilio } from './tipos';

const insumosIniciales: Insumo[] = [
  { id: 'ins-1', nombre: 'Carne Molida Premium (Res)', categoria: 'Carnes', stock: 45, unidad: 'kg', stockMinimo: 20, estado: 'ok', ultimoAbastecimiento: '2026-09-24' },
  { id: 'ins-2', nombre: 'Pollo Fresco para Broaster', categoria: 'Carnes', stock: 85, unidad: 'kg', stockMinimo: 30, estado: 'ok', ultimoAbastecimiento: '2026-09-24' },
  { id: 'ins-3', nombre: 'Pan Brioche Artesanal', categoria: 'Panadería', stock: 120, unidad: 'und', stockMinimo: 50, estado: 'ok', ultimoAbastecimiento: '2026-09-24' },
  { id: 'ins-4', nombre: 'Papa Amarilla Seleccionada', categoria: 'Verduras', stock: 150, unidad: 'kg', stockMinimo: 40, estado: 'ok', ultimoAbastecimiento: '2026-09-23' },
  { id: 'ins-5', nombre: 'Salchicha Frankfurt Ahumada', categoria: 'Embutidos', stock: 35, unidad: 'kg', stockMinimo: 15, estado: 'ok', ultimoAbastecimiento: '2026-09-24' },
  { id: 'ins-6', nombre: 'Queso Cheddar en Láminas', categoria: 'Lácteos', stock: 22, unidad: 'paq', stockMinimo: 10, estado: 'ok', ultimoAbastecimiento: '2026-09-23' },
  { id: 'ins-7', nombre: 'Aceite Vegetal para Freidoras', categoria: 'Abarrotes', stock: 60, unidad: 'L', stockMinimo: 25, estado: 'ok', ultimoAbastecimiento: '2026-09-22' },
  { id: 'ins-8', nombre: 'Maíz Morado de la Sierra', categoria: 'Abarrotes', stock: 28, unidad: 'kg', stockMinimo: 15, estado: 'ok', ultimoAbastecimiento: '2026-09-21' },
  { id: 'ins-9', nombre: 'Empaques Biodegradables Delivery', categoria: 'Empaques', stock: 350, unidad: 'und', stockMinimo: 100, estado: 'ok', ultimoAbastecimiento: '2026-09-20' },
  { id: 'ins-10', nombre: 'Potes de Crema 2oz', categoria: 'Empaques', stock: 500, unidad: 'und', stockMinimo: 150, estado: 'ok', ultimoAbastecimiento: '2026-09-20' }
];

let almacenInsumos: Insumo[] = [...insumosIniciales];

export async function obtenerInsumos(): Promise<Insumo[]> {
  return almacenInsumos;
}

export async function actualizarStockInsumo(id: string, nuevoStock: number): Promise<Insumo | null> {
  const item = almacenInsumos.find(s => s.id === id);
  if (!item) return null;
  item.stock = nuevoStock;
  item.estado = item.stock <= item.stockMinimo * 0.5 ? 'critico' : item.stock <= item.stockMinimo ? 'bajo' : 'ok';
  item.ultimoAbastecimiento = new Date().toISOString().split('T')[0];
  return item;
}

const utensiliosIniciales: Utensilio[] = [
  { id: 'ut-1', nombre: 'Freidora Industrial Doble Canastilla', area: 'Broaster', cantidad: 2, condicion: 'Excelente', ultimaInspeccion: '2026-09-20' },
  { id: 'ut-2', nombre: 'Plancha Hamburguesera de Cromo Duro', area: 'Parrilla', cantidad: 1, condicion: 'Operativo', ultimaInspeccion: '2026-09-21' },
  { id: 'ut-3', nombre: 'Cortadora Profesional de Papas Bastón', area: 'Preparación', cantidad: 2, condicion: 'Excelente', ultimaInspeccion: '2026-09-18' },
  { id: 'ut-4', nombre: 'Campana Extractora de Alto Caudal', area: 'Extracción', cantidad: 1, condicion: 'Operativo', ultimaInspeccion: '2026-09-15' },
  { id: 'ut-5', nombre: 'Espátulas Grill y Pinzas Térmicas', area: 'Parrilla', cantidad: 8, condicion: 'Excelente', ultimaInspeccion: '2026-09-23' },
  { id: 'ut-6', nombre: 'Termómetro Digital de Sonda', area: 'Control Calidad', cantidad: 3, condicion: 'Excelente', ultimaInspeccion: '2026-09-24' }
];

export async function obtenerUtensilios(): Promise<Utensilio[]> {
  return utensiliosIniciales;
}
