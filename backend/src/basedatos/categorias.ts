import fs from 'fs';
import path from 'path';
import { Categoria } from './tipos';

// 1. CATEGORÍAS OFICIALES BUCHISAPA
const categoriasIniciales: Categoria[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'backend/src/basedatos/categorias.json'), 'utf8')
);

export const almacenCategorias: Categoria[] = [...categoriasIniciales];

export async function obtenerCategorias(): Promise<Categoria[]> {
  return [...almacenCategorias].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
}

function persistirCategoriasEnDisco() {
  try {
    const ruta = path.join(process.cwd(), 'backend/src/basedatos/categorias.json');
    fs.writeFileSync(ruta, JSON.stringify(almacenCategorias, null, 2), 'utf8');
  } catch (err) {
    console.error('Error guardando categorias en disco:', err);
  }
}

export async function crearCategoria(datos: Partial<Categoria>): Promise<Categoria> {
  const nuevoId = datos.id || `C00${String(almacenCategorias.length + 1).padStart(2, '0')}`;
  const nuevaCat: Categoria = {
    id: nuevoId,
    codigo: datos.codigo || nuevoId,
    nombre: (datos.nombre || 'NUEVA CATEGORÍA').toUpperCase().trim(),
    icono: datos.icono || 'Flame',
    descripcion: datos.descripcion || '',
    banner: datos.banner || '/imagenes/categorias/platos-amazonicos/banner.webp',
    orden: datos.orden || almacenCategorias.length + 1,
    slug: datos.slug || (datos.nombre || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  };
  almacenCategorias.push(nuevaCat);
  persistirCategoriasEnDisco();
  return { ...nuevaCat };
}

export async function actualizarCategoria(id: string, datos: Partial<Categoria>): Promise<Categoria | null> {
  const categoria = almacenCategorias.find(c => c.id === id || (c.codigo && c.codigo.toLowerCase() === id.toLowerCase()));
  if (!categoria) return null;
  if (typeof datos.nombre === 'string' && datos.nombre.trim()) categoria.nombre = datos.nombre.trim().toUpperCase();
  if (typeof datos.icono === 'string' && datos.icono.trim()) categoria.icono = datos.icono.trim();
  if (typeof datos.descripcion === 'string') categoria.descripcion = datos.descripcion.trim();
  if (typeof datos.banner === 'string' && datos.banner.trim()) categoria.banner = datos.banner.trim();
  if (typeof datos.codigo === 'string' && datos.codigo.trim()) categoria.codigo = datos.codigo.trim();
  if (typeof datos.slug === 'string' && datos.slug.trim()) categoria.slug = datos.slug.trim().toLowerCase();
  persistirCategoriasEnDisco();
  return { ...categoria };
}

export async function eliminarCategoria(id: string): Promise<boolean> {
  const indice = almacenCategorias.findIndex(c => c.id === id || (c.codigo && c.codigo.toLowerCase() === id.toLowerCase()));
  if (indice === -1) return false;
  almacenCategorias.splice(indice, 1);
  persistirCategoriasEnDisco();
  return true;
}
