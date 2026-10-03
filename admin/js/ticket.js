/**
 * BUCHISAPA BURGER & BROASTER - TICKET MODULE JS
 * admin/js/ticket.js
 */

console.log("🎫 Ticket Module Initialized");

// Global active ticket variable
var pedidoImpresionActivo = (typeof window !== 'undefined' && window.pedidoImpresionActivo) ? window.pedidoImpresionActivo : null;

function abrirGeneradorTicket(o) {
    pedidoImpresionActivo = o;
    const items = typeof o.items === 'string' ? JSON.parse(o.items || '[]') : (o.items || []);
    const orderNum = o.orderNumber || o.id || '';
    const dateStr = o.created_at ? new Date(o.created_at).toLocaleString('es-PE', { hour12: true }) : new Date().toLocaleString('es-PE');
    
    let itemsRowsHtml = '';
    items.forEach(it => {
        const itemTotal = (it.quantity || 1) * parseFloat(it.price || 0);
        itemsRowsHtml += `
        <div class="flex justify-between items-start text-xs leading-tight mb-1">
            <span class="flex-1">${it.quantity || 1}x ${it.name}</span>
            <span class="ml-4 tabular-nums">S/ ${itemTotal.toFixed(2)}</span>
        </div>`;
    });

    const markup = `
        <div class="text-center pos-thermal-container">
            <h4 class="font-extrabold text-base tracking-wider uppercase">BUCHISAPA</h4>
            <p class="text-[10px] leading-tight uppercase mt-0.5">POLLERÍA & SABOR AMAZÓNICO</p>
            <p class="text-[9px] leading-tight mt-0.5">Av. La Estrella con Calle 28 de Julio</p>
            <p class="text-[9px] leading-tight">Santa Clara, Ate - Lima</p>
            <p class="text-[9px] leading-tight">Tlf: (01) 351-4829</p>
        </div>

        <div class="border-t border-dashed border-black/30 my-3"></div>

        <div class="text-[10px] leading-snug space-y-0.5">
            <div><strong>TICKET DE COMPRA:</strong> #${orderNum}</div>
            <div><strong>FECHA:</strong> ${dateStr}</div>
            <div><strong>CLIENTE:</strong> ${o.customerName || 'Cliente General'}</div>
            <div><strong>TELÉFONO:</strong> ${o.customerPhone || 'Sin registrar'}</div>
            <div><strong>TIPO:</strong> ${o.orderType || 'Delivery'}</div>
            <div><strong>MÉTODO PAGO:</strong> ${o.paymentMethod || 'Yape'}</div>
            ${o.deliveryAddress || o.address ? `<div><strong>DIRECCIÓN:</strong> ${o.deliveryAddress || o.address}</div>` : ''}
        </div>

        <div class="border-t border-dashed border-black/30 my-3"></div>

        <div>
            <div class="flex justify-between font-bold text-[10px] uppercase mb-1.5">
                <span>Platos / Combo</span>
                <span>Subtotal</span>
            </div>
            ${itemsRowsHtml}
        </div>

        <div class="border-t border-dashed border-black/30 my-3"></div>

        <div class="text-xs space-y-1">
            <div class="flex justify-between font-extrabold text-sm">
                <span>TOTAL A PAGAR:</span>
                <span class="tabular-nums">S/ ${parseFloat(o.total || 0).toFixed(2)}</span>
            </div>
        </div>

        <div class="border-t border-dashed border-black/30 my-3"></div>

        <div class="text-center text-[10px] uppercase leading-tight space-y-0.5 select-none">
            <p class="font-bold">¡GRACIAS POR TU COMPRA!</p>
            <p class="text-[8px] text-black/60 italic">Sabor amazónico a la leña en tu mesa</p>
            <p class="text-[8px] text-black/40 mt-1.5">Buchisapa POS Printer v1.0</p>
        </div>
    `;

    const container = document.getElementById('thermal-receipt-container');
    if (container) {
        container.innerHTML = markup;
    }
    const modal = document.getElementById('ticket-modal-container');
    if (modal) {
        modal.classList.remove('hidden');
    }
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function cerrarTicketModal() {
    const modal = document.getElementById('ticket-modal-container');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function imprimirTicketFisico() {
    if (!pedidoImpresionActivo) return;
    
    // Si BuchisapaPrinter está disponible globalmente, usar su método robusto
    if (typeof BuchisapaPrinter !== 'undefined' && typeof BuchisapaPrinter.printTicketNative === 'function') {
        BuchisapaPrinter.printTicketNative(pedidoImpresionActivo);
        return;
    }

    try {
        const frame = document.getElementById('print_hidden');
        if (frame && frame.contentWindow) {
            const receiptMarkup = document.getElementById('thermal-receipt-container')?.innerHTML || '';
            frame.contentWindow.document.open();
            frame.contentWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Imprimir Ticket</title>
                    <style>
                        @page { size: 80mm auto; margin: 0; }
                        body { font-family: 'Courier New', monospace; width: 72mm; margin: 0 auto; padding: 10px; color: #000; }
                    </style>
                </head>
                <body>
                    ${receiptMarkup}
                    <script>window.onload = function() { window.print(); };<\/script>
                </body>
                </html>
            `);
            frame.contentWindow.document.close();
            return;
        }
    } catch (e) {
        console.warn('Iframe printing fallback to window.print', e);
    }

    window.print();
}
