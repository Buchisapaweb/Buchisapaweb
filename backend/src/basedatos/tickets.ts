import { RegistroTicket } from './tipos';
import { obtenerPedidos, almacenPedidos } from './pedidos';

export let almacenTickets: RegistroTicket[] = [];

export async function obtenerTickets(): Promise<RegistroTicket[]> {
  const pedidos = await obtenerPedidos();
  
  const ticketsPedidos: RegistroTicket[] = pedidos.map((o) => {
    let itemsCrudos: any[] = [];
    if (Array.isArray(o.items)) itemsCrudos = o.items;
    else if (typeof o.items === 'string') {
      try { itemsCrudos = JSON.parse(o.items); } catch (e) { itemsCrudos = []; }
    }

    const items = itemsCrudos.map(it => ({
      nombre: it.nombre || it.name || 'Plato BuchiSapa',
      cantidad: Number(it.cantidad || it.quantity || 1),
      precio: Number(it.precio || it.price || 0),
      notas: it.notas || it.notes || ''
    }));

    return {
      id: `tk-${o.id}`,
      numeroTicket: `TK-${String(o.numeroPedido).padStart(5, '0')}`,
      numeroPedido: o.numeroPedido,
      idPedido: o.id,
      nombreCliente: o.nombreCliente || 'Cliente Mostrador',
      telefonoCliente: o.telefonoCliente || '',
      tipoPedido: o.tipoPedido || 'delivery',
      metodoPago: o.metodoPago || 'Efectivo',
      items,
      subtotal: Number(o.subtotal || o.total || 0),
      costoEnvio: Number(o.costoEnvio || 0),
      descuento: 0,
      total: Number(o.total || 0),
      estado: o.estado === 'cancelado' ? 'anulado' : 'pagado',
      fechaCreacion: o.fechaCreacion || new Date().toISOString()
    };
  });

  return [...almacenTickets, ...ticketsPedidos].sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
}

export async function crearTicketRapido(datos: Partial<RegistroTicket>): Promise<RegistroTicket> {
  const ahora = new Date();
  const nuevoTicket: RegistroTicket = {
    id: `tk-quick-${Date.now()}`,
    numeroTicket: `TK-${String(almacenTickets.length + 1).padStart(5, '0')}`,
    numeroPedido: almacenTickets.length + 1,
    nombreCliente: datos.nombreCliente || 'Cliente Mostrador',
    telefonoCliente: datos.telefonoCliente || '',
    tipoPedido: datos.tipoPedido || 'salon',
    metodoPago: datos.metodoPago || 'Efectivo',
    items: datos.items || [{ nombre: 'BuchiSapa Clásica Burger', cantidad: 1, precio: 16.00 }],
    subtotal: Number(datos.subtotal || datos.total || 16.00),
    costoEnvio: Number(datos.costoEnvio || 0),
    descuento: Number(datos.descuento || 0),
    total: Number(datos.total || 16.00),
    estado: datos.estado || 'pagado',
    fechaCreacion: ahora.toISOString()
  };

  almacenTickets.unshift(nuevoTicket);
  return nuevoTicket;
}

export async function eliminarTicket(id: string): Promise<boolean> {
  const idLimpio = id.replace(/^tk-/, '');
  almacenTickets = almacenTickets.filter(t => t.id !== id && t.id !== `tk-${id}` && t.idPedido !== id);
  
  // Also clean up from orders store if linked
  const filtrados = almacenPedidos.filter(o => o.id !== id && o.id !== idLimpio && String(o.numeroPedido) !== id);
  almacenPedidos.length = 0;
  almacenPedidos.push(...filtrados);
  
  return true;
}

export async function limpiarTodosLosTickets(): Promise<boolean> {
  almacenTickets = [];
  almacenPedidos.length = 0;
  return true;
}
