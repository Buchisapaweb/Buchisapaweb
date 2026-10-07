import { MovimientoCaja, CierreCaja } from './tipos';
import { obtenerPedidos } from './pedidos';

// GESTIÓN DE CAJA
let estadoCaja = {
  estaAbierta: true,
  abiertaEn: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  responsable: 'Admin BuchiSapa',
  efectivoInicial: 250.00
};

let almacenMovimientosCaja: MovimientoCaja[] = [
  {
    id: 'mov-1',
    hora: '17:00',
    tipo: 'ingreso',
    categoria: 'Fondo Inicial',
    monto: 250.00,
    motivo: 'Apertura de turno tarde/noche con sencillo para cambio',
    responsable: 'Admin BuchiSapa',
    comprobante: 'APERTURA-001',
    fechaCreacion: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  }
];

let almacenCierresCaja: CierreCaja[] = [];

export async function obtenerResumenCaja() {
  const pedidos = await obtenerPedidos();
  
  let ventasTotal = 0;
  let efectivo = 0;
  let yapePlin = 0;
  let tarjeta = 0;

  pedidos.forEach(o => {
    const monto = Number(o.total || 0);
    ventasTotal += monto;
    const metodo = (o.metodoPago || '').toLowerCase();
    if (metodo.includes('yape') || metodo.includes('plin')) {
      yapePlin += monto;
    } else if (metodo.includes('tarjeta') || metodo.includes('card') || metodo.includes('pos')) {
      tarjeta += monto;
    } else {
      efectivo += monto;
    }
  });

  const egresosTotal = almacenMovimientosCaja.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + m.monto, 0);
  const ingresosExtra = almacenMovimientosCaja.filter(m => m.tipo === 'ingreso' && m.categoria !== 'Fondo Inicial').reduce((sum, m) => sum + m.monto, 0);

  const efectivoEsperado = (estadoCaja.efectivoInicial + efectivo + ingresosExtra) - egresosTotal;

  return {
    estaAbierta: estadoCaja.estaAbierta,
    abiertaEn: estadoCaja.abiertaEn,
    responsable: estadoCaja.responsable,
    efectivoInicial: estadoCaja.efectivoInicial,
    ventasTotal: Number(ventasTotal.toFixed(2)),
    efectivo: Number(efectivo.toFixed(2)),
    yapePlin: Number(yapePlin.toFixed(2)),
    tarjeta: Number(tarjeta.toFixed(2)),
    egresosTotal: Number(egresosTotal.toFixed(2)),
    ingresosExtra: Number(ingresosExtra.toFixed(2)),
    efectivoEsperado: Number(efectivoEsperado.toFixed(2)),
    totalPedidos: pedidos.length,
    pedidosActivos: pedidos.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado').length,
    movimientos: almacenMovimientosCaja,
    historialCierres: almacenCierresCaja
  };
}

export async function agregarMovimientoCaja(datos: any): Promise<MovimientoCaja> {
  const ahora = new Date();
  const nuevoMov: MovimientoCaja = {
    id: `mov-${Date.now()}`,
    hora: `${ahora.getHours()}:${ahora.getMinutes()}`,
    tipo: datos.tipo,
    categoria: datos.categoria || 'Gasto General',
    monto: Math.abs(Number(datos.monto) || 0),
    motivo: datos.motivo || 'Movimiento de caja chica',
    responsable: datos.responsable || estadoCaja.responsable || 'Admin BuchiSapa',
    comprobante: datos.comprobante || `REC-${Date.now().toString().slice(-4)}`,
    fechaCreacion: ahora.toISOString()
  };

  almacenMovimientosCaja.unshift(nuevoMov);
  return nuevoMov;
}

export async function abrirCaja(datos: { montoInicial: number; responsable?: string }) {
  estadoCaja.estaAbierta = true;
  estadoCaja.efectivoInicial = Number(datos.montoInicial) || 250.00;
  estadoCaja.abiertaEn = new Date().toISOString();
  if (datos.responsable) estadoCaja.responsable = datos.responsable;

  await agregarMovimientoCaja({
    tipo: 'ingreso',
    categoria: 'Fondo Inicial',
    monto: estadoCaja.efectivoInicial,
    motivo: 'Apertura de turno con sencillo para cambio en caja',
    responsable: estadoCaja.responsable
  });

  return obtenerResumenCaja();
}

export async function cerrarCaja(datos: { efectivoReal: number; notas?: string; responsable?: string }) {
  const resumen = await obtenerResumenCaja();
  const real = Number(datos.efectivoReal) || resumen.efectivoEsperado;
  const dif = Number((real - resumen.efectivoEsperado).toFixed(2));

  const cierre: CierreCaja = {
    id: `cierre-${Date.now()}`,
    fecha: new Date().toISOString().split('T')[0],
    turno: 'Turno Tarde/Noche',
    apertura: resumen.efectivoInicial,
    ventasTotal: resumen.ventasTotal,
    efectivoEsperado: resumen.efectivoEsperado,
    efectivoReal: real,
    diferencia: dif,
    responsable: datos.responsable || resumen.responsable,
    cerradoEn: new Date().toISOString(),
    notas: datos.notas || (dif === 0 ? 'Cuadre de caja exacto' : `Diferencia de S/ ${dif.toFixed(2)}`)
  };

  almacenCierresCaja.unshift(cierre);
  estadoCaja.estaAbierta = false;

  return {
    exito: true,
    cierre,
    resumenCaja: await obtenerResumenCaja()
  };
}
