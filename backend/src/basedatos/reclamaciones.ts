import { Reclamacion } from './tipos';

export const almacenReclamaciones: Reclamacion[] = [];

export async function obtenerReclamaciones(): Promise<Reclamacion[]> {
  return almacenReclamaciones;
}

export async function crearReclamacion(datos: any): Promise<Reclamacion> {
  const nuevaReclamacion: Reclamacion = {
    id: almacenReclamaciones.length + 1,
    codigoReclamo: datos.codigoReclamo || `REC-${Date.now()}`,
    nombreCompleto: datos.nombreCompleto,
    tipoDoc: datos.tipoDoc || 'DNI',
    numeroDoc: datos.numeroDoc || '',
    telefono: datos.telefono,
    email: datos.email,
    direccion: datos.direccion || '',
    departamento: datos.departamento || 'Lima',
    provincia: datos.provincia || 'Lima',
    distrito: datos.distrito || 'Ate',
    sucursal: datos.sucursal || 'BuchiSapa - Sede Central (Santa Clara, Ate)',
    numeroPedido: datos.numeroPedido || '',
    fechaPedido: datos.fechaPedido || '',
    esMenor: Boolean(datos.esMenor),
    nombreTutor: datos.nombreTutor || '',
    docTutor: datos.docTutor || '',
    tipoReclamo: (datos.tipoReclamo || 'reclamo').toLowerCase().includes('queja') ? 'queja' : 'reclamo',
    bienContratado: datos.bienContratado || 'producto',
    montoReclamado: datos.montoReclamado ? Number(datos.montoReclamado) : undefined,
    descripcionProducto: datos.descripcionProducto || 'Consumo en restaurante / Pedido delivery',
    detalle: datos.detalle,
    pedidoConsumidor: datos.pedidoConsumidor || '',
    nombreAdjunto: datos.nombreAdjunto || '',
    estado: 'pendiente',
    fechaCreacion: new Date().toISOString()
  };

  almacenReclamaciones.unshift(nuevaReclamacion);
  return nuevaReclamacion;
}
