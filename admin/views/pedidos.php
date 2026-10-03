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
    // Mapear completado a entregado para simplicidad del flujo
    if ($st === 'completado') $st = 'entregado';
    if (array_key_exists($st, $pedidos_por_estado)) {
        $pedidos_por_estado[$st][] = $o;
    }
}
?>
<div class="space-y-6">
    <!-- Header Area conforming to Top Bar breadcrumb style but as view headline -->
    <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4 animate-fade-in">
        <div>
            <h2 class="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span class="w-2 h-4 bg-orange-500 rounded-sm"></span>
                Pedidos y Comandas
            </h2>
            <p class="text-xs text-slate-400">Controla las comandas, despacha entregas y monitorea la cocina en tiempo real</p>
        </div>
        
        <!-- Controls panel (Responsive layout) -->
        <div class="flex flex-wrap items-center gap-3">
            <!-- 1. Horizontal Scrollable Status Swiper -->
            <div class="flex items-center gap-1.5 bg-[#121829] p-1 rounded-xl border border-slate-800/80 overflow-x-auto whitespace-nowrap scrollbar-none max-w-full sm:max-w-none select-none">
                <button onclick="filterPHPOrders('all')" class="order-php-btn px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold transition-all shadow shrink-0 active-press">Todos</button>
                <button onclick="filterPHPOrders('recibido')" class="order-php-btn px-4 py-2 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all shrink-0 active-press">Recibidos</button>
                <button onclick="filterPHPOrders('preparando')" class="order-php-btn px-4 py-2 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all shrink-0 active-press">Cocina</button>
                <button onclick="filterPHPOrders('en_camino')" class="order-php-btn px-4 py-2 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all shrink-0 active-press">En Camino</button>
                <button onclick="filterPHPOrders('entregado')" class="order-php-btn px-4 py-2 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all shrink-0 active-press">Entregados</button>
            </div>

            <!-- 2. Desktop View Selector (Table vs Kanban) - Conforming to Interactive Filter tab rules -->
            <div class="hidden lg:flex items-center bg-[#121829] p-1 rounded-xl border border-slate-800/80 gap-1 select-none text-xs shrink-0">
                <button onclick="toggleDesktopView('table')" id="btn-view-table" class="px-3.5 py-1.5 rounded-lg font-bold transition-all text-white bg-slate-800 flex items-center gap-1.5 active-press shadow-sm">
                    <i data-lucide="list" class="w-3.5 h-3.5"></i>
                    <span>Tabla</span>
                </button>
                <button onclick="toggleDesktopView('kanban')" id="btn-view-kanban" class="px-3.5 py-1.5 rounded-lg font-bold transition-all text-slate-400 hover:text-white flex items-center gap-1.5 active-press">
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
                            
                            // Action controls
                            $actionHtml = '';
                            if ($status === 'recibido') {
                                $actionHtml = '<button type="submit" class="w-full bg-sky-600 hover:bg-sky-500 text-white font-extrabold py-1.5 px-3 rounded-xl text-[10px] transition-all">Iniciar Cocina</button><input type="hidden" name="status" value="preparando">';
                            } elseif ($status === 'preparando') {
                                $actionHtml = '<button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-1.5 px-3 rounded-xl text-[10px] transition-all">Despachar</button><input type="hidden" name="status" value="en_camino">';
                            } elseif ($status === 'en_camino') {
                                $actionHtml = '<button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-1.5 px-3 rounded-xl text-[10px] transition-all">Entregado</button><input type="hidden" name="status" value="entregado">';
                            } else {
                                $actionHtml = '<span class="text-slate-500 text-[10px] block text-center font-bold">Despachado</span>';
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
                                            <button type="submit" class="w-full mt-1 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white font-bold py-1 px-3 rounded-lg text-[9px] transition-all">Cancelar</button>
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
            <div class="bg-[#0f1424]/40 rounded-2xl border border-slate-800/80 p-4 flex flex-col h-[calc(100vh-230px)] min-w-[270px] max-w-[320px] shrink-0">
                <!-- Column Header -->
                <div class="flex items-center justify-between mb-4 pb-3.5 border-b border-slate-800/60 shrink-0">
                    <h3 class="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
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
                                $actionHtml = '<button type="submit" class="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-extrabold py-2 px-3 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md active-press"><i data-lucide="chef-hat" class="w-3.5 h-3.5"></i> Cocinar</button><input type="hidden" name="status" value="preparando">';
                            } elseif ($status === 'preparando') {
                                $actionHtml = '<button type="submit" class="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold py-2 px-3 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md active-press"><i data-lucide="truck" class="w-3.5 h-3.5"></i> Despachar</button><input type="hidden" name="status" value="en_camino">';
                            } elseif ($status === 'en_camino') {
                                $actionHtml = '<button type="submit" class="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold py-2 px-3 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md active-press"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Entregar</button><input type="hidden" name="status" value="entregado">';
                            } else {
                                $actionHtml = '<span class="text-slate-500 text-[10px] block text-center font-black py-2 bg-slate-800/10 border border-slate-800/40 rounded-xl select-none uppercase tracking-widest"><i data-lucide="archive-restore" class="w-3 h-3 inline mr-1"></i> Despachado</span>';
                            }
                        ?>
                            <!-- Kanban Comanda Card -->
                            <div class="bg-[#121829] border border-slate-800/80 p-4 rounded-xl space-y-3.5 shadow-md hover:border-slate-700/80 transition-colors">
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
                                                    <button type="submit" class="w-full bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white font-extrabold py-1 rounded-lg text-[9px] transition-all active-press">Cancelar</button>
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
                
                $stateColor = 'bg-amber-500/10 border-amber-500/25 text-amber-400';
                if ($status === 'entregado' || $status === 'completado') $stateColor = 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400';
                elseif ($status === 'cancelado') $stateColor = 'bg-red-500/10 border-red-500/25 text-red-400';
                elseif ($status === 'preparando') $stateColor = 'bg-sky-500/10 border-sky-500/25 text-sky-400';
                
                // Action controls for mobile (generous hitboxes for rapid tapping)
                $actionHtml = '';
                if ($status === 'recibido') {
                    $actionHtml = '<button type="submit" class="w-full bg-sky-600 hover:bg-sky-500 text-white font-extrabold h-11 rounded-xl text-xs transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-1.5"><i data-lucide="chef-hat" class="w-4 h-4"></i> Iniciar Cocina</button><input type="hidden" name="status" value="preparando">';
                } elseif ($status === 'preparando') {
                    $actionHtml = '<button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold h-11 rounded-xl text-xs transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-1.5"><i data-lucide="truck" class="w-4 h-4"></i> Despachar</button><input type="hidden" name="status" value="en_camino">';
                } elseif ($status === 'en_camino') {
                    $actionHtml = '<button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold h-11 rounded-xl text-xs transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-1.5"><i data-lucide="check-circle" class="w-4 h-4"></i> Entregado</button><input type="hidden" name="status" value="entregado">';
                } else {
                    $actionHtml = '<span class="text-slate-500 text-xs block text-center font-bold py-2.5 border border-slate-800/80 bg-slate-800/25 rounded-xl select-none">Completado</span>';
                }
                ?>
                <div class="bg-[#121829] p-5 rounded-2xl border border-slate-800/80 space-y-4 shadow-md order-row-mobile" data-status="<?php echo $status; ?>">
                    <div class="flex justify-between items-start">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-mono-numbers font-black text-white text-base">#<?php echo htmlspecialchars($orderNum); ?></span>
                                <span class="px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider <?php echo $stateColor; ?>">
                                    <?php echo $status; ?>
                                </span>
                            </div>
                            <h3 class="font-extrabold text-sm text-white mt-2 truncate"><?php echo htmlspecialchars($o['customerName'] ?? 'Cliente'); ?></h3>
                            <p class="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                                <span class="font-mono-numbers"><?php echo htmlspecialchars($o['customerPhone'] ?? 'Sin teléfono'); ?></span>
                                <span class="text-slate-700 font-bold">&bull;</span>
                                <span><?php echo isset($o['created_at']) ? date('h:i A', strtotime($o['created_at'])) : 'Ahora'; ?></span>
                            </p>
                        </div>
                        <div class="text-right shrink-0 select-none">
                            <span class="text-[9px] font-black uppercase tracking-wider text-slate-500 block"><?php echo htmlspecialchars($o['orderType'] ?? 'Delivery'); ?></span>
                            <span class="text-[9px] font-mono text-slate-400 block mt-0.5"><?php echo htmlspecialchars($o['paymentMethod'] ?? 'Yape'); ?></span>
                        </div>
                    </div>

                    <!-- Items List -->
                    <div class="bg-[#0f1424]/60 p-3 rounded-xl border border-slate-800/50 space-y-2">
                        <?php if (is_array($items)): ?>
                            <?php foreach ($items as $it): ?>
                                <div class="flex justify-between items-center text-xs gap-4">
                                    <span class="text-slate-300 font-bold truncate"><?php echo htmlspecialchars($it['name'] ?? 'Plato'); ?></span>
                                    <span class="font-mono-numbers font-black text-orange-400 shrink-0 bg-orange-500/5 px-2 py-0.5 border border-orange-500/10 rounded-md">
                                        <?php echo $it['quantity'] ?? 1; ?>x
                                    </span>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>

                    <!-- Price & Actions footer (Thumb-Zone action stack) -->
                    <div class="flex justify-between items-center pt-3.5 border-t border-slate-800/60 gap-4">
                        <div class="shrink-0">
                            <span class="text-[9px] text-slate-500 block uppercase tracking-wider font-extrabold mb-0.5">Total Pago</span>
                            <span class="font-black text-emerald-400 text-sm font-mono-numbers">S/ <?php echo number_format(floatval($o['total'] ?? 0), 2); ?></span>
                        </div>
                        
                        <div class="flex-1 flex items-center gap-2 justify-end max-w-[200px]">
                            <?php if ($status !== 'entregado' && $status !== 'cancelado'): ?>
                                <div class="flex flex-col gap-1.5 w-full">
                                    <form action="/admin/index.php?view=pedidos" method="POST" class="w-full">
                                        <input type="hidden" name="action" value="update_status">
                                        <input type="hidden" name="id" value="<?php echo $o['id']; ?>">
                                        <?php echo $actionHtml; ?>
                                    </form>
                                    <form action="/admin/index.php?view=pedidos" method="POST" class="w-full">
                                        <input type="hidden" name="action" value="update_status">
                                        <input type="hidden" name="id" value="<?php echo $o['id']; ?>">
                                        <input type="hidden" name="status" value="cancelado">
                                        <button type="submit" class="w-full h-8 flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-extrabold rounded-lg text-[10px] transition-all active:scale-[0.98]">
                                            <i data-lucide="slash" class="w-3.5 h-3.5 mr-1"></i> Cancelar
                                        </button>
                                    </form>
                                </div>
                            <?php else: ?>
                                <div class="w-full">
                                    <?php echo $actionHtml; ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>

<script>
// Mantener estado del modo de vista actual en localStorage para recordar preferencia
let activeDesktopView = localStorage.getItem('buchisapa_desktop_view') || 'table';

document.addEventListener('DOMContentLoaded', () => {
    // Restaurar preferencia guardada
    applyDesktopView(activeDesktopView);
});

function toggleDesktopView(mode) {
    activeDesktopView = mode;
    localStorage.setItem('buchisapa_desktop_view', mode);
    applyDesktopView(mode);
}

function applyDesktopView(mode) {
    const tableDiv = document.getElementById('desktop-table-card');
    const kanbanDiv = document.getElementById('desktop-kanban-board');
    const btnTable = document.getElementById('btn-view-table');
    const btnKanban = document.getElementById('btn-view-kanban');
    
    if (!tableDiv || !kanbanDiv) return;
    
    if (mode === 'table') {
        tableDiv.classList.remove('hidden');
        kanbanDiv.classList.add('hidden');
        
        // Actualizar estados visuales de los botones con diseño Premium
        btnTable.className = "px-3.5 py-1.5 rounded-lg font-bold transition-all text-white bg-slate-800 flex items-center gap-1.5 active-press shadow-sm";
        btnKanban.className = "px-3.5 py-1.5 rounded-lg font-bold transition-all text-slate-400 hover:text-white flex items-center gap-1.5 active-press";
    } else {
        tableDiv.classList.add('hidden');
        kanbanDiv.classList.remove('hidden');
        
        btnTable.className = "px-3.5 py-1.5 rounded-lg font-bold transition-all text-slate-400 hover:text-white flex items-center gap-1.5 active-press";
        btnKanban.className = "px-3.5 py-1.5 rounded-lg font-bold transition-all text-white bg-slate-800 flex items-center gap-1.5 active-press shadow-sm";
    }
}

function filterPHPOrders(status) {
    const btns = document.querySelectorAll('.order-php-btn');
    btns.forEach(b => {
        b.className = "order-php-btn px-4 py-2 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all shrink-0 active-press";
    });
    event.currentTarget.className = "order-php-btn px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold transition-all shadow shrink-0 active-press";

    // Filtrar filas de tabla (Desktop)
    const rows = document.querySelectorAll('.order-row');
    rows.forEach(r => {
        if (status === 'all' || r.getAttribute('data-status') === status) {
            r.classList.remove('hidden');
        } else {
            r.classList.add('hidden');
        }
    });

    // Filtrar tarjetas comanda en móviles
    const mobileRows = document.querySelectorAll('.order-row-mobile');
    mobileRows.forEach(r => {
        if (status === 'all' || r.getAttribute('data-status') === status) {
            r.classList.remove('hidden');
        } else {
            r.classList.add('hidden');
        }
    });
}
</script>
