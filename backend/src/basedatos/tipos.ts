export interface PerfilUsuario {
  id: string;
  uid: string;
  email: string;
  nombre: string;
  primerNombre?: string;
  apellido?: string;
  telefono?: string;
  tipoDoc?: string;
  numeroDoc?: string;
  fechaNacimiento?: string;
  urlAvatar?: string;
  urlFoto?: string;
  rol: 'cliente' | 'admin' | 'personal';
  emailVerificado?: boolean;
  esAdmin?: boolean;
  marketingAceptado?: boolean;
  terminosAceptados?: boolean;
  password?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface Categoria {
  id: string;
  codigo?: string;
  nombre: string;
  icono: string;
  descripcion: string;
  banner?: string;
  imagen?: string;
  orden?: number;
  slug?: string;
}

export interface Producto {
  id: string;
  codigo?: string;
  nombre: string;
  id_categoria: string;
  categoria?: string;
  precio: number;
  precioOriginal?: number;
  precio_original?: number;
  descripcion: string;
  etiqueta?: string | null;
  popular?: boolean;
  disponible: boolean;
  stock: number;
  imagen: string;
  opciones?: any;
  incluye_salsas?: boolean;
  tiene_acompanamiento?: boolean;
  tiene_notas?: boolean;
}

export interface Salsa {
  id: number;
  nombre: string;
  es_firma: boolean;
}

export interface Pedido {
  id: string;
  numeroPedido: number;
  nombreCliente: string;
  telefonoCliente: string;
  emailCliente?: string;
  tipoPedido: 'delivery' | 'pickup' | 'salon';
  direccionEntrega?: string;
  referenciaEntrega?: string;
  numeroMesa?: string;
  metodoPago: string;
  notas?: string;
  estado: string;
  subtotal?: number;
  costoEnvio?: number;
  total: number;
  items: any;
  idUsuario?: string;
  fechaCreacion: string;
}

export interface Reclamacion {
  id: number;
  codigoReclamo: string;
  nombreCompleto: string;
  tipoDoc: string;
  numeroDoc: string;
  telefono: string;
  email: string;
  direccion: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  sucursal?: string;
  numeroPedido?: string;
  fechaPedido?: string;
  esMenor?: boolean;
  nombreTutor?: string;
  docTutor?: string;
  tipoReclamo: 'queja' | 'reclamo';
  bienContratado?: 'producto' | 'servicio';
  montoReclamado?: number;
  descripcionProducto?: string;
  detalle: string;
  pedidoConsumidor: string;
  nombreAdjunto?: string;
  estado: string;
  fechaCreacion: string;
}

export interface Insumo {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  unidad: string;
  stockMinimo: number;
  estado: 'ok' | 'bajo' | 'critico';
  ultimoAbastecimiento: string;
}

export interface Utensilio {
  id: string;
  nombre: string;
  area: string;
  cantidad: number;
  condicion: 'Operativo' | 'Excelente' | 'Mantenimiento';
  ultimaInspeccion: string;
}

export interface MovimientoCaja {
  id: string;
  hora: string;
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  monto: number;
  motivo: string;
  responsable: string;
  comprobante?: string;
  fechaCreacion: string;
}

export interface CierreCaja {
  id: string;
  fecha: string;
  turno: string;
  apertura: number;
  ventasTotal: number;
  efectivoEsperado: number;
  efectivoReal: number;
  diferencia: number;
  responsable: string;
  cerradoEn: string;
  notas?: string;
}

export interface RegistroTicket {
  id: string;
  numeroTicket: string;
  numeroPedido: number;
  idPedido?: string;
  nombreCliente: string;
  telefonoCliente?: string;
  tipoPedido: 'delivery' | 'pickup' | 'salon';
  metodoPago: string;
  items: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
    notas?: string;
  }>;
  subtotal: number;
  costoEnvio: number;
  descuento: number;
  total: number;
  estado: 'pagado' | 'pendiente' | 'anulado';
  fechaCreacion: string;
}

export interface BannerPortada {
  id: string;
  titulo: string;
  imagen: string;
  imagenMovil: string;
  activo: boolean;
  orden: number;
  fechaCreacion: string;
  fechaActualizacion?: string;
}

