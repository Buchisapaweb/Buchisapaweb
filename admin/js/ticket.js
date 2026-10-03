/**
 * BUCHISAPA BURGER & BROASTER - TICKET MODULE JS
 * admin/js/ticket.js
 */

console.log("🎫 Ticket Module Initialized");

// Global active ticket variable
let pedidoImpresionActivo = null;

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
            ${o.address ? `<div><strong>DIRECCIÓN:</strong> ${o.address}</div>` : ''}
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

    document.getElementById('thermal-receipt-container').innerHTML = markup;
    document.getElementById('ticket-modal-container').classList.remove('hidden');
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function cerrarTicketModal() {
    document.getElementById('ticket-modal-container').classList.add('hidden');
}

function imprimirTicketFisico() {
    if (!pedidoImpresionActivo) return;
    
    const win = window.open('', '_blank', 'width=380,height=600');
    if (!win) {
        alert("Por favor habilita las ventanas emergentes en tu navegador para imprimir.");
        return;
    }
    
    const receiptMarkup = document.getElementById('thermal-receipt-container').innerHTML;
    
    win.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Imprimir Ticket - Buchisapa POS</title>
        <style>
            @page {
                size: 80mm auto;
                margin: 0;
            }
            body {
                font-family: 'Courier New', Courier, monospace;
                width: 72mm;
                margin: 0 auto;
                padding: 10px;
                color: #000;
                background-color: #fff;
            }
            strong {
                font-weight: bold;
            }
            .text-center {
                text-align: center;
            }
            .text-right {
                text-align: right;
            }
            .flex {
                display: flex;
            }
            .flex-1 {
                flex: 1;
            }
            .justify-between {
                justify-content: space-between;
            }
            .items-start {
                align-items: flex-start;
            }
            .border-t {
                border-top: 1px dashed #000;
            }
            .my-3 {
                margin-top: 12px;
                margin-bottom: 12px;
            }
            .mb-1 {
                margin-bottom: 4px;
            }
            .mb-1\\.5 {
                margin-bottom: 6px;
            }
            .mt-0\\.5 {
                margin-top: 2px;
            }
            .mt-1\\.5 {
                margin-top: 6px;
            }
            .text-[10px] {
                font-size: 11px;
            }
            .text-[9px] {
                font-size: 10px;
            }
            .text-[8px] {
                font-size: 9px;
            }
            .text-xs {
                font-size: 12px;
            }
            .text-sm {
                font-size: 14px;
            }
            .text-base {
                font-size: 16px;
            }
            .font-bold {
                font-weight: bold;
            }
            .font-extrabold {
                font-weight: 900;
            }
            .italic {
                font-style: italic;
            }
            @media print {
                body {
                    width: 72mm;
                }
                .no-print {
                    display: none;
                }
            }
        </style>
    </head>
    <body>
        ${receiptMarkup}
        <script>
            window.onload = function() {
                window.print();
                setTimeout(function() {
                    window.close();
                }, 100);
            }
        <\/script>
    </body>
    </html>
    `);
    
    win.document.close();
}
