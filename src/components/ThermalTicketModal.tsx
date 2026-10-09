import React from 'react';
import { X, Printer, CheckCircle, Download } from 'lucide-react';
import { Order } from '../types';

interface ThermalTicketModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ThermalTicketModal: React.FC<ThermalTicketModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const opGravada = (order.subtotal / 1.18).toFixed(2);
  const igv = (order.subtotal - Number(opGravada)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
        
        {/* Header toolbar */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-sm">Comprobante de Pedido #{order.code}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold px-3 py-1.5 rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-4 sm:p-6 bg-stone-950/40 overflow-y-auto max-h-[75vh]">
          <div 
            id="thermal-ticket"
            className="bg-white text-black font-mono text-[11px] leading-tight p-4 shadow-xl rounded-sm mx-auto max-w-[320px] select-text border border-stone-200"
          >
            {/* Header */}
            <div className="text-center space-y-1 pb-2 border-b border-dashed border-black">
              <div className="font-black text-sm tracking-wider">BUCHISAPA</div>
              <div className="text-[10px] font-bold">POLLERÍA & SABOR AMAZÓNICO</div>
              <div className="text-[9px]">RUC: 20608912345</div>
              <div className="text-[9px]">Av. Gran Chimú / Santa Clara, Ate - Lima</div>
              <div className="text-[9px]">Tel / WhatsApp: 987 654 321</div>
            </div>

            {/* Document Info */}
            <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
              <div className="font-bold text-center">BOLETA DE VENTA ELECTRÓNICA</div>
              <div className="text-center font-bold">B001 - {order.code}</div>
              <div className="flex justify-between pt-1">
                <span>FECHA: {new Date(order.createdAt).toLocaleDateString('es-PE')}</span>
                <span>HORA: {new Date(order.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div>CLIENTE: {order.customerName.toUpperCase()}</div>
              <div>TEL: {order.customerPhone}</div>
              <div>TIPO: {order.orderType === 'delivery' ? 'SERVICIO DELIVERY' : 'RECOJO EN TIENDA'}</div>
              {order.address && (
                <div className="text-[9px] break-words">DIR: {order.address}</div>
              )}
              {order.reference && (
                <div className="text-[9px] break-words">REF: {order.reference}</div>
              )}
            </div>

            {/* Items */}
            <div className="py-2 border-b border-dashed border-black">
              <div className="flex justify-between font-bold text-[9px] pb-1 border-b border-black">
                <span className="w-6">CANT</span>
                <span className="flex-1 px-1">DESCRIPCIÓN</span>
                <span className="w-12 text-right">P.TOT</span>
              </div>

              <div className="space-y-1.5 pt-1.5">
                {order.items.map((it, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold">
                      <span className="w-6">{it.quantity}x</span>
                      <span className="flex-1 px-1 break-words">{it.product.name}</span>
                      <span className="w-12 text-right">S/ {it.totalPrice.toFixed(2)}</span>
                    </div>

                    {it.selectedSauces.length > 0 && (
                      <div className="text-[9px] text-stone-700 pl-6">
                        Cremas: {it.selectedSauces.join(', ')}
                      </div>
                    )}

                    {it.selectedExtras.length > 0 && (
                      <div className="text-[9px] text-stone-700 pl-6">
                        Extras: {it.selectedExtras.map(e => e.name).join(', ')}
                      </div>
                    )}

                    {it.notes && (
                      <div className="text-[9px] italic text-stone-600 pl-6">
                        Nota: {it.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>OP. GRAVADA:</span>
                <span>S/ {opGravada}</span>
              </div>
              <div className="flex justify-between">
                <span>I.G.V. (18%):</span>
                <span>S/ {igv}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>COSTO DELIVERY:</span>
                  <span>S/ {order.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-xs pt-1 border-t border-black">
                <span>TOTAL A PAGAR:</span>
                <span>S/ {order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>MÉTODO DE PAGO:</span>
                <span className="font-bold">{order.paymentMethod.toUpperCase()}</span>
              </div>
              {order.cashChangeFor && (
                <div className="flex justify-between text-[9px]">
                  <span>PAGA CON: S/ {order.cashChangeFor.toFixed(2)}</span>
                  <span>VUELTO: S/ {(order.cashChangeFor - order.total).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pt-2 space-y-1 text-[9px]">
              <div className="font-bold">¡GRACIAS POR SU PREFERENCIA!</div>
              <div>BuchiSapa - El auténtico sabor de la selva y el broaster más crujiente</div>
              <div>Santa Clara, Ate - Lima</div>
              <div className="text-[8px] text-stone-600">Representación impresa de la Boleta Electrónica</div>
              <div className="text-center text-xs pt-1">★★★ BUCHISAPA ★★★</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 text-center">
          <p className="text-xs text-stone-400">
            Puedes imprimir este comprobante en cualquier impresora térmica de 80mm o guardarlo en PDF.
          </p>
        </div>

      </div>
    </div>
  );
};
