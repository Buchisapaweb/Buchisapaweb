import { CajaMovement, CajaClosure, TicketRecord } from './types';
import { getOrders } from './orders';

export let cajaState = {
  isOpen: true,
  openedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  responsable: 'Admin BuchiSapa',
  initialCash: 250.00
};

export let cajaMovementsStore: CajaMovement[] = [];
export let cajaClosuresStore: CajaClosure[] = [];
export let customTicketsStore: TicketRecord[] = [];

export async function getCajaSummary() {
  const orders = await getOrders();
  
  let totalSales = 0;
  let efectivo = 0;
  let yapePlin = 0;
  let tarjeta = 0;

  orders.forEach(o => {
    const amount = Number(o.total || 0);
    totalSales += amount;
    const method = (o.paymentMethod || '').toLowerCase();
    if (method.includes('yape') || method.includes('plin')) {
      yapePlin += amount;
    } else if (method.includes('tarjeta') || method.includes('card') || method.includes('pos')) {
      tarjeta += amount;
    } else {
      efectivo += amount;
    }
  });

  const egresosTotal = cajaMovementsStore.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + m.monto, 0);
  const ingresosExtra = cajaMovementsStore.filter(m => m.tipo === 'ingreso' && m.categoria !== 'Fondo Inicial').reduce((sum, m) => sum + m.monto, 0);

  const efectivoEsperado = (cajaState.initialCash + efectivo + ingresosExtra) - egresosTotal;

  return {
    isOpen: cajaState.isOpen,
    openedAt: cajaState.openedAt,
    responsable: cajaState.responsable,
    initialCash: cajaState.initialCash,
    totalSales: Number(totalSales.toFixed(2)),
    efectivo: Number(efectivo.toFixed(2)),
    yapePlin: Number(yapePlin.toFixed(2)),
    tarjeta: Number(tarjeta.toFixed(2)),
    egresosTotal: Number(egresosTotal.toFixed(2)),
    ingresosExtra: Number(ingresosExtra.toFixed(2)),
    efectivoEsperado: Number(efectivoEsperado.toFixed(2))
  };
}
