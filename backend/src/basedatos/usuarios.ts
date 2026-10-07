import { PerfilUsuario } from './tipos';

const almacenUsuarios = new Map<string, PerfilUsuario>();

// Lista de correos de administradores reconocidos
const CORREOS_ADMIN = [
  'buchisapaweb@gmail.com',
  'nexaltustecsac@gmail.com',
  'admin@buchisapa.pe'
];

// Usuarios semilla (Admin + Cliente de ejemplo)
const usuarioAdminWeb: PerfilUsuario = {
  id: '166099db-28ad-4329-b3c4-117f63188472',
  uid: '166099db-28ad-4329-b3c4-117f63188472',
  email: 'buchisapaweb@gmail.com',
  nombre: 'Administrador BuchiSapa',
  primerNombre: 'Administrador',
  apellido: 'BuchiSapa',
  telefono: '942 475 459',
  tipoDoc: 'DNI',
  numeroDoc: '70000001',
  rol: 'admin',
  esAdmin: true,
  emailVerificado: true,
  password: 'BuchiSapa2026*',
  fechaCreacion: new Date().toISOString(),
  fechaActualizacion: new Date().toISOString(),
};
almacenUsuarios.set(usuarioAdminWeb.email.toLowerCase(), usuarioAdminWeb);
almacenUsuarios.set(usuarioAdminWeb.uid, usuarioAdminWeb);
almacenUsuarios.set('admin-buchisapaweb-id', usuarioAdminWeb);

const clientePorDefecto: PerfilUsuario = {
  id: 'cust-buchisapa-1',
  uid: 'cust-buchisapa-1',
  email: 'cliente@buchisapa.pe',
  nombre: 'Cliente Buchisapa',
  primerNombre: 'Cliente',
  apellido: 'Buchisapa',
  telefono: '987 654 321',
  tipoDoc: 'DNI',
  numeroDoc: '45678901',
  rol: 'cliente',
  esAdmin: false,
  emailVerificado: true,
  fechaCreacion: new Date().toISOString(),
  fechaActualizacion: new Date().toISOString(),
};
almacenUsuarios.set(clientePorDefecto.email.toLowerCase(), clientePorDefecto);

export async function obtenerUsuarioPorEmail(email: string): Promise<PerfilUsuario | null> {
  if (!email) return null;
  return almacenUsuarios.get(email.toLowerCase().trim()) || null;
}

export async function obtenerUsuarioPorUid(uid: string): Promise<PerfilUsuario | null> {
  if (!uid) return null;
  for (const usuario of almacenUsuarios.values()) {
    if (usuario.uid === uid || usuario.id === uid) return usuario;
  }
  return null;
}

export async function obtenerTodosLosUsuarios(): Promise<PerfilUsuario[]> {
  return Array.from(almacenUsuarios.values());
}

export async function registrarCliente(datos: any): Promise<PerfilUsuario> {
  const email = (datos.email || '').toLowerCase().trim();
  const existente = await obtenerUsuarioPorEmail(email);

  const esUsuarioAdmin = datos.rol === 'admin' || CORREOS_ADMIN.includes(email);

  if (existente) {
    const actualizado: PerfilUsuario = {
      ...existente,
      ...datos,
      nombre: datos.nombre || `${datos.primerNombre || existente.primerNombre || ''} ${datos.apellido || existente.apellido || ''}`.trim() || existente.nombre,
      rol: esUsuarioAdmin ? 'admin' : (existente.rol || 'cliente'),
      esAdmin: esUsuarioAdmin || Boolean(existente.esAdmin),
      fechaActualizacion: new Date().toISOString()
    };
    almacenUsuarios.set(email, actualizado);
    return actualizado;
  }

  const id = datos.uid || datos.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nombre = datos.nombre || `${datos.primerNombre || ''} ${datos.apellido || ''}`.trim() || email.split('@')[0];
  const rolUsuario = esUsuarioAdmin ? 'admin' : (datos.rol || 'cliente');
  const nuevoUsuario: PerfilUsuario = {
    id,
    uid: id,
    email,
    nombre,
    primerNombre: datos.primerNombre || nombre.split(' ')[0],
    apellido: datos.apellido || nombre.split(' ').slice(1).join(' '),
    telefono: datos.telefono || '',
    tipoDoc: datos.tipoDoc || 'DNI',
    numeroDoc: datos.numeroDoc || '',
    fechaNacimiento: datos.fechaNacimiento || '',
    urlAvatar: datos.urlAvatar || datos.urlFoto || '',
    urlFoto: datos.urlFoto || datos.urlAvatar || '',
    rol: rolUsuario,
    esAdmin: esUsuarioAdmin,
    emailVerificado: Boolean(datos.emailVerificado),
    marketingAceptado: Boolean(datos.marketingAceptado),
    terminosAceptados: datos.terminosAceptados !== false,
    password: datos.password || '',
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
  };

  almacenUsuarios.set(email, nuevoUsuario);
  return nuevoUsuario;
}

export async function autenticarClienteGoogle(datos: any): Promise<PerfilUsuario> {
  const email = (datos.email || '').toLowerCase().trim();
  const existente = await obtenerUsuarioPorEmail(email);
  if (existente) {
    existente.urlFoto = datos.urlFoto || existente.urlFoto;
    existente.urlAvatar = datos.urlFoto || existente.urlAvatar;
    if (datos.nombre) existente.nombre = datos.nombre;
    existente.emailVerificado = true;
    existente.fechaActualizacion = new Date().toISOString();
    return existente;
  }

  return registrarCliente({
    ...datos,
    email,
    uid: datos.googleUid || `goog_${Date.now()}`,
    emailVerificado: true
  });
}

export async function obtenerOCrearUsuario(uid: string, email: string, nombre?: string, urlFoto?: string): Promise<PerfilUsuario> {
  const porUid = await obtenerUsuarioPorUid(uid);
  if (porUid) return porUid;

  const porEmail = await obtenerUsuarioPorEmail(email);
  if (porEmail) {
    porEmail.uid = uid;
    return porEmail;
  }

  return registrarCliente({
    uid,
    id: uid,
    email,
    nombre: nombre || email.split('@')[0],
    urlFoto: urlFoto || '',
    urlAvatar: urlFoto || '',
    emailVerificado: true
  });
}
