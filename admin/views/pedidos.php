<?php
/**
 * BUCHISAPA BURGER & BROASTER - GESTIÓN DE PEDIDOS Y COMANDAS DUAL (TABLA + KANBAN)
 * admin/views/pedidos.php
 */
require_once __DIR__ . '/../config/supabase.php';

$error = '';
$success = '';

// Procesar cambios de estado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'update_status') {
        $id = $_POST['id'] ?? null;
        $status = $_POST['status'] ?? '';
        
        if ($id && $status) {
            $res = supabaseRequest('PATCH', "orders?id=eq.{$id}", ['status' => $status]);
            if ($res['code'] >= 200 && $res['code'] < 300) {
                $success = "¡El pedido #{$id} ha cambiado de estado a '{$status}' con éxito!";
            } else {
                $error = 'Error al actualizar el estado: Code ' . $res['code'];
            }
        }
    }
}

// Cargar pedidos de Supabase
$ordersRes = supabaseRequest('GET', 'orders?select=*&order=created_at.desc');
$pedidos = $ordersRes['data'] ?? [];

// Agrupar pedidos por estado para el Tablero Kanban
$pedidos_por_estado = [
    'recibido' => [],
    'preparando' => [],
    'en_camino' => [],
    'entregado' => []
];

foreach ($pedidos as $o) {
    $st = strtolower($o['status'] ?? 'recibido');
    if ($st === 'completado') $st = 'entregado';
    if (array_key_exists($st, $pedidos_por_estado)) {
        $pedidos_por_estado[$st][] = $o;
    }
}
?>
<div class="space-y-6">
    <!-- Header Area -->
    <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4 animate-fade-in">
        <div>
            <h2 class="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span class="w-2 h-4 bg-orange-500 rounded-sm"></span>
                Pedidos y Comandas
            </h2>
            <p class="text-xs text-slate-400">Controla las comandas, despacha entregas y monitorea la cocina en tiempo real</p>
        </div>
        
        <!-- Controls panel -->
        <div class="flex flex-wrap items-center gap-3">
            <!-- 1. Horizontal Scrollable Status Swiper -->
            <div class="flex items-center gap-1.5 bg-[#121829] p-1 rounded-xl border border-slate-800/80 overflow-x-auto whitespace-nowrap scrollbar-none select-none">
                <button onclick="filterPHPOrders('all')" class="order-tab-btn active active-press">Todos</button>
                <button onclick="filterPHPOrders('recibido')" class="order-tab-btn active-press">Recibidos</button>
                <button onclick="filterPHPOrders('preparando')" class="order-tab-btn active-press">Cocina</button>
                <button onclick="filterPHPOrders('en_camino')" class="order-tab-btn active-press">En Camino</button>
                <button onclick="filterPHPOrders('entregado')" class="order-tab-btn active-press">Entregados</button>
            </div>

            <!-- 2. Desktop View Selector (Table vs Kanban) -->
            <div class="hidden lg:flex items-center bg-[#121829] p-1 rounded-xl border border-slate-800/80 gap-1 select-none shrink-0">
                <button onclick="toggleDesktopView('table')" id="btn-view-table" class="view-selector-btn active active-press">
                    <i data-lucide="list" class="w-3.5 h-3.5"></i>
                    <span>Tabla</span>
                </button>
                <button onclick="toggleDesktopView('kanban')" id="btn-view-kanban" class="view-selector-btn active-press">
                    <i data-lucide="kanban" class="w-3.5 h-3.5"></i>
                    <span>Tablero KDS</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Mensajes de Operación -->
    <?php if (!empty($success)): ?>
        <div class="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
            <i data-lucide="check-circle" class="w-4 h-4 shrink-0"></i>
            <span><?php echo $success; ?></span>
        </div>
    <?php endif; ?>
    <?php if (!empty($error)): ?>
        <div class="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl flex items-center gap-2">
            <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
            <span><?php echo $error; ?></span>
        </div>
    <?php endif; ?>

    <!-- ========================================================================= -->
    <!-- DESKTOP VIEW A: CLASSIC TABLE (Visible by default on lg+)                  -->
    <!-- ========================================================================= -->
    <div id="desktop-table-card" class="hidden lg:block bg-[#121829] rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg animate-fade-in">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-[#0f1424]/60 border-b border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                        <th class="p-4">Orden</th>
                        <th class="p-4">Cliente / Contacto</th>
                        <th class="p-4">Platos Solicitados</th>
                        <th class="p-4 text-right">Total</th>
                        <th class="p-4">Tipo</th>
                        <th class="p-4">Pago</th>
                        <th class="p-4">Estado</th>
                        <th class="p-4 text-center">Despachar</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 text-xs text-slate-300" id="php-orders-tbody">
                    <?php if (empty($pedidos)): ?>
                        <tr>
                            <td colspan="8" class="p-8 text-center text-slate-500 font-semibold">No se encontraron órdenes en Supabase.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($pedidos as $o): ?>
                            <?php 
                            $status = strtolower($o['status'] ?? 'recibido');
                            $orderNum = $o['orderNumber'] ?? $o['id'];
                            $items = [];
                            try {
                                $items = json_decode($o['items'] ?? '[]', true);
                            } catch(Exception $e) {}
                            
                            $stateColor = 'text-amber-400';
                            if ($status === 'entregado' || $status === 'completado') $stateColor = 'text-emerald-400';
                            elseif ($status === 'cancelado') $stateColor = 'text-red-400';
                            elseif ($status === 'preparando') $stateColor = 'text-sky-400';
                            
                            $actionHtml = '';
                            if ($status === 'recibido') {
                                $actionHtml = '<button type="submit" class="btn-kds-cook"><i data-lucide="chef-hat" class="w-3.5 h-3.5"></i> Cocinar</button><input type="hidden" name="status" value="preparando">';
                            } elseif ($status === 'preparando') {
                                $actionHtml = '<button type="submit" class="btn-kds-dispatch"><i data-lucide="truck" class="w-3.5 h-3.5"></i> Despachar</button><input type="hidden" name="status" value="en_camino">';
                            } elseif ($status === 'en_camino') {
                                $actionHtml = '<button type="submit" class="btn-kds-deliver"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Entregar</button><input type="hidden" name="status" value="entregado">';
                            } else {
                                $actionHtml = '<span class="badge-dispatched"><i data-lucide="archive-restore" class="w-3 h-3 inline mr-1"></i> Despachado</span>';
                            }
                            ?>
                            <tr class="hover:bg-slate-800/20 transition-colors order-row" data-status="<?php echo $status; ?>">
                                <td class="p-4 font-mono-numbers font-black text-white">#<?php echo htmlspecialchars($orderNum); ?></td>
                                <td class="p-4">
                                    <span class="block text-white font-extrabold"><?php echo htmlspecialchars($o['customerName'] ?? 'Cliente'); ?></span>
                                    <span class="block text-[10px] text-slate-500 font-medium"><?php echo htmlspecialchars($o['customerPhone'] ?? 'Sin teléfono'); ?> <span class="text-slate-700 font-bold">&bull;</span> <?php echo isset($o['created_at']) ? date('h:i A', strtotime($o['created_at'])) : 'Ahora'; ?></span>
                                </td>
                                <td class="p-4">
                                    <div class="flex flex-wrap gap-1.5 max-w-sm">
                                        <?php if (is_array($items)): ?>
                                            <?php foreach ($items as $it): ?>
                                                <span class="bg-[#1c223a] text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">
                                                    <?php echo $it['quantity'] ?? 1; ?>x <?php echo htmlspecialchars($it['name'] ?? 'Plato'); ?>
                                                </span>
                                            <?php endforeach; ?>
                                        <?php endif; ?>
                                    </div>
                                </td>
                                <td class="p-4 text-right font-bold text-emerald-400 font-mono-numbers">S/ <?php echo number_format(floatval($o['total'] ?? 0), 2); ?></td>
                                <td class="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400"><?php echo htmlspecialchars($o['orderType'] ?? 'Delivery'); ?></td>
                                <td class="p-4 text-[10px] font-medium text-slate-500 font-mono"><?php echo htmlspecialchars($o['paymentMethod'] ?? 'Yape'); ?></td>
                                <td class="p-4"><span class="font-black text-[10px] uppercase tracking-wider <?php echo $stateColor; ?>"><?php echo $status; ?></span></td>
                                <td class="p-4 space-y-1 w-32">
                                    <?php if ($status !== 'entregado' && $status !== 'cancelado'): ?>
                                        <form action="/admin/index.php?view=pedidos" method="POST">
                                            <input type="hidden" name="action" value="update_status">
                                            <input type="hidden" name="id" value="<?php echo $o['id']; ?>">
                                            <?php echo $actionHtml; ?>
                                        </form>
                                        <form action="/admin/index.php?view=pedidos" method="POST" class="w-full">
                                            <input type="hidden" name="action" value="update_status">
                                            <input type="hidden" name="id" value="<?php echo $o['id']; ?>">
                                            <input type="hidden" name="status" value="cancelado">
                                            <button type="submit" class="btn-kds-cancel">Cancelar</button>
                                        </form>
                                    <?php else: ?>
                                        <?php echo $actionHtml; ?>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- ========================================================================= -->
    <!-- DESKTOP VIEW B: KANBAN BOARD (SaaS KDS feel, hidden by default on lg+)     -->
    <!-- ========================================================================= -->
    <div id="desktop-kanban-board" class="hidden lg:grid grid-cols-4 gap-4 overflow-x-auto pb-4 pt-1 animate-fade-in select-none">
        <?php
        $columns = [
            'recibido' => ['title' => 'Recibidos', 'badge' => 'border-amber-500/20 bg-amber-500/5 text-amber-400'],
            'preparando' => ['title' => 'Cocina', 'badge' => 'border-sky-500/20 bg-sky-500/5 text-sky-400'],
            'en_camino' => ['title' => 'En Camino', 'badge' => 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400'],
            'entregado' => ['title' => 'Entregados', 'badge' => 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400']
        ];
        
        foreach ($columns as $col_id => $col_meta):
            $orders_in_col = $pedidos_por_estado[$col_id] ?? [];
            $count = count($orders_in_col);
        ?>
            <!-- Column Container -->
            <div class="kds-column">
                <!-- Column Header -->
                <div class="kds-column-header">
                    <h3 class="kds-column-title">
                        <span class="w-1.5 h-3 bg-orange-500 rounded-sm"></span>
                        <?php echo $col_meta['title']; ?>
                    </h3>
                    <span class="px-2 py-0.5 border rounded-md text-[9px] font-black uppercase <?php echo $col_meta['badge']; ?>">
                        <?php echo $count; ?>
                    </span>
                </div>
                
                <!-- Cards scrollable region inside columns -->
                <div class="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
                    <?php if (empty($orders_in_col)): ?>
                        <div class="h-28 border border-dashed border-slate-800/60 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                            <i data-lucide="inbox" class="w-5 h-5 text-slate-600 mb-1"></i>
                            <span class="text-[10px] font-bold text-slate-500">Sin comandas</span>
                        </div>
                    <?php else: ?>
                        <?php foreach ($orders_in_col as $o): 
                            $orderNum = $o['orderNumber'] ?? $o['id'];
                            $items = [];
                            try {
                                $items = json_decode($o['items'] ?? '[]', true);
                            } catch(Exception $e) {}
                            
                            $status = strtolower($o['status'] ?? 'recibido');
                            $actionHtml = '';
                            if ($status === 'recibido') {
                                $actionHtml = '<button type="submit" class="btn-kds-cook"><i data-lucide="chef-hat" class="w-3.5 h-3.5"></i> Cocinar</button><input type="hidden" name="status" value="preparando">';
                            } elseif ($status === 'preparando') {
                                $actionHtml = '<button type="submit" class="btn-kds-dispatch"><i data-lucide="truck" class="w-3.5 h-3.5"></i> Despachar</button><input type="hidden" name="status" value="en_camino">';
                            } elseif ($status === 'en_camino') {
                                $actionHtml = '<button type="submit" class="btn-kds-deliver"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Entregar</button><input type="hidden" name="status" value="entregado">';
                            } else {
                                $actionHtml = '<span class="badge-dispatched"><i data-lucide="archive-restore" class="w-3 h-3 inline mr-1"></i> Despachado</span>';
                            }
                        ?>
                            <!-- Kanban Comanda Card -->
                            <div class="kds-card space-y-3.5">
                                <div class="flex justify-between items-start gap-2">
                                    <div class="min-w-0">
                                        <span class="font-mono-numbers font-black text-white text-xs block">#<?php echo htmlspecialchars($orderNum); ?></span>
                                        <h4 class="font-extrabold text-xs text-slate-300 truncate mt-1"><?php echo htmlspecialchars($o['customerName'] ?? 'Cliente'); ?></h4>
                                    </div>
                                    <span class="text-[9px] font-black uppercase text-slate-500 shrink-0 block"><?php echo htmlspecialchars($o['orderType'] ?? 'Delivery'); ?></span>
                                </div>
                                
                                <!-- Comanda Content -->
                                <div class="bg-[#0f1424]/60 p-2.5 rounded-lg border border-slate-800/50 space-y-1.5">
                                    <?php if (is_array($items)): ?>
                                        <?php foreach ($items as $it): ?>
                                            <div class="flex justify-between items-center text-[11px] gap-2">
                                                <span class="text-slate-300 font-semibold truncate"><?php echo htmlspecialchars($it['name'] ?? 'Plato'); ?></span>
                                                <span class="font-mono-numbers font-black text-orange-400 shrink-0 bg-orange-500/5 px-1.5 py-0.5 border border-orange-500/10 rounded">
                                                    <?php echo $it['quantity'] ?? 1; ?>x
                                                </span>
                                            </div>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </div>

                                <!-- Comanda Footer Actions -->
                                <div class="space-y-2 pt-2.5 border-t border-slate-800/50">
                                    <div class="flex justify-between items-center">
                                        <span class="text-[9px] text-slate-500 uppercase font-black">Total</span>
                                        <span class="font-black text-emerald-400 text-xs font-mono-numbers">S/ <?php echo number_format(floatval($o['total'] ?? 0), 2); ?></span>
                                    </div>
                                    
                                    <div class="pt-1">
                                        <?php if ($status !== 'entregado' && $status !== 'cancelado'): ?>
                                            <div class="space-y-1.5">
                                                <form action="/admin/index.php?view=pedidos" method="POST" class="w-full">
                                                    <input type="hidden" name="action" value="update_status">
                                                    <input type="hidden" name="id" value="<?php echo $o['id']; ?>">
                                                    <?php echo $actionHtml; ?>
                                                </form>
                                                <form action="/admin/index.php?view=pedidos" method="POST" class="w-full">
                                                    <input type="hidden" name="action" value="update_status">
                                                    <input type="hidden" name="id" value="<?php echo $o['id']; ?>">
                                                    <input type="hidden" name="status" value="cancelado">
                                                    <button type="submit" class="btn-kds-cancel">Cancelar</button>
                                                </form>
                                            </div>
                                        <?php else: ?>
                                            <?php echo $actionHtml; ?>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <!-- ========================================================================= -->
    <!-- MOBILE VIEW: TOUCH-FIRST CARDS (Visible only on lg-)                      -->
    <!-- ========================================================================= -->
    <div class="block lg:hidden space-y-4" id="php-orders-mobile-list">
        <?php if (empty($pedidos)): ?>
            <div class="p-8 text-center text-slate-500 font-semibold bg-[#121829] rounded-2xl border border-slate-800/80">No se encontraron órdenes en Supabase.</div>
        <?php else: ?>
            <?php foreach ($pedidos as $o): ?>
                <?php 
                $status = strtolower($o['status'] ?? 'recibido');
                $orderNum = $o['orderNumber'] ?? $o['id'];
                $items = [];
                try {
                    $items = json_decode($o['items'] ?? '[]', true);
                } catch(Exception $e) {}
                
                $stateColor = 'text-amber-400';
                if ($status === 'entregado' || $status === 'completado') $stateColor = 'text-emerald-400';
                elseif ($status === 'cancelado') $stateColor = 'text-red-400';
                elseif ($status === 'preparando') $stateColor = 'text-sky-400';
                
                $actionHtml = '';
                if ($status === 'recibido') {
                    $actionHtml = '<button type="submit" class="btn-kds-cook"><i data-lucide="chef-hat" class="w-3.5 h-3.5"></i> Cocinar</button><input type="hidden" name="status" value="preparando">';
                } elseif ($status === 'preparando') {
                    $actionHtml = '<button type="submit" class="btn-kds-dispatch"><i data-lucide="truck" class="w-3.5 h-3.5"></i> Despachar</button><input type="hidden" name="status" value="en_camino">';
                } elseif ($status === 'en_camino') {
                    $actionHtml = '<button type="submit" class="btn-kds-deliver"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Entregar</button><input type="hidden" name="status" value="entregado">';
                } else {
                    $actionHtml = '<span class="badge-dispatched"><i data-lucide="archive-restore" class="w-3 h-3 inline mr-1"></i> Despachado</span>';
                }
                ?>
                <div class="bg-[#121829] p-5 rounded-2xl border border-slate-800/80 space-y-4 shadow-md order-row-mobile" data-status="<?php echo $status; ?>">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="font-mono-numbers font-black text-white text-base">#<?php echo htmlspecialchars($orderNum); ?></span>
                            <h4 class="font-extrabold text-sm text-slate-200 mt-1"><?php echo htmlspecialchars($o['customerName'] ?? 'Cliente'); ?></h4>
                        </div>
                        <span class="font-black text-[10px] uppercase tracking-wider <?php echo $stateColor; ?>"><?php echo $status; ?></span>
                    </div>

                    <div class="space-y-1.5 py-2 border-y border-slate-800/50">
                        <?php if (is_array($items)): ?>
                            <?php foreach ($items as $it): ?>
                                <div class="flex justify-between text-xs text-slate-300">
                                    <span><?php echo htmlspecialchars($it['name'] ?? 'Plato'); ?></span>
                                    <span class="font-bold font-mono-numbers">x<?php echo $it['quantity'] ?? 1; ?></span>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-xs text-slate-400 font-bold">Total a Pagar</span>
                        <span class="text-sm font-black text-emerald-400 font-mono-numbers">S/ <?php echo number_format(floatval($o['total'] ?? 0), 2); ?></span>
                    </div>

                    <?php if ($status !== 'entregado' && $status !== 'cancelado'): ?>
                        <div class="pt-2 space-y-2">
                            <form action="/admin/index.php?view=pedidos" method="POST" class="w-full">
                                <input type="hidden" name="action" value="update_status">
                                <input type="hidden" name="id" value="<?php echo $o['id']; ?>">
                                <?php echo $actionHtml; ?>
                            </form>
                            <form action="/admin/index.php?view=pedidos" method="POST" class="w-full">
                                <input type="hidden" name="action" value="update_status">
                                <input type="hidden" name="id" value="<?php echo $o['id']; ?>">
                                <input type="hidden" name="status" value="cancelado">
                                <button type="submit" class="btn-kds-cancel">Cancelar</button>
                            </form>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
