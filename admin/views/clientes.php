<?php
/**
 * BUCHISAPAWEB - Vista Clientes (public.perfiles)
 */
require_once __DIR__ . '/../config/supabase.php';

$res = supabaseRequest('GET', 'perfiles?select=*&order=created_at.desc');
$clientes = $res['data'] ?? [];
?>
<div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
            <h2 class="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span class="w-2 h-4 bg-orange-500 rounded-sm"></span>
                Clientes Registrados (public.perfiles)
            </h2>
            <p class="text-xs text-slate-400">Verifica cuentas, información de contacto, identificación (DNI/RUC) e historial de perfiles</p>
        </div>
        <div class="flex items-center gap-3">
            <span class="px-2.5 py-1 bg-orange-500/10 border border-orange-500/15 text-orange-400 text-[10px] font-black uppercase rounded-lg">
                <?php echo count($clientes); ?> perfiles
            </span>
        </div>
    </div>

    <!-- Real-time Interactive Filter Search Bar -->
    <div class="relative max-w-md animate-fade-in select-none">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
            <i data-lucide="search" class="w-4 h-4"></i>
        </span>
        <input type="text" id="clientes-search" onkeyup="filterClientesTable()" placeholder="Buscar cliente por nombre, DNI, teléfono o email..." class="w-full bg-[#121829] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/10 transition-all premium-input">
    </div>

    <!-- Data Table Card (Desktop) -->
    <div class="hidden md:block bg-[#121829] rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-[#0f1424]/60 border-b border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                        <th class="p-4">Identificación</th>
                        <th class="p-4">Nombre Completo</th>
                        <th class="p-4">Contacto</th>
                        <th class="p-4">Correo Electrónico</th>
                        <th class="p-4">Fecha de Registro</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 text-xs text-slate-300">
                    <?php if (empty($clientes)): ?>
                        <tr>
                            <td colspan="5" class="p-8 text-center text-slate-500 font-semibold">No se encontraron clientes registrados en la tabla perfiles de Supabase.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($clientes as $c): ?>
                            <?php 
                            $rawDate = $c['created_at'] ?? $c['createdAt'] ?? 'now';
                            $dateStr = date('d/m/Y h:i A', strtotime($rawDate));
                            ?>
                            <tr class="desktop-cliente-row hover:bg-slate-800/20 transition-colors premium-table-row">
                                <td class="p-4 font-mono font-bold text-slate-400">
                                    <?php echo htmlspecialchars(($c['docType'] ?? 'DNI') . ' : ' . ($c['docNumber'] ?? 'No especificado')); ?>
                                </td>
                                <td class="p-4">
                                    <span class="font-extrabold text-sm text-white block"><?php echo htmlspecialchars($c['name'] ?? 'Usuario Sin Nombre'); ?></span>
                                </td>
                                <td class="p-4 font-mono-numbers text-slate-300">
                                    <?php echo htmlspecialchars($c['phone'] ?? 'Sin teléfono registrado'); ?>
                                </td>
                                <td class="p-4 font-mono text-slate-400 font-medium">
                                    <?php echo htmlspecialchars($c['email'] ?? 'Sin correo electrónico'); ?>
                                </td>
                                <td class="p-4 text-slate-500 font-mono-numbers">
                                    <?php echo $dateStr; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Mobile Card List (Mobile) -->
    <div class="block md:hidden space-y-4">
        <?php if (empty($clientes)): ?>
            <div class="p-8 text-center text-slate-500 font-semibold bg-[#121829] rounded-2xl border border-slate-800/80">
                No se encontraron clientes registrados en Supabase.
            </div>
        <?php else: ?>
            <?php foreach ($clientes as $c): ?>
                <?php 
                $rawDate = $c['created_at'] ?? $c['createdAt'] ?? 'now';
                $dateStr = date('d/m/Y h:i A', strtotime($rawDate));
                ?>
                <div class="mobile-cliente-card bg-[#121829] p-5 rounded-2xl border border-slate-800/80 space-y-3.5 shadow-md premium-card">
                    <div class="flex justify-between items-start">
                        <div class="min-w-0">
                            <span class="text-[9px] font-mono font-black text-orange-400 bg-orange-500/10 border border-orange-500/15 px-2 py-0.5 rounded uppercase tracking-wider">
                                <?php echo htmlspecialchars($c['docType'] ?? 'DNI'); ?>: <?php echo htmlspecialchars($c['docNumber'] ?? 'No registrado'); ?>
                            </span>
                            <h3 class="font-extrabold text-sm text-white mt-2.5 truncate"><?php echo htmlspecialchars($c['name'] ?? 'Usuario Sin Nombre'); ?></h3>
                        </div>
                        <span class="text-[10px] text-slate-500 font-mono-numbers shrink-0 select-none"><?php echo date('d/m/Y', strtotime($rawDate)); ?></span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/50 text-[11px]">
                        <div class="min-w-0">
                            <span class="text-slate-500 block text-[9px] uppercase tracking-wider font-extrabold mb-0.5">Celular</span>
                            <span class="font-bold text-slate-300 font-mono-numbers truncate block">
                                <?php echo htmlspecialchars($c['phone'] ?? 'Sin registro'); ?>
                            </span>
                        </div>
                        <div class="min-w-0">
                            <span class="text-slate-500 block text-[9px] uppercase tracking-wider font-extrabold mb-0.5">Correo</span>
                            <span class="font-medium text-slate-300 font-mono truncate block" title="<?php echo htmlspecialchars($c['email'] ?? ''); ?>">
                                <?php echo htmlspecialchars($c['email'] ?? 'Sin registro'); ?>
                            </span>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
