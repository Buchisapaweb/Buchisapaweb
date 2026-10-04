-- ==============================================================================
-- CONSULTA DE VERIFICACION RAPIDA EN SUPABASE SQL EDITOR
-- Ejecuta este script para ver cuantos registros hay en cada tabla
-- ==============================================================================

-- 1. Contar registros guardados en cada tabla
SELECT 'categories' AS tabla, count(*) AS total_registros FROM public.categories
UNION ALL
SELECT 'products' AS tabla, count(*) AS total_registros FROM public.products
UNION ALL
SELECT 'perfiles' AS tabla, count(*) AS total_registros FROM public.perfiles
UNION ALL
SELECT 'promotions' AS tabla, count(*) AS total_registros FROM public.promotions
UNION ALL
SELECT 'portadas' AS tabla, count(*) AS total_registros FROM public.portadas
UNION ALL
SELECT 'configuracion' AS tabla, count(*) AS total_registros FROM public.configuracion;

-- 2. Vista previa rapida de categorias
SELECT id, code, slug, name FROM public.categories ORDER BY id;

-- 3. Vista previa rapida de platos con su categoria y precio
SELECT id, code, name, category, price, stock, available FROM public.products ORDER BY id LIMIT 10;
