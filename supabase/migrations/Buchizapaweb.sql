-- ==============================================================================
-- RESTAURANTE BUCHISAPA - SUPABASE DATABASE SCHEMA & SEED DATA
-- Proyecto: ckgvgfpcxeqyilfphnsu
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  given_name TEXT,
  family_name TEXT,
  phone TEXT,
  doc_type TEXT DEFAULT 'DNI',
  doc_number TEXT,
  birth_date TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT
);

-- 4. TABLA PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  badge TEXT,
  popular BOOLEAN DEFAULT false,
  available BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 15,
  image TEXT,
  options JSONB,
  includes_sauces BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA SAUCES
CREATE TABLE IF NOT EXISTS public.sauces (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_signature BOOLEAN DEFAULT false
);

-- 6. TABLA ORDERS (Pedidos de clientes)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  order_type TEXT NOT NULL CHECK (order_type IN ('delivery', 'pickup', 'salon')),
  delivery_address TEXT,
  delivery_reference TEXT,
  table_number TEXT,
  payment_method TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'recibido' CHECK (status IN ('recibido', 'preparando', 'en_camino', 'entregado')),
  total NUMERIC(10, 2) NOT NULL,
  items JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLA CLAIMS (Libro de Reclamaciones)
CREATE TABLE IF NOT EXISTS public.claims (
  id SERIAL PRIMARY KEY,
  claim_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  doc_type TEXT NOT NULL DEFAULT 'DNI',
  doc_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('queja', 'reclamo')),
  contracted_good TEXT NOT NULL CHECK (contracted_good IN ('producto', 'servicio')),
  claimed_amount NUMERIC(10, 2),
  product_description TEXT,
  detail TEXT NOT NULL,
  consumer_request TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- SEGURIDAD Y POLÍTICAS RLS (Row Level Security)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sauces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Sauces" ON public.sauces;
CREATE POLICY "Public Read Sauces" ON public.sauces FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Orders" ON public.orders;
CREATE POLICY "Public Update Orders" ON public.orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Insert Claims" ON public.claims;
CREATE POLICY "Public Insert Claims" ON public.claims FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Claims" ON public.claims;
CREATE POLICY "Public Read Claims" ON public.claims FOR SELECT USING (true);

-- Habilitar tiempo real en orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;

-- ==============================================================================
-- INSERCIÓN DE CATEGORÍAS
-- ==============================================================================
INSERT INTO public.categories (id, name, icon, description) VALUES ('platos-amazonicos', 'PLATOS AMAZÓNICOS', 'Flame', 'Auténticos sabores de la selva peruana: tacacho, cecina, juanes y patacones.') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon, description = EXCLUDED.description;
INSERT INTO public.categories (id, name, icon, description) VALUES ('hamburguesas', 'HAMBURGUESAS', 'Beef', 'Hamburguesas artesanales, choripanes y sándwiches especiales.') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon, description = EXCLUDED.description;
INSERT INTO public.categories (id, name, icon, description) VALUES ('broaster', 'BROASTER', 'Drumstick', 'Pollo broaster ultra crocante con papas, arroz, ensalada y cremas.') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon, description = EXCLUDED.description;
INSERT INTO public.categories (id, name, icon, description) VALUES ('salchipapas', 'SALCHIPAPAS Y SALCHIBROASTERS', 'Utensils', 'Papas crocantes, salchichas, chorizos y combinaciones broaster.') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon, description = EXCLUDED.description;
INSERT INTO public.categories (id, name, icon, description) VALUES ('alitas', 'ALITAS', 'Sparkles', '5 crujientes alitas con papas en salsa BBQ o Acevichada.') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon, description = EXCLUDED.description;
INSERT INTO public.categories (id, name, icon, description) VALUES ('bebidas', 'BEBIDAS', 'Coffee', 'Gaseosas heladas Inca Kola, Coca Cola, Fanta, Pepsi y agua mineral.') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon, description = EXCLUDED.description;
INSERT INTO public.categories (id, name, icon, description) VALUES ('refrescos', 'REFRESCOS', 'GlassWater', 'Refrescos naturales de frutas amazónicas: cocona, aguajina, maracuyá y camu camu.') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon, description = EXCLUDED.description;
INSERT INTO public.categories (id, name, icon, description) VALUES ('infusiones', 'INFUSIONES', 'CupSoda', 'Infusiones calientes de anís, té y café pasado aromático.') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon, description = EXCLUDED.description;

-- ==============================================================================
-- INSERCIÓN DE SALSAS
-- ==============================================================================
INSERT INTO public.sauces (name, is_signature) VALUES ('Ají de Pollería Clásico', true) ON CONFLICT (name) DO NOTHING;
INSERT INTO public.sauces (name, is_signature) VALUES ('Tártara Criolla', true) ON CONFLICT (name) DO NOTHING;
INSERT INTO public.sauces (name, is_signature) VALUES ('Mayonesa de la Casa', false) ON CONFLICT (name) DO NOTHING;
INSERT INTO public.sauces (name, is_signature) VALUES ('Crema de Rocoto Macho', true) ON CONFLICT (name) DO NOTHING;
INSERT INTO public.sauces (name, is_signature) VALUES ('Salsa Acevichada', true) ON CONFLICT (name) DO NOTHING;
INSERT INTO public.sauces (name, is_signature) VALUES ('Chimichurri Selvático', true) ON CONFLICT (name) DO NOTHING;

-- ==============================================================================
-- INSERCIÓN DE PRODUCTOS (46 PLATOS OFICIALES)
-- ==============================================================================
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ama-1', 'Patacones con Chorizo', 'platos-amazonicos', 12, 'Crujientes patacones de plátano verde acompañado de jugoso chorizo amazónico y salsas.', 'SELVA', true, true, 15, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ama-2', 'Tacacho con Cecina', 'platos-amazonicos', 12, 'Tradicional tacacho de plátano bellaco asado y machacado con cecina ahumada de la selva.', 'TÍPICO', true, true, 15, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ama-3', 'Juanes', 'platos-amazonicos', 15, 'Auténtico juane de gallina con arroz especiado, huevo y aceituna envuelto en hoja de bijao.', 'TRADICIONAL', true, true, 15, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ama-4', 'Chilcano de Carachama o Pescado del Día', 'platos-amazonicos', 15, 'Concentrado y reconstituyente chilcano amazónico con hierbas aromáticas del monte y pescado fresco.', 'RECONSTITUYENTE', false, true, 15, 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80', NULL, false) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ama-5', 'Palometa Frita con Maduro o Plátano', 'platos-amazonicos', 15, 'Pescado palometa frita crocante servida con plátano maduro frito o patacones dorados.', 'FRESCO', true, true, 15, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ama-6', 'Caldo Amazónico', 'platos-amazonicos', 12, 'Nutritivo y reconfortante caldo con hierbas aromáticas selváticas y presas selectas.', 'CALIENTE', false, true, 15, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80', NULL, false) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ama-7', 'Arroz Chaufa Amazónico', 'platos-amazonicos', 15, 'Granado arroz chaufa salteado al wok con trozos de cecina ahumada, chorizo regional y plátano frito.', 'FAVORITO', true, true, 15, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ham-1', 'Hamburguesa Clásica', 'hamburguesas', 10, 'Hamburguesa (carne o pollo) + Papas + ensalada + crema.', 'CLÁSICA', true, true, 15, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ham-2', 'Choripan', 'hamburguesas', 10, 'Papas + chorizo parrillero a la brasa en pan crocante con ensalada + crema.', 'PARRILLERO', true, true, 15, 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ham-3', 'Hawaiana Carne', 'hamburguesas', 14, 'Papa + carne artesanal + huevo + jamón + queso + piña + ensalada + crema.', 'ESPECIAL', true, true, 15, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ham-4', 'Hawaiana Pollo', 'hamburguesas', 13, 'Papa + pollo crispy + huevo + jamón + queso + piña + ensalada + crema.', 'CRISPY', true, true, 15, 'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ham-5', 'Pollo Deshilachado', 'hamburguesas', 9, 'Papas + jugoso pollo deshilachado con mayonesa casera + ensalada + crema.', 'ECONÓMICO', false, true, 15, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ham-6', 'Filete de Pollo', 'hamburguesas', 11, 'Papas + tierno filete de pollo a la plancha + ensalada + crema.', NULL, false, true, 15, 'https://images.unsplash.com/photo-1525164286253-04e68b9d94c6?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ham-7', 'Cheese Burguer', 'hamburguesas', 11, 'Hamburguesa de casa + doble queso cheddar derretido + papas + vegetales frescos.', 'CHEDDAR', true, true, 15, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ham-8', 'Bacon Burguer', 'hamburguesas', 12, 'Hamburguesa + papas + tocino crocante ahumado + queso cheddar.', 'TOCINO', true, true, 15, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ham-9', 'La Suprema', 'hamburguesas', 15, 'Hamburguesa + tocino + queso + huevo frito + jamón + papas + ensalada + crema.', 'MÁXIMA', true, true, 15, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ham-10', 'Hamburguesa a lo Pobre', 'hamburguesas', 14, 'Hamburguesa + huevo frito + queso + jamón + plátano dulce frito + papas.', 'A LO POBRE', true, true, 15, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ham-11', 'Royal', 'hamburguesas', 13, 'Carne casera / Pollo deshilachado / Hamburguesa de pollo / Hamburguesa de Chorizo + papas + ensalada + crema.', 'ROYAL', true, true, 15, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ham-12', 'Royal a lo Pobre', 'hamburguesas', 14, 'Papa + carne artesanal + huevo + jamón + queso + plátano + ensalada + crema.', 'COMPLETA', true, true, 15, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('bro-1', 'Broaster Pecho', 'broaster', 18, 'Generosa pechuga broaster ultra crocante + Papa + ensalada + arroz + cremas.', 'PECHUGA', true, true, 15, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('bro-2', 'Broaster Pierna', 'broaster', 12, 'Jugosa pierna broaster dorada al momento + Papa + ensalada + arroz + cremas.', 'JUGOSO', true, true, 15, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('bro-3', 'Broaster Encuentro', 'broaster', 13, 'Crocante encuentro broaster + Papa + ensalada + arroz + cremas.', 'FAVORITO', true, true, 15, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('bro-4', 'Broaster Ala', 'broaster', 10, 'Crujiente ala broaster + Papa + ensalada + arroz + cremas.', 'CLÁSICO', false, true, 15, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('sal-1', 'Salchipapa Clásica', 'salchipapas', 10, 'Papas fritas crocantes + rodajas de salchicha + ensalada + cremas.', 'CLÁSICA', true, true, 15, 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('sal-2', 'Salchipapa a lo Pobre', 'salchipapas', 13, 'Papas + salchicha + huevo frito + plátano maduro frito + ensalada + cremas.', 'A LO POBRE', true, true, 15, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('sal-3', 'Salchibroaster Pecho', 'salchipapas', 20, 'Papas fritas abundantes + pechuga broaster entera + ensalada + cremas.', 'CONTUNDENTE', true, true, 15, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('sal-4', 'Salchibroaster Pierna', 'salchipapas', 14, 'Papas + pierna de pollo broaster crocante + ensalada + cremas.', 'BROASTER', true, true, 15, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('sal-5', 'Salchibroaster Encuentro', 'salchipapas', 16, 'Papas + encuentro de pollo broaster + ensalada + cremas.', 'POPULAR', true, true, 15, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('sal-6', 'Salchibroaster Ala', 'salchipapas', 13, 'Papas + ala de pollo broaster + ensalada + cremas.', NULL, false, true, 15, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('sal-7', 'Salchichorizo', 'salchipapas', 13, 'Papas fritas crocantes + chorizo amazónico parrillero + ensalada + cremas.', 'AMAZÓNICO', true, true, 15, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ali-1', 'Alitas Acevichadas', 'alitas', 15, '5 alitas crujientes bañadas en nuestra crema acevichada especial + papas fritas.', 'ACEVICHADAS', true, true, 15, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ali-2', 'Alitas BBQ', 'alitas', 15, '5 alitas doradas bañadas en salsa barbacoa ahumada artesanal + papas fritas.', 'BBQ', true, true, 15, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80', NULL, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('beb-1', 'Inca Kola', 'bebidas', 5, 'Gaseosa helada personal 500ml.', 'HELADA', true, true, 15, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80', NULL, false) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('beb-2', 'Coca Cola', 'bebidas', 5, 'Gaseosa helada personal 500ml.', 'HELADA', true, true, 15, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&auto=format&fit=crop&q=80', NULL, false) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('beb-3', 'Fanta', 'bebidas', 3.5, 'Gaseosa sabor naranja helada 500ml.', NULL, false, true, 15, 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600&auto=format&fit=crop&q=80', NULL, false) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('beb-4', 'Pepsi', 'bebidas', 2, 'Gaseosa helada personal 500ml.', NULL, false, true, 15, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80', NULL, false) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('beb-5', 'Agua Cielo', 'bebidas', 2.5, 'Agua mineral de mesa sin gas 625ml.', 'NATURAL', false, true, 15, 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80', NULL, false) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ref-1', 'Maracuyá', 'refrescos', 3, 'Vaso de refresco natural de maracuyá de la selva bien helado.', '100% NATURAL', true, true, 15, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', NULL, false) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ref-2', 'Chicha Morada', 'refrescos', 3, 'Vaso de chicha morada tradicional preparada en casa con maíz morado y frutas.', 'CASERA', true, true, 15, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80', NULL, false) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ref-3', 'Cocona', 'refrescos', 3, 'Vaso de refresco natural de cocona amazónica recién preparada.', 'AMAZÓNICO', true, true, 15, 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80', NULL, false) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ref-4', 'Aguajina', 'refrescos', 3, 'Vaso de refresco artesanal de pura pulpa de aguaje de la selva.', 'TÍPICO', true, true, 15, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80', NULL, false) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('ref-5', 'Camu Camu', 'refrescos', 3, 'Vaso de refresco natural de camu camu puro, alto en vitamina C.', 'VITAMINA C', true, true, 15, 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=80', NULL, false) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('inf-1', 'Anís', 'infusiones', 2.5, 'Taza de infusión caliente y digestiva de anís.', 'CALIENTE', false, true, 15, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80', NULL, false) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('inf-2', 'Té', 'infusiones', 2.5, 'Taza de infusión caliente de té negro con canela y limón.', 'CALIENTE', false, true, 15, 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80', NULL, false) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;
INSERT INTO public.products (id, name, category_id, price, description, badge, popular, available, stock, image, options, includes_sauces) VALUES ('inf-3', 'Café', 'infusiones', 3, 'Taza de café pasado caliente, aromático y tradicional.', 'PASADO', true, true, 15, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', NULL, false) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id, price = EXCLUDED.price, description = EXCLUDED.description, badge = EXCLUDED.badge, popular = EXCLUDED.popular, available = EXCLUDED.available, stock = EXCLUDED.stock, image = EXCLUDED.image;

-- 8. ASIGNACIÓN DE ADMINISTRADOR PRINCIPAL
INSERT INTO public.profiles (id, email, name, role)
VALUES ('9b1fabb3-25d9-4c0a-921a-8d5a460e8a91', 'admin@buchisapa.pe', 'Administrador Principal', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = now();
