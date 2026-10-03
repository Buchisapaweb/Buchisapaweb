<?php
/**
 * BUCHISAPA BURGER & BROASTER - GESTIÓN E IMPRESIÓN DE TICKETS TÉRMICOS POS
 * admin/views/ticket.php
 */
require_once __DIR__ . '/../config/supabase.php';

// Cargar pedidos de Supabase
$ordersRes = supabaseRequest('GET', 'orders?select=*&order=created_at.desc');
$pedidos = Array.isArray($ordersRes['data']) ? $ordersRes['data'] : [];
?>
<div class="space-y-6 animate-fade-in">
    <!-- Header Title -->
    <div class="flex items-center justify-between pb-2 select-none">
        <div>
            <h2 class="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span class="w-2 h-4 bg-orange-500 rounded-sm"></span>
                Impresión de Tickets (POS Printer)
            </h2>
            <p class="text-xs text-slate-400">Emite boletas de venta, comandas de cocina y recibos de entrega formateados para impresoras térmicas (58mm / 80mm)</p>
        </div>
    </div>

    <!-- Table of Orders ready to be printed -->
    <div class="bg-[#121829] rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-[#0f1424]/60 border-b border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-wider select-none">
                        <th class="p-4">Orden</th>
                        <th class="p-4">Cliente / Contacto</th>
                        <th class="p-4">Detalle Breve</th>
                        <th class="p-4 text-right">Monto Total</th>
                        <th class="p-4">Tipo</th>
                        <th class="p-4 text-center">Imprimir Comprobante</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 text-xs text-slate-300">
                    <?php if (empty($pedidos)): ?>
                        <tr>
                            <td colspan="6" class="p-8 text-center text-slate-500 font-semibold select-none">No hay pedidos disponibles para emitir tickets.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($pedidos as $o): 
                            $orderNum = $o['orderNumber'] ?? $o['id'];
                            $items = [];
                            try {
                                $items = json_decode($o['items'] ?? '[]', true);
                            } catch(Exception $e) {}
                            
                            $itemsCount = count($items);
                            $itemsBrief = '';
                            if (is_array($items)) {
                                $briefArr = [];
                                foreach (array_slice($items, 0, 2) as $it) {
                                    $briefArr[] = ($it['quantity'] ?? 1) . 'x ' . ($it['name'] ?? 'Plato');
                                }
                                $itemsBrief = implode(', ', $briefArr);
                                if ($itemsCount > 2) {
                                    $itemsBrief .= '...';
                                }
                            }
                        ?>
                            <tr class="hover:bg-slate-800/20 transition-colors">
                                <td class="p-4 font-mono-numbers font-black text-white">#<?php echo htmlspecialchars($orderNum); ?></td>
                                <td class="p-4">
                                    <span class="block text-white font-extrabold"><?php echo htmlspecialchars($o['customerName'] ?? 'Cliente'); ?></span>
                                    <span class="block text-[10px] text-slate-500 font-mono-numbers mt-0.5"><?php echo htmlspecialchars($o['customerPhone'] ?? 'Sin teléfono'); ?></span>
                                </td>
                                <td class="p-4 font-bold text-slate-400 max-w-xs truncate"><?php echo htmlspecialchars($itemsBrief); ?></td>
                                <td class="p-4 text-right font-black text-emerald-400 font-mono-numbers">S/ <?php echo number_format(floatval($o['total'] ?? 0), 2); ?></td>
                                <td class="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500 select-none"><?php echo htmlspecialchars($o['orderType'] ?? 'Delivery'); ?></td>
                                <td class="p-4 text-center">
                                    <button onclick='abrirGeneradorTicket(<?php echo json_encode($o, JSON_HEX_APOS | JSON_HEX_QUOT); ?>)' class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-xl text-xs font-extrabold transition-all shadow-md active-press">
                                        <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                                        <span>Ver Ticket POS</span>
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Dynamic Overlay Modal for POS Receipt View -->
<div id="ticket-modal-container" class="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 hidden transition-opacity duration-150">
    <div id="ticket-modal-content" class="bg-[#121829] border border-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative flex flex-col h-[90vh] max-h-[680px]">
        <!-- Close Button -->
        <button onclick="cerrarTicketModal()" class="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors" aria-label="Cerrar modal">
            <i data-lucide="x" class="w-5 h-5"></i>
        </button>

        <h3 class="text-sm font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2 select-none">
            <span class="w-1.5 h-3 bg-orange-500 rounded-sm"></span>
            Vista de Ticket Térmico
        </h3>

        <!-- Scrollable receipt frame mimicking actual POS paper roll -->
        <div class="flex-1 overflow-y-auto bg-white p-6 rounded-xl border border-slate-200 text-black font-mono shadow-inner select-text select-none scrollbar-none" id="thermal-receipt-container">
            <!-- Render dynamic thermal ticket markup -->
        </div>

        <!-- Action panel fixed to the bottom of the sheet for natural touch reach -->
        <div class="pt-4 border-t border-slate-800/80 mt-4 flex gap-3 shrink-0">
            <button onclick="imprimirTicketFisico()" class="flex-1 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md active-press">
                <i data-lucide="printer" class="w-4 h-4"></i>
                <span>Imprimir Recibo</span>
            </button>
            <button onclick="cerrarTicketModal()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold rounded-xl text-xs active-press">
                Cerrar
            </button>
        </div>
    </div>
</div>

<script>
// Guardar temporalmente el pedido cargado activo para impresión de ticket
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
        <div class="text-center">
            <!-- Brand title conforming to strict typography -->
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
    
    // Abrir una ventana flotante limpia para el ticket de impresión física
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
            /* Estilos específicos de impresión */
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
            // Disparar diálogo de impresión inmediatamente y cerrar la pestaña flotante al terminar
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
</script>
