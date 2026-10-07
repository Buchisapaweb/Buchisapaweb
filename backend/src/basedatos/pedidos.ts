import { Pedido } from './tipos';

export const almacenPedidos: Pedido[] = [];

export async function obtenerPedidos(estado?: string, email?: string): Promise<Pedido[]> {
  let lista = [...almacenPedidos];
  if (estado) {
    lista = lista.filter(o => o.estado.toLowerCase() === estado.toLowerCase());
  }
  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    lista = lista.filter(o => (o.emailCliente || '').toLowerCase().trim() === cleanEmail);
  }
  return lista.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
}

export async function obtenerPedidoPorId(id: string): Promise<Pedido | null> {
  return almacenPedidos.find(o => o.id === id || String(o.numeroPedido) === id) || null;
}

export async function crearPedido(datos: any): Promise<Pedido> {
  const nuevoPedido: Pedido = {
    id: datos.id || `ORD-${Date.now()}`,
    numeroPedido: datos.numeroPedido || Math.floor(100 + Math.random() * 900),
    nombreCliente: datos.nombreCliente,
    telefonoCliente: datos.telefonoCliente,
    emailCliente: datos.emailCliente,
    tipoPedido: datos.tipoPedido || 'delivery',
    direccionEntrega: datos.direccionEntrega,
    referenciaEntrega: datos.referenciaEntrega,
    numeroMesa: datos.numeroMesa,
    metodoPago: datos.metodoPago || 'Yape',
    notas: datos.notas,
    estado: datos.estado || 'recibido',
    total: Number(datos.total) || 0,
    items: typeof datos.items === 'string' ? datos.items : JSON.stringify(datos.items),
    idUsuario: datos.idUsuario,
    fechaCreacion: new Date().toISOString()
  };

  almacenPedidos.unshift(nuevoPedido);
  return nuevoPedido;
}

export async function actualizarEstadoPedido(id: string, estado: string): Promise<Pedido | null> {
  const pedido = almacenPedidos.find(o => o.id === id || String(o.numeroPedido) === id);
  if (!pedido) return null;
  pedido.estado = estado;
  return pedido;
}

export async function eliminarPedido(id: string): Promise<boolean> {
  const indice = almacenPedidos.findIndex(o => o.id === id || String(o.numeroPedido) === id);
  if (indice === -1) return false;
  almacenPedidos.splice(indice, 1);
  return true;
}
