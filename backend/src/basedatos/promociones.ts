// PROMOCIONES STUBS
export async function obtenerPromociones(): Promise<any[]> { return []; }
export async function crearPromocion(datos: any): Promise<any> { return { id: 'prom-1', ...datos }; }
export async function actualizarPromocion(id: string, datos: any): Promise<any> { return { id, ...datos }; }
export async function eliminarPromocion(id: string): Promise<boolean> { return true; }
export async function reordenarPromociones(ids: string[]): Promise<any[]> { return []; }
