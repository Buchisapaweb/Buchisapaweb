<?php
/**
 * BUCHISAPA BURGER & BROASTER - GESTIÓN DE PRODUCTOS
 */
require_once __DIR__ . '/../config/supabase.php';

$error = '';
$success = '';

// Procesar acciones de formulario si hay POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'create' || $action === 'edit') {
        $id = $_POST['id'] ?? null;
        $name = trim($_POST['name'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $price = floatval($_POST['price'] ?? 0);
        $stock = intval($_POST['stock'] ?? 0);
        $category = trim($_POST['category'] ?? 'broaster');
        
        $payload = [
            'name' => $name,
            'description' => $description,
            'price' => $price,
            'stock' => $stock,
            'category' => $category,
            'image' => $_POST['image_url'] ?? '/imagenes/productos/fallback.webp',
            'available' => ($_POST['available'] ?? 'true') === 'true'
        ];
        
        if ($action === 'create') {
            $payload['id'] = $_POST['id_form'] ?? '';
            $res = supabaseRequest('POST', 'products', $payload);
            if ($res['code'] >= 200 && $res['code'] < 300) {
                $success = '¡Plato agregado con éxito!';
            } else {
                $error = 'Error al crear en Supabase: Code ' . $res['code'];
            }
        } else {
            $res = supabaseRequest('PATCH', "products?id=eq.{$id}", $payload);
            if ($res['code'] >= 200 && $res['code'] < 300) {
                $success = '¡Plato actualizado con éxito!';
            } else {
                $error = 'Error al actualizar en Supabase: Code ' . $res['code'];
            }
        }
    } elseif ($action === 'delete') {
        $id = $_POST['id'] ?? null;
        if ($id) {
            $res = supabaseRequest('DELETE', "products?id=eq.{$id}");
            if ($res['code'] >= 200 && $res['code'] < 300) {
                $success = '¡Plato eliminado con éxito!';
            } else {
                $error = 'Error al eliminar de Supabase: Code ' . $res['code'];
            }
        }
    }
}

// Cargar catálogo de platos
$res = supabaseRequest('GET', 'products?select=*&order=category.asc');
$productos = $res['data'] ?? [];

// Cargar catálogo de categorías
$catRes = supabaseRequest('GET', 'categories?select=id,name');
$categorias = $catRes['data'] ?? [];
?>
<div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
            <h2 class="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span class="w-2 h-4 bg-orange-500 rounded-sm"></span>
                Platos y Menú (Productos)
            </h2>
            <p class="text-xs text-slate-400">Edita platos, precios, descripciones y controla el stock en tiempo real</p>
        </div>
        <button onclick="abrirCrearProductoModal()" class="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-md active-press self-start sm:self-auto">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Agregar Plato</span>
        </button>
    </div>

    <!-- Mensajes de Operación -->
    <?php if (!empty($success)): ?>
        <div class="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
            <i data-lucide="check-circle" class="w-4 h-4 shrink-0"></i>
            <span><?php echo $success; ?></span>
        </div>
    <?php endif; ?>
    <?php if (!empty($error)): ?>
        <div class="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
            <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
            <span><?php echo $error; ?></span>
        </div>
    <?php endif; ?>

    <!-- Real-time Interactive Filter Search Bar -->
    <div class="relative max-w-md animate-fade-in select-none">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
            <i data-lucide="search" class="w-4 h-4"></i>
        </span>
        <input type="text" id="productos-search" onkeyup="filterProductosTable()" placeholder="Buscar plato por nombre, descripción o categoría..." class="w-full bg-[#121829] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/10 transition-all premium-input">
    </div>

    <!-- Table Section (Desktop) -->
    <div class="hidden sm:block bg-[#121829] rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg animate-fade-in">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-[#0f1424]/60 border-b border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                        <th class="p-4">Imagen</th>
                        <th class="p-4">Plato / Nombre</th>
                        <th class="p-4">Categoría</th>
                        <th class="p-4 text-right">Precio</th>
                        <th class="p-4">Stock</th>
                        <th class="p-4">Estado</th>
                        <th class="p-4 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 text-xs text-slate-300">
                    <?php if (empty($productos)): ?>
                        <tr>
                            <td colspan="7" class="p-8 text-center text-slate-500 font-semibold">No hay productos en el catálogo de Supabase.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($productos as $p): ?>
                            <?php 
                            $stock = intval($p['stock'] ?? 0);
                            $isCrit = $stock <= 5;
                            $available = filter_var($p['available'] ?? true, FILTER_VALIDATE_BOOLEAN);
                            ?>
                            <tr class="desktop-producto-row hover:bg-slate-800/20 transition-colors premium-table-row">
                                <td class="p-4">
                                    <img src="<?php echo htmlspecialchars($p['image'] ?? '/imagenes/productos/fallback.webp'); ?>" class="w-11 h-11 rounded-lg object-cover border border-slate-800" alt="product" onerror="this.src='/imagenes/productos/fallback.webp'">
                                </td>
                                <td class="p-4">
                                    <span class="font-extrabold text-sm text-white block"><?php echo htmlspecialchars($p['name'] ?? ''); ?></span>
                                    <span class="text-[10px] text-slate-500 max-w-xs truncate block font-medium"><?php echo htmlspecialchars($p['description'] ?? 'Sin guarniciones descritas'); ?></span>
                                </td>
                                <td class="p-4">
                                    <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        <?php echo htmlspecialchars($p['category'] ?? 'broaster'); ?>
                                    </span>
                                </td>
                                <td class="p-4 font-bold text-emerald-400 text-right font-mono-numbers">S/ <?php echo number_format(floatval($p['price'] ?? 0), 2); ?></td>
                                <td class="p-4 font-mono-numbers">
                                    <span class="<?php echo $isCrit ? 'text-red-400 font-black' : 'text-slate-300 font-bold'; ?>">
                                        <?php echo $stock; ?> unids
                                    </span>
                                </td>
                                <td class="p-4">
                                    <span class="text-[10px] font-black uppercase tracking-wider <?php echo $available ? 'text-emerald-400' : 'text-slate-500'; ?>">
                                        <?php echo $available ? 'Disponible' : 'Agotado'; ?>
                                    </span>
                                </td>
                                <td class="p-4 text-center">
                                    <div class="flex items-center justify-center gap-2">
                                        <button onclick='abrirEditarProductoModal(<?php echo json_encode($p, JSON_HEX_APOS | JSON_HEX_QUOT); ?>)' class="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-all">
                                            <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                                        </button>
                                        <form action="/admin/index.php?view=productos" method="POST" class="inline" onsubmit="return confirm('¿Seguro que deseas eliminar este plato de la carta?')">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?php echo $p['id']; ?>">
                                            <button type="submit" class="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all">
                                                <i data-lucide="trash" class="w-3.5 h-3.5"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Mobile Card Grid (Mobile-Only Layout B / Touch-First) -->
    <div class="block sm:hidden space-y-4">
        <?php if (empty($productos)): ?>
            <div class="p-8 text-center text-slate-500 font-semibold bg-[#121829] rounded-2xl border border-slate-800/80">No hay productos en el catálogo.</div>
        <?php else: ?>
            <?php foreach ($productos as $p): ?>
                <?php 
                $stock = intval($p['stock'] ?? 0);
                $isCrit = $stock <= 5;
                $available = filter_var($p['available'] ?? true, FILTER_VALIDATE_BOOLEAN);
                ?>
                <div class="mobile-producto-card bg-[#121829] p-4 rounded-2xl border border-slate-800/80 flex gap-4 items-start shadow-md hover:border-slate-700/80 transition-colors premium-card">
                    <img src="<?php echo htmlspecialchars($p['image'] ?? '/imagenes/productos/fallback.webp'); ?>" class="w-20 h-20 rounded-xl object-cover border border-slate-800/80 shrink-0 select-none bg-[#0a0d16]" alt="product image" onerror="this.src='/imagenes/productos/fallback.webp'">
                    
                    <div class="flex-1 flex flex-col justify-between min-w-0 h-20">
                        <div class="min-w-0">
                            <div class="flex justify-between items-center gap-1.5">
                                <span class="text-[9px] font-black uppercase tracking-wider text-slate-500 truncate"><?php echo htmlspecialchars($p['category'] ?? 'broaster'); ?></span>
                                <span class="text-[9px] font-black uppercase tracking-wider <?php echo $available ? 'text-emerald-400' : 'text-slate-500'; ?> shrink-0 select-none"><?php echo $available ? 'Disponible' : 'Agotado'; ?></span>
                            </div>
                            <h3 class="font-extrabold text-xs text-white truncate mt-1"><?php echo htmlspecialchars($p['name'] ?? ''); ?></h3>
                            <p class="text-xs font-black text-orange-400 font-mono-numbers mt-1">S/ <?php echo number_format(floatval($p['price'] ?? 0), 2); ?></p>
                        </div>
                        
                        <div class="flex justify-between items-center pt-2 border-t border-slate-800/50">
                            <span class="text-[10px] font-mono-numbers <?php echo $isCrit ? 'text-red-400 font-black animate-pulse' : 'text-slate-400 font-bold'; ?>">
                                Stock: <?php echo $stock; ?> unids
                            </span>
                            
                            <div class="flex items-center gap-2">
                                <button onclick='abrirEditarProductoModal(<?php echo json_encode($p, JSON_HEX_APOS | JSON_HEX_QUOT); ?>)' class="w-8 h-8 flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white active:scale-90 transition-all" aria-label="Editar">
                                    <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                                </button>
                                <form action="/admin/index.php?view=productos" method="POST" class="inline" onsubmit="return confirm('¿Seguro que deseas eliminar este plato de la carta?')">
                                    <input type="hidden" name="action" value="delete">
                                    <input type="hidden" name="id" value="<?php echo $p['id']; ?>">
                                    <button type="submit" class="w-8 h-8 flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white active:scale-90 rounded-lg transition-all" aria-label="Eliminar">
                                        <i data-lucide="trash" class="w-3.5 h-3.5"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>

<!-- Modal Container Frame -->
<div id="modal-container" class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 hidden transition-opacity duration-150">
    <div id="modal-content" class="bg-[#121829] border border-slate-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative">
        <!-- Dynamic load -->
    </div>
</div>

<!-- Categories Data container -->
<div id="productos-categories-data" class="hidden" data-categories="<?php echo htmlspecialchars(json_encode($categorias)); ?>"></div>
