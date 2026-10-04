import React from 'react';
import { useBuchisapa } from '../context/BuchisapaContext';
import { X, Printer, Share2, Check } from 'lucide-react';

export const ReceiptTicketModal: React.FC = () => {
  const { viewingTicketOrder, setViewingTicketOrder, businessConfig } = useBuchisapa();
  const [copied, setCopied] = React.useState(false);

  if (!viewingTicketOrder) return null;

  const dateStr = new Date(viewingTicketOrder.createdAt).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    alert(`🖨️ Enviado a Impresora Térmica WiFi en ${businessConfig.printerIp}:${businessConfig.printerPort}`);
  };

  const ticketContent = `================================
       BUCHISAPA BURGER         
   Pollería & Sabor Amazónico   
  Av. La Estrella con 28 Julio  
       Santa Clara - Ate        
    RUC: ${businessConfig.ruc} - PERÚ     
================================
ORDEN: #${viewingTicketOrder.orderNumber}
FECHA: ${dateStr}
TIPO: ${viewingTicketOrder.orderType}
CLIENTE: ${viewingTicketOrder.customerName}
TELÉFONO: ${viewingTicketOrder.customerPhone}
${viewingTicketOrder.deliveryAddress ? `DIRECCIÓN: ${viewingTicketOrder.deliveryAddress}\n` : ''}${
    viewingTicketOrder.tableNumber ? `MESA: ${viewingTicketOrder.tableNumber}\n` : ''
}--------------------------------
CANT  DESCRIPCIÓN        TOTAL  
--------------------------------
${viewingTicketOrder.items
  .map(
    item =>
      `${item.quantity}x ${item.productName.slice(0, 18).padEnd(18)} S/${item.itemTotal.toFixed(2)}${
        item.selectedCremas?.length ? `\n   Cremas: ${item.selectedCremas.join(', ')}` : ''
      }${
        item.instructions ? `\n   Nota: ${item.instructions}` : ''
      }`
  )
  .join('\n')}
--------------------------------
SUBTOTAL:          S/ ${viewingTicketOrder.subtotal.toFixed(2)}
${viewingTicketOrder.deliveryFee > 0 ? `DELIVERY:          S/ ${viewingTicketOrder.deliveryFee.toFixed(2)}\n` : ''}TOTAL:             S/ ${viewingTicketOrder.total.toFixed(2)}
PAGO:              ${viewingTicketOrder.paymentMethod}
================================
 ¡GRACIAS POR SU PREFERENCIA!   
      www.buchisapa.pe          
================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0F1424] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span>Comanda / Ticket Digital</span>
          </h3>
          <button
            onClick={() => setViewingTicketOrder(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Paper Simulation */}
        <div className="p-4">
          <div className="bg-[#FFFDF0] text-[#1E293B] p-4 rounded-xl font-mono text-[11px] leading-relaxed select-all border border-amber-200 shadow-inner max-h-[50vh] overflow-y-auto whitespace-pre-wrap">
            {ticketContent}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0A0D1A] border-t border-slate-800 flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            data-testid="copy_ticket_btn"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-orange-600/20 transition-all"
            data-testid="print_ticket_btn"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir WiFi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
