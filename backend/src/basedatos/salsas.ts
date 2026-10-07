import { Salsa } from './tipos';

// 2. SALSAS DE LA CASA
export const salsasIniciales: Salsa[] = [
  { id: 1, nombre: 'Ají de Pollería Clásico', es_firma: true },
  { id: 2, nombre: 'Tártara Criolla', es_firma: true },
  { id: 3, nombre: 'Mayonesa de la Casa', es_firma: false },
  { id: 4, nombre: 'Crema de Rocoto Macho', es_firma: true },
  { id: 5, nombre: 'Salsa Acevichada', es_firma: true },
  { id: 6, nombre: 'Chimichurri Selvático', es_firma: true }
];

export async function obtenerSalsas(): Promise<Salsa[]> {
  return salsasIniciales;
}
