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
                                    <button onclick='abrirGeneradorTicket(<?php echo json_encode($o, JSON_HEX_APOS | JSON_HEX_QUOT); ?>)' class="ticket-btn-pos active-press">
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
<div id="ticket-modal-container" class="ticket-modal-overlay hidden">
    <div id="ticket-modal-content" class="ticket-modal-card">
        <!-- Close Button -->
        <button onclick="cerrarTicketModal()" class="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors" aria-label="Cerrar modal">
            <i data-lucide="x" class="w-5 h-5"></i>
        </button>

        <h3 class="text-sm font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2 select-none">
            <span class="w-1.5 h-3 bg-orange-500 rounded-sm"></span>
            Vista de Ticket Térmico
        </h3>

        <!-- Scrollable receipt frame mimicking actual POS paper roll -->
        <div class="ticket-receipt-scroll" id="thermal-receipt-container"></div>

        <!-- Action panel fixed to the bottom -->
        <div class="pt-4 border-t border-slate-800/80 mt-4 flex gap-3 shrink-0">
            <button onclick="imprimirTicketFisico()" class="ticket-print-action active-press">
                <i data-lucide="printer" class="w-4 h-4"></i>
                <span>Imprimir Recibo</span>
            </button>
            <button onclick="cerrarTicketModal()" class="ticket-close-action active-press">
                Cerrar
            </button>
        </div>
    </div>
</div>
