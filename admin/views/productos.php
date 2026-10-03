<?php
/**
 * BUCHISAPA BURGER & BROASTER - GESTIÓN INTEGRAL DE PLATOS Y MENÚ
 * admin/views/productos.php
 * Catálogo completo dividido por categorías con acompañamientos, cremas, imágenes, precios y stock
 */
require_once __DIR__ . '/../config/supabase.php';

$error = '';
$success = '';

// Procesar acciones de formulario si hay POST en entorno PHP
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'create' || $action === 'edit') {
        $id = $_POST['id'] ?? ($_POST['id_form'] ?? ('prod-' . time()));
        $name = trim($_POST['name'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $price = floatval($_POST['price'] ?? 0);
        $stock = intval($_POST['stock'] ?? 25);
        $category = trim($_POST['category'] ?? 'hamburguesas');
        $badge = trim($_POST['badge'] ?? '');
        $available = ($_POST['available'] ?? 'true') === 'true';
        $image = trim($_POST['image_url'] ?? '/imagenes/productos/fallback.webp');

        // Procesar acompañamientos
        $accRaw = $_POST['accompaniments'] ?? '';
        $accompaniments = [];
        if (is_array($accRaw)) {
            $accompaniments = $accRaw;
        } elseif (!empty($accRaw)) {
            $lines = explode("\n", str_replace("\r", "", $accRaw));
            foreach ($lines as $line) {
                $sub = explode(",", $line);
                foreach ($sub as $item) {
                    $item = trim($item);
                    if (!empty($item)) $accompaniments[] = $item;
                }
            }
        }

        // Procesar cremas
        $cremas = $_POST['cremas'] ?? [];
        if (!is_array($cremas)) {
            $cremas = !empty($cremas) ? explode(",", $cremas) : [];
        }

        $payload = [
            'name' => $name,
            'description' => $description,
            'price' => $price,
            'stock' => $stock,
            'category' => $category,
            'category_id' => $category,
            'badge' => !empty($badge) ? $badge : null,
            'image' => $image,
            'available' => $available,
            'accompaniments' => $accompaniments,
            'cremas' => $cremas,
            'includes_sauces' => count($cremas) > 0
        ];
        
        $jsonPath = __DIR__ . '/../../data/products.json';
        if (file_exists($jsonPath)) {
            $productsList = json_decode(file_get_contents($jsonPath), true) ?: [];
            if ($action === 'create') {
                $payload['id'] = $id;
                array_unshift($productsList, $payload);
                $success = '¡Plato agregado con éxito a la carta!';
            } else {
                $payload['id'] = $id;
                $found = false;
                foreach ($productsList as $k => $item) {
                    if (($item['id'] ?? '') === $id) {
                        $productsList[$k] = array_merge($item, $payload);
                        $found = true;
                        break;
                    }
                }
                if (!$found) $productsList[] = $payload;
                $success = '¡Plato actualizado con éxito!';
            }
            file_put_contents($jsonPath, json_encode($productsList, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }

        // Opcional sincronizar en segundo plano con Supabase si está disponible
        if ($action === 'create') {
            supabaseRequest('POST', 'products', array_merge(['id' => $id], $payload));
        } else {
            supabaseRequest('PATCH', "products?id=eq.{$id}", $payload);
        }
    } elseif ($action === 'delete') {
        $id = $_POST['id'] ?? null;
        if ($id) {
            $jsonPath = __DIR__ . '/../../data/products.json';
            if (file_exists($jsonPath)) {
                $productsList = json_decode(file_get_contents($jsonPath), true) ?: [];
                $productsList = array_values(array_filter($productsList, fn($p) => ($p['id'] ?? '') !== $id));
                file_put_contents($jsonPath, json_encode($productsList, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                $success = '¡Plato eliminado con éxito!';
            }
            supabaseRequest('DELETE', "products?id=eq.{$id}");
        }
    }
}

// Cargar catálogo de categorías oficial (10 categorías)
$categoriasDefinidas = [
    ['id' => 'promociones',       'name' => '⭐ PROMOCIONES',               'icon' => 'sparkles',  'color' => '#f59e0b', 'desc' => 'Combos especiales, ofertas de la semana y paquetes familiares.'],
    ['id' => 'alitas',            'name' => 'ALITAS',                       'icon' => 'flame',     'color' => '#ef4444', 'desc' => 'Alitas crujientes en salsa acevichada, BBQ y cremas de la casa.'],
    ['id' => 'bebidas',           'name' => 'BEBIDAS',                      'icon' => 'cup-soda',  'color' => '#06b6d4', 'desc' => 'Gaseosas heladas, agua mineral y bebidas embotelladas.'],
    ['id' => 'broaster',          'name' => 'BROASTER',                     'icon' => 'drumstick', 'color' => '#f97316', 'desc' => 'Pollo broaster ultra crocante con papas doradas y cremas.'],
    ['id' => 'hamburguesas',      'name' => 'HAMBURGUESAS',                 'icon' => 'beef',      'color' => '#eab308', 'desc' => 'Hamburguesas artesanales, choripanes y sándwiches especiales.'],
    ['id' => 'infusiones',        'name' => 'INFUSIONES',                   'icon' => 'coffee',    'color' => '#10b981', 'desc' => 'Infusiones calientes, café aromático pasado y manzanilla.'],
    ['id' => 'platos-amazonicos', 'name' => 'PLATOS AMAZÓNICOS',            'icon' => 'utensils',  'color' => '#8b5cf6', 'desc' => 'Auténticos sabores de la selva: tacacho, cecina, chorizo y patacones.'],
    ['id' => 'refrescos',         'name' => 'REFRESCOS',                    'icon' => 'glass-water','color' => '#3b82f6', 'desc' => 'Refrescos naturales de frutas amazónicas: cocona, aguajina y maracuyá.'],
    ['id' => 'salchipapas',       'name' => 'SALCHIPAPAS Y SALCHIBROASTERS', 'icon' => 'layers',    'color' => '#ec4899', 'desc' => 'Papas crocantes, salchichas frankfurter y combinaciones broaster.'],
    ['id' => 'adicional',         'name' => 'ADICIONAL',                    'icon' => 'plus-circle','color' => '#94a3b8', 'desc' => 'Porciones extra, salsas especiales, cremas adicionales y guarniciones.']
];

// Cargar catálogo de productos: Supabase o respaldo local data/products.json
$res = supabaseRequest('GET', 'products?select=*&order=category.asc');
$productos = is_array($res['data'] ?? null) && count($res['data']) > 0 ? $res['data'] : [];

if (empty($productos)) {
    $jsonPath = __DIR__ . '/../../data/products.json';
    if (file_exists($jsonPath)) {
        $productos = json_decode(file_get_contents($jsonPath), true) ?: [];
    }
}

// Contadores globales
$totalProductos = count($productos);
$totalDisponibles = count(array_filter($productos, fn($p) => ($p['available'] ?? true) === true || ($p['available'] ?? 'true') === 'true'));
$totalCriticos = count(array_filter($productos, fn($p) => intval($p['stock'] ?? 0) <= 5));
?>
<div class="space-y-6 animate-fade-in pb-12">
    <!-- Header Principal -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/40 select-none">
        <div>
            <div class="flex items-center gap-2.5">
                <span class="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">Platos y Menú (Productos)</h2>
            </div>
            <p class="text-xs text-slate-400 mt-1">Gestión integral de la carta: categorías, acompañamientos, cremas, precios y stock en tiempo real</p>
        </div>
        
        <div class="flex items-center gap-3">
            <button onclick="abrirCrearProductoModal()" class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-xl text-xs font-black transition-all shadow-lg active-press">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Agregar Plato</span>
            </button>
        </div>
    </div>

    <!-- Mensajes de Operación Flash -->
    <?php if (!empty($success)): ?>
        <div class="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in shadow-md">
            <i data-lucide="check-circle" class="w-4 h-4 shrink-0"></i>
            <span><?php echo $success; ?></span>
        </div>
    <?php endif; ?>
    <?php if (!empty($error)): ?>
        <div class="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in shadow-md">
            <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
            <span><?php echo $error; ?></span>
        </div>
    <?php endif; ?>

    <!-- Métricas Rápidas del Catálogo -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 select-none">
        <div class="p-3.5 bg-[#0f1424] rounded-xl border border-slate-800/80">
            <span class="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Total de Platos</span>
            <span class="text-lg font-black text-white font-mono-numbers block mt-0.5" id="stat-total-platos"><?php echo $totalProductos; ?> platos</span>
        </div>
        <div class="p-3.5 bg-[#0f1424] rounded-xl border border-slate-800/80">
            <span class="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Categorías</span>
            <span class="text-lg font-black text-orange-400 font-mono-numbers block mt-0.5">10 líneas</span>
        </div>
        <div class="p-3.5 bg-[#0f1424] rounded-xl border border-slate-800/80">
            <span class="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Disponibles</span>
            <span class="text-lg font-black text-emerald-400 font-mono-numbers block mt-0.5"><?php echo $totalDisponibles; ?> activos</span>
        </div>
        <div class="p-3.5 bg-[#0f1424] rounded-xl border border-slate-800/80">
            <span class="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Stock Crítico (≤ 5)</span>
            <span class="text-lg font-black <?php echo $totalCriticos > 0 ? 'text-red-400' : 'text-slate-400'; ?> font-mono-numbers block mt-0.5"><?php echo $totalCriticos; ?> platos</span>
        </div>
    </div>

    <!-- Barra de Búsqueda y Filtros de Categorías -->
    <div class="space-y-3 select-none">
        <div class="relative max-w-lg">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <i data-lucide="search" class="w-4 h-4"></i>
            </span>
            <input type="text" id="productos-search" oninput="filtrarPlatos()" placeholder="Buscar por nombre, acompañamiento, cremas o descripción..." class="w-full bg-[#121829] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all">
        </div>

        <!-- Pestañas Horizontales de Categorías -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none" id="categories-filter-bar">
            <button type="button" onclick="seleccionarFiltroCategoria('all')" class="category-tab-btn active px-3 py-1.5 rounded-lg text-[11px] font-black transition-all shrink-0" data-cat="all">
                Todos (<?php echo $totalProductos; ?>)
            </button>
            <?php foreach ($categoriasDefinidas as $cat): ?>
                <?php 
                $countInCat = count(array_filter($productos, fn($p) => ($p['category_id'] ?? $p['category'] ?? '') === $cat['id']));
                ?>
                <button type="button" onclick="seleccionarFiltroCategoria('<?php echo $cat['id']; ?>')" class="category-tab-btn px-3 py-1.5 rounded-lg text-[11px] font-black transition-all shrink-0 text-slate-400 hover:text-white bg-[#0f1424] border border-slate-800" data-cat="<?php echo $cat['id']; ?>">
                    <?php echo $cat['name']; ?> (<?php echo $countInCat; ?>)
                </button>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- SECCIONES DIVIDIDAS POR CATEGORÍAS -->
    <div class="space-y-10" id="productos-container">
        <?php foreach ($categoriasDefinidas as $cat): ?>
            <?php 
            $catId = $cat['id'];
            $platosEnCat = array_values(array_filter($productos, fn($p) => ($p['category_id'] ?? $p['category'] ?? '') === $catId));
            ?>
            <section class="category-block space-y-4" id="cat-section-<?php echo $catId; ?>" data-cat-id="<?php echo $catId; ?>">
                
                <!-- Encabezado de la Categoría -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                    <div class="flex items-center gap-2.5">
                        <span class="w-3 h-3 rounded-full shrink-0" style="background-color: <?php echo $cat['color']; ?>; box-shadow: 0 0 10px <?php echo $cat['color']; ?>80;"></span>
                        <h3 class="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <?php echo $cat['name']; ?>
                        </h3>
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase text-slate-300 bg-slate-800/60 border border-slate-700/60">
                            <?php echo count($platosEnCat); ?> platos
                        </span>
                    </div>
                    <p class="text-[11px] text-slate-400 italic"><?php echo $cat['desc']; ?></p>
                </div>

                <!-- Grid de Platos de esta categoría -->
                <?php if (empty($platosEnCat)): ?>
                    <div class="p-6 text-center text-slate-500 text-xs font-semibold bg-[#101424] rounded-xl border border-slate-800/60 empty-cat-notice">
                        No hay platos registrados en esta categoría aún.
                    </div>
                <?php else: ?>
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <?php foreach ($platosEnCat as $p): ?>
                            <?php 
                            $id = $p['id'] ?? '';
                            $name = $p['name'] ?? 'Sin nombre';
                            $desc = $p['description'] ?? 'Delicioso plato preparado con ingredientes frescos.';
                            $price = floatval($p['price'] ?? 0);
                            $stock = intval($p['stock'] ?? 25);
                            $badge = $p['badge'] ?? '';
                            $image = !empty($p['image']) ? $p['image'] : '/imagenes/productos/fallback.webp';
                            $available = ($p['available'] ?? true) === true || ($p['available'] ?? 'true') === 'true';
                            $isCrit = $stock <= 5;
                            $accompaniments = is_array($p['accompaniments'] ?? null) ? $p['accompaniments'] : [];
                            $cremas = is_array($p['cremas'] ?? null) ? $p['cremas'] : [];
                            ?>
                            <div class="producto-card bg-[#111728] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all duration-200 shadow-md relative overflow-hidden group select-none" data-search-target="<?php echo strtolower($name . ' ' . $desc . ' ' . implode(' ', $accompaniments) . ' ' . implode(' ', $cremas)); ?>">
                                
                                <div class="space-y-3">
                                    <!-- Cabecera de la Tarjeta: Imagen + Datos Principales -->
                                    <div class="flex gap-3">
                                        <div class="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-[#0a0d16]">
                                            <img src="<?php echo htmlspecialchars($image); ?>" alt="<?php echo htmlspecialchars($name); ?>" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='/imagenes/productos/fallback.webp'">
                                            <?php if (!empty($badge)): ?>
                                                <span class="absolute top-1 left-1 px-1.5 py-0.5 bg-orange-600/90 text-[8px] font-black text-white uppercase rounded tracking-wider shadow">
                                                    <?php echo htmlspecialchars($badge); ?>
                                                </span>
                                            <?php endif; ?>
                                        </div>

                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-start justify-between gap-1">
                                                <h4 class="font-black text-sm text-white truncate leading-tight"><?php echo htmlspecialchars($name); ?></h4>
                                                <span class="font-mono-numbers font-black text-sm text-emerald-400 shrink-0">S/ <?php echo number_format($price, 2); ?></span>
                                            </div>

                                            <div class="flex items-center gap-2 mt-1">
                                                <span class="inline-flex items-center gap-1 text-[10px] font-mono-numbers font-bold <?php echo $isCrit ? 'text-red-400 animate-pulse' : 'text-slate-400'; ?>">
                                                    <i data-lucide="package" class="w-3 h-3"></i> Stock: <?php echo $stock; ?>
                                                </span>
                                                <span class="text-slate-600">·</span>
                                                <span class="text-[9px] font-black uppercase <?php echo $available ? 'text-emerald-400' : 'text-slate-500'; ?>">
                                                    <?php echo $available ? 'Disponible' : 'Agotado'; ?>
                                                </span>
                                            </div>

                                            <p class="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed"><?php echo htmlspecialchars($desc); ?></p>
                                        </div>
                                    </div>

                                    <!-- Acompañamientos -->
                                    <div class="pt-2.5 border-t border-slate-800/60">
                                        <span class="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                                            <i data-lucide="utensils-crossed" class="w-2.5 h-2.5 inline mr-1 text-orange-400"></i> Acompañamientos:
                                        </span>
                                        <?php if (!empty($accompaniments)): ?>
                                            <div class="flex flex-wrap gap-1">
                                                <?php foreach ($accompaniments as $acc): ?>
                                                    <span class="text-[9px] font-bold px-1.5 py-0.5 bg-[#0a0d16] border border-slate-800 text-slate-300 rounded">
                                                        <?php echo htmlspecialchars($acc); ?>
                                                    </span>
                                                <?php endforeach; ?>
                                            </div>
                                        <?php else: ?>
                                            <span class="text-[9px] text-slate-500 italic">Sin acompañamiento directo (Bebida / Individual)</span>
                                        <?php endif; ?>
                                    </div>

                                    <!-- Cremas de la Casa -->
                                    <div class="pt-2 border-t border-slate-800/60">
                                        <span class="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                                            <i data-lucide="sparkles" class="w-2.5 h-2.5 inline mr-1 text-yellow-400"></i> Cremas incluidas:
                                        </span>
                                        <?php if (!empty($cremas)): ?>
                                            <div class="flex flex-wrap gap-1">
                                                <?php foreach ($cremas as $crema): ?>
                                                    <span class="text-[9px] font-bold px-1.5 py-0.5 bg-orange-950/20 border border-orange-900/40 text-orange-300 rounded">
                                                        <?php echo htmlspecialchars($crema); ?>
                                                    </span>
                                                <?php endforeach; ?>
                                            </div>
                                        <?php else: ?>
                                            <span class="text-[9px] text-slate-500 italic">No incluye cremas</span>
                                        <?php endif; ?>
                                    </div>
                                </div>

                                <!-- Acciones del Plato -->
                                <div class="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/60">
                                    <span class="text-[9px] font-mono-numbers text-slate-500 font-bold">ID: <?php echo htmlspecialchars($id); ?></span>
                                    
                                    <div class="flex items-center gap-2">
                                        <button type="button" onclick='abrirEditarProductoModal(<?php echo json_encode($p, JSON_HEX_APOS | JSON_HEX_QUOT); ?>)' class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active-press" title="Editar plato">
                                            <i data-lucide="edit-3" class="w-3 h-3 text-orange-400"></i>
                                            <span>Editar</span>
                                        </button>

                                        <form action="/admin/index.php?view=productos" method="POST" class="inline" onsubmit="return confirm('¿Seguro que deseas eliminar «<?php echo htmlspecialchars(addslashes($name)); ?>» de la carta?')">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?php echo htmlspecialchars($id); ?>">
                                            <button type="submit" class="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all active-press" title="Eliminar plato">
                                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </section>
        <?php endforeach; ?>
    </div>
</div>

<!-- Modal Container Frame -->
<div id="modal-container" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden transition-opacity duration-150 overflow-y-auto">
    <div id="modal-content" class="bg-[#121829] border border-slate-800 p-6 rounded-2xl w-full max-w-xl shadow-2xl relative my-8">
        <!-- Contenido dinámico inyectado por productos.js -->
    </div>
</div>

<!-- Contenedor con catálogo completo de categorías para productos.js -->
<div id="productos-categories-data" class="hidden" data-categories="<?php echo htmlspecialchars(json_encode($categoriasDefinidas)); ?>"></div>

<script>
    window.activeCategories = <?php echo json_encode($categoriasDefinidas); ?>;
</script>
