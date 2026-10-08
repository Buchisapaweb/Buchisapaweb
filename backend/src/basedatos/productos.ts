import fs from 'fs';
import path from 'path';
import { Producto } from './tipos';

// 3. PRODUCTOS OFICIALES DE BUCHISAPA
const productosIniciales: Producto[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'backend/src/basedatos/productos.json'), 'utf8')
);

export let almacenProductos = [...productosIniciales];

const MAPEADO_SLUG_A_ID: Record<string, string> = {
  'adicionales': 'C0001',
  'extras': 'C0001',
  'alitas': 'C0002',
  'bebidas': 'C0003',
  'broaster': 'C0004',
  'hamburguesas': 'C0005',
  'infusiones': 'C0006',
  'platos-amazonicos': 'C0007',
  'promociones': 'C0008',
  'refrescos': 'C0009',
  'salchipapas-y-salchibroasters': 'C0010',
  'salchipapas': 'C0010'
};

export async function obtenerProductos(idCategoria?: string): Promise<Producto[]> {
  let lista = almacenProductos;
  if (idCategoria) {
    const norm = idCategoria.toLowerCase().trim();
    const mapeado = MAPEADO_SLUG_A_ID[norm] || idCategoria;
    lista = lista.filter(p => p.id_categoria === mapeado || p.id_categoria === idCategoria || p.id_categoria.toLowerCase() === norm);
  }
  return [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
}

export async function obtenerProductoPorId(id: string): Promise<Producto | null> {
  return almacenProductos.find(p => p.id === id) || null;
}

export async function verificarStockCarrito(itemsAChequear: { id: string; cantidad: number; nombre?: string }[]) {
  const itemsAgotados: any[] = [];
  const estadoItems: any[] = [];

  for (const item of itemsAChequear) {
    const producto = almacenProductos.find(p => p.id === item.id);
    if (!producto) {
      estadoItems.push({ id: item.id, disponible: true, stock: 10 });
      continue;
    }

    const estaDisponible = producto.disponible && producto.stock >= item.cantidad;
    estadoItems.push({
      id: producto.id,
      nombre: producto.nombre,
      disponible: estaDisponible,
      stock: producto.stock,
      solicitado: item.cantidad
    });

    if (!estaDisponible) {
      itemsAgotados.push({
        id: producto.id,
        nombre: producto.nombre,
        disponible: producto.disponible,
        stock: producto.stock,
        solicitado: item.cantidad
      });
    }
  }

  const valido = itemsAgotados.length === 0;
  return {
    valido,
    mensaje: valido ? 'Stock disponible' : 'Algunos productos no tienen stock suficiente',
    itemsAgotados,
    estadoItems
  };
}

function persistirProductosEnDisco() {
  try {
    const ruta = path.join(process.cwd(), 'backend/src/basedatos/productos.json');
    fs.writeFileSync(ruta, JSON.stringify(almacenProductos, null, 2), 'utf8');
  } catch (err) {
    console.error('Error guardando productos en disco:', err);
  }
}

export async function reducirStockCarrito(itemsAChequear: { id: string; cantidad: number; nombre?: string }[]) {
  for (const item of itemsAChequear) {
    const producto = almacenProductos.find(p => p.id === item.id);
    if (producto) {
      producto.stock = Math.max(0, producto.stock - (item.cantidad || 1));
      if (producto.stock === 0) {
        producto.disponible = false;
      }
    }
  }
  persistirProductosEnDisco();
}

export async function actualizarStockProducto(id: string, disponible: boolean, stock?: number): Promise<Producto | null> {
  const producto = almacenProductos.find(p => p.id === id);
  if (!producto) return null;
  producto.disponible = disponible;
  if (typeof stock === 'number') {
    producto.stock = stock;
    if (producto.stock === 0) {
      producto.disponible = false;
    }
  }
  persistirProductosEnDisco();
  return producto;
}

export async function crearProducto(datos: Partial<Producto>): Promise<Producto> {
  const nuevoId = datos.id || `PL${String(almacenProductos.length + 1).padStart(5, '0')}`;
  const nuevoProducto: Producto = {
    id: nuevoId,
    nombre: datos.nombre || 'Nuevo Producto',
    categoria: datos.categoria || 'HAMBURGUESAS',
    id_categoria: datos.id_categoria || 'C0005',
    precio: Number(datos.precio) || 10,
    descripcion: datos.descripcion || '',
    etiqueta: datos.etiqueta || null,
    popular: Boolean(datos.popular),
    disponible: datos.disponible !== false,
    stock: typeof datos.stock === 'number' ? datos.stock : 25,
    imagen: datos.imagen || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    incluye_salsas: Boolean(datos.incluye_salsas),
    tiene_acompanamiento: Boolean(datos.tiene_acompanamiento),
    tiene_notas: Boolean(datos.tiene_notas)
  };
  almacenProductos.unshift(nuevoProducto);
  persistirProductosEnDisco();
  return nuevoProducto;
}

export async function actualizarProducto(id: string, datos: Partial<Producto>): Promise<Producto | null> {
  const indice = almacenProductos.findIndex(p => p.id === id);
  if (indice === -1) return null;
  
  almacenProductos[indice] = {
    ...almacenProductos[indice],
    ...datos,
    precio: datos.precio !== undefined ? Number(datos.precio) : almacenProductos[indice].precio,
    stock: datos.stock !== undefined ? Number(datos.stock) : almacenProductos[indice].stock,
    disponible: datos.disponible !== undefined ? Boolean(datos.disponible) : almacenProductos[indice].disponible
  };
  persistirProductosEnDisco();
  return almacenProductos[indice];
}

export async function eliminarProducto(id: string): Promise<boolean> {
  const longInicial = almacenProductos.length;
  almacenProductos = almacenProductos.filter(p => p.id !== id);
  const seElimino = almacenProductos.length < longInicial;
  if (seElimino) {
    persistirProductosEnDisco();
  }
  return seElimino;
}
