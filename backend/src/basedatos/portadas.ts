import fs from 'fs';
import path from 'path';
import { BannerPortada } from './tipos';

// PORTADAS
let almacenPortadas: BannerPortada[] = [
  { id: 'PT0001', titulo: 'Portada 1', imagen: '/imagenes/portada/Portada1E.webp', imagenMovil: '/imagenes/portada/Portada1M.webp', activo: true, orden: 1, fechaCreacion: new Date().toISOString() },
  { id: 'PT0002', titulo: 'Portada 2', imagen: '/imagenes/portada/Portada2E.webp', imagenMovil: '/imagenes/portada/Portada2M.webp', activo: true, orden: 2, fechaCreacion: new Date().toISOString() },
  { id: 'PT0003', titulo: 'Portada 3', imagen: '/imagenes/portada/Portada3E.webp', imagenMovil: '/imagenes/portada/Portada3M.webp', activo: true, orden: 3, fechaCreacion: new Date().toISOString() },
  { id: 'PT0004', titulo: 'Portada 4', imagen: '/imagenes/portada/Portada4E.webp', imagenMovil: '/imagenes/portada/Portada4M.webp', activo: true, orden: 4, fechaCreacion: new Date().toISOString() }
];

export async function obtenerPortadas(incluirInactivos = false): Promise<BannerPortada[]> {
  let lista = [...almacenPortadas];
  if (!incluirInactivos) lista = lista.filter(p => p.activo !== false);
  return lista.sort((a, b) => a.orden - b.orden);
}

export async function crearPortada(datos: Partial<BannerPortada>): Promise<BannerPortada> {
  const proximoOrden = almacenPortadas.length + 1;
  const nuevaPortada: BannerPortada = {
    id: datos.id || `PT${String(proximoOrden).padStart(4, '0')}`,
    titulo: datos.titulo || `Portada ${proximoOrden}`,
    imagen: datos.imagen || '/imagenes/portada/Portada1E.webp',
    imagenMovil: datos.imagenMovil || datos.imagen || '/imagenes/portada/Portada1M.webp',
    activo: datos.activo !== false,
    orden: proximoOrden,
    fechaCreacion: new Date().toISOString()
  };
  almacenPortadas.push(nuevaPortada);
  return nuevaPortada;
}

export async function actualizarPortada(id: string, datos: Partial<BannerPortada>): Promise<BannerPortada | null> {
  const indice = almacenPortadas.findIndex(p => p.id === id);
  if (indice === -1) return null;
  almacenPortadas[indice] = { ...almacenPortadas[indice], ...datos, fechaActualizacion: new Date().toISOString() };
  return almacenPortadas[indice];
}

export async function eliminarPortada(id: string): Promise<boolean> {
  const inicial = almacenPortadas.length;
  almacenPortadas = almacenPortadas.filter(p => p.id !== id);
  almacenPortadas.forEach((p, idx) => p.orden = idx + 1);
  return almacenPortadas.length < inicial;
}

export async function reordenarPortadas(idsOrdenados: string[]): Promise<BannerPortada[]> {
  idsOrdenados.forEach((id, index) => {
    const p = almacenPortadas.find(item => item.id === id);
    if (p) p.orden = index + 1;
  });
  return almacenPortadas.sort((a, b) => a.orden - b.orden);
}

export function guardarImagenPortadaBase64(base64: string, id: string, tipo: 'E' | 'M'): string {
  if (!base64 || !base64.startsWith('data:image')) return base64;
  try {
    const datosBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(datosBase64, 'base64');
    const rutaDestino = path.join(process.cwd(), 'public', 'imagenes', 'portada');
    if (!fs.existsSync(rutaDestino)) fs.mkdirSync(rutaDestino, { recursive: true });

    const nombreArchivo = `Portada_${id.replace(/[^a-zA-Z0-9]/g, '')}_${tipo}.webp`;
    fs.writeFileSync(path.join(rutaDestino, nombreArchivo), buffer);
    return `/imagenes/portada/${nombreArchivo}`;
  } catch (e) {
    return base64;
  }
}
