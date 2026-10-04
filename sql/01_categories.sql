-- ==============================================================================
-- TABLA 1: CATEGORIAS (categories) - Sin campos redundantes
-- BuchiSapa Burger & Broaster
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Si ya habías creado la tabla con la columna 'code', esto la elimina de forma limpia:
ALTER TABLE IF EXISTS public.categories DROP COLUMN IF EXISTS code;

CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categorias publicas" ON public.categories;
CREATE POLICY "Categorias publicas" ON public.categories FOR ALL USING (true);

INSERT INTO public.categories (id, slug, name, image) VALUES
('C0001', 'promociones', 'PROMOCIONES', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80'),
('C0002', 'alitas', 'ALITAS', '/imagenes/categorias/alitas/banner.webp'),
('C0003', 'bebidas', 'BEBIDAS', '/imagenes/categorias/bebidas/banner.webp'),
('C0004', 'broaster', 'BROASTER', '/imagenes/categorias/broaster/banner.webp'),
('C0005', 'hamburguesas', 'HAMBURGUESAS', '/imagenes/categorias/hamburguesas/banner.webp'),
('C0006', 'infusiones', 'INFUSIONES', '/imagenes/categorias/infusiones/banner.webp'),
('C0007', 'platos-amazonicos', 'PLATOS AMAZONICOS', '/imagenes/categorias/platos-amazonicos/banner.webp'),
('C0008', 'refrescos', 'REFRESCOS', '/imagenes/categorias/refrescos/banner.webp'),
('C0009', 'salchipapas', 'SALCHIPAPAS Y SALCHIBROASTERS', '/imagenes/categorias/salchipapas-y-salchibroasters/banner.webp'),
('C0010', 'adicional', 'ADICIONAL', 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name = EXCLUDED.name, image = EXCLUDED.image;
