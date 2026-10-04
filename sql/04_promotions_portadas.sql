-- ==============================================================================
-- TABLA 4: PROMOCIONES Y PORTADAS HERO (promotions, portadas) - 100% LIMPIAS
-- BuchiSapa Burger & Broaster
-- ==============================================================================

-- Eliminar campos innecesarios:
ALTER TABLE IF EXISTS public.promotions DROP COLUMN IF EXISTS badge;
ALTER TABLE IF EXISTS public.promotions DROP COLUMN IF EXISTS original_price;

ALTER TABLE IF EXISTS public.portadas DROP COLUMN IF EXISTS highlight;
ALTER TABLE IF EXISTS public.portadas DROP COLUMN IF EXISTS subtitle;
ALTER TABLE IF EXISTS public.portadas DROP COLUMN IF EXISTS badge;
ALTER TABLE IF EXISTS public.portadas DROP COLUMN IF EXISTS badge_type;
ALTER TABLE IF EXISTS public.portadas DROP COLUMN IF EXISTS button_text;
ALTER TABLE IF EXISTS public.portadas DROP COLUMN IF EXISTS button_category;
ALTER TABLE IF EXISTS public.portadas DROP COLUMN IF EXISTS features;
ALTER TABLE IF EXISTS public.portadas DROP COLUMN IF EXISTS updated_at;

CREATE TABLE IF NOT EXISTS public.promotions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    image TEXT,
    active BOOLEAN DEFAULT true,
    order_num INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    accompaniments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.portadas (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    image_mobile TEXT,
    active BOOLEAN DEFAULT true,
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portadas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Promociones publicas" ON public.promotions;
CREATE POLICY "Promociones publicas" ON public.promotions FOR ALL USING (true);
DROP POLICY IF EXISTS "Portadas publicas" ON public.portadas;
CREATE POLICY "Portadas publicas" ON public.portadas FOR ALL USING (true);

INSERT INTO public.promotions (id, title, description, price, image, active, order_num, features, accompaniments) VALUES
('promo-1', 'PROMO BUCHI DUO', 'Dos Hamburguesas Tipo Clasica con carne artesanal premium y dos Gaseosas Pepsi.', 22, '/imagenes/portada/Portada2E.webp', TRUE, 1, '["2 Hamburguesas artesanales clasicas","Papa crocante","Ensalada fresca","2 Gaseosas Personales Pepsi"]'::jsonb, '["Papa crocante","Hamburguesa artesanal","Ensalada fresca"]'::jsonb),
('promo-2', 'PROMO BROASTER FAMILIAR', 'Tres presas broaster (pecho, pierna, ala) con papas crocantes, arroz y gaseosa.', 38, '/imagenes/portada/Portada1E.webp', TRUE, 2, '["3 Presas Broaster (Pecho, Pierna, Ala)","Papa crocante","Ensalada fresca","Arroz graneado","1 Gaseosa Personal Inca Kola"]'::jsonb, '["Papa crocante","Ensalada fresca","Arroz"]'::jsonb),
('promo-3', 'PROMO SALCHI BURGER', 'Hamburguesa Cheese Burguer y Salchipapa Clasica mas Coca Cola.', 24, '/imagenes/portada/Portada3E.webp', TRUE, 3, '["1 Hamburguesa Cheese Burguer","1 Salchipapa Clasica con Papas crocantes","Queso cheddar derretido","Ensalada fresca","1 Gaseosa Personal Coca Cola"]'::jsonb, '["Queso cheddar","Papa crocante","Ensalada fresca"]'::jsonb),
('promo-4', 'PROMO SELVA POWER', 'Tacacho con Cecina y Salchibroaster Pierna con gaseosa personal Fanta.', 29, '/imagenes/portada/Portada4E.webp', TRUE, 4, '["1 Plato Amazonico Tacacho con Cecina","1 Salchibroaster Pierna","Maduros fritos","Sarza criolla","Papa crocante","Ensalada fresca","1 Gaseosa Personal Fanta"]'::jsonb, '["Maduros fritos","Sarza criolla","Papa crocante","Ensalada fresca"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, price = EXCLUDED.price, image = EXCLUDED.image, active = EXCLUDED.active, features = EXCLUDED.features;

INSERT INTO public.portadas (id, title, image, image_mobile, active, order_num) VALUES
('portada-1', 'Portada 1', '/imagenes/portada/Portada1E.webp', '/imagenes/portada/Portada1M.webp', TRUE, 1),
('portada-2', 'Portada 2', '/imagenes/portada/Portada2E.webp', '/imagenes/portada/Portada2M.webp', TRUE, 2),
('portada-3', 'Portada 3', '/imagenes/portada/Portada3E.webp', '/imagenes/portada/Portada3M.webp', TRUE, 3),
('portada-4', 'Portada 4', '/imagenes/portada/Portada4E.webp', '/imagenes/portada/Portada4M.webp', TRUE, 4),
('portada-1790590297016', 'Portada 5', '/imagenes/portada/Portada5E.webp', '/imagenes/portada/Portada5M.webp', TRUE, 5)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, image = EXCLUDED.image, image_mobile = EXCLUDED.image_mobile, active = EXCLUDED.active, order_num = EXCLUDED.order_num;
