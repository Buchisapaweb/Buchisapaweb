import fs from 'fs';
import path from 'path';

function loadArrayFromDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
  const items = [];
  for (const f of files) {
    try {
      const raw = fs.readFileSync(path.join(dirPath, f), 'utf8');
      items.push(JSON.parse(raw));
    } catch (e) {}
  }
  return items;
}

const cats = loadArrayFromDir('data/categories').sort((a: any, b: any) => (a.id || '').localeCompare(b.id || ''));
const prods = loadArrayFromDir('data/products').sort((a: any, b: any) => (a.id || '').localeCompare(b.id || ''));
const portadas = loadArrayFromDir('data/portadas').sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

function stripEmojis(val: any): any {
  if (typeof val === 'string') {
    return val
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2728}\u{2714}\u{2716}\u{2733}\u{2747}\u{2753}\u{2757}\u{203C}\u{2049}\u{00A9}\u{00AE}\u{2122}\u{231A}\u{23F0}\u{23F3}\u{24C2}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2934}\u{2935}\u{2B05}\u{2B06}\u{2B07}\u{2B1B}\u{2B1C}\u{3030}\u{303D}\u{3297}\u{3299}✦🔥✨🌴🍔🍟🥗🥤🍗🍚🧀🍌🧅💡]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  if (Array.isArray(val)) {
    return val.map(stripEmojis);
  }
  if (typeof val === 'object' && val !== null) {
    const res: any = {};
    for (const key of Object.keys(val)) {
      res[key] = stripEmojis(val[key]);
    }
    return res;
  }
  return val;
}

function escapeSql(val: any) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'object') {
    const cleaned = stripEmojis(val);
    return `'${JSON.stringify(cleaned).replace(/'/g, "''")}'::jsonb`;
  }
  const cleanStr = stripEmojis(String(val));
  return `'${cleanStr.replace(/'/g, "''")}'`;
}

let sql = `-- ==============================================================================
-- BUCHISAPA BURGER & BROASTER - ESQUEMA Y MIGRACION COMPLETA PARA SUPABASE
-- Disenado para soportar 100% el Panel de Administracion (Admin), Tienda y Pedidos
-- Preserva exactamente los IDs de Platos (PL0001-PL0057), Categorias (C0001-C0010),
-- Portadas, Promociones, Perfiles de Administrador y Pedidos en tiempo real.
--
-- Ejecuta este script en: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Habilitar extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: CATEGORIAS (categories) - Preserva IDs 'C0001' a 'C0010'
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: PRODUCTOS / PLATOS (products) - Preserva IDs 'PL0001' a 'PL0057' (y auto-incremento 'PL0058'...)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    category TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    description TEXT,
    available BOOLEAN DEFAULT true,
    stock INTEGER DEFAULT 50,
    image TEXT,
    includes_sauces BOOLEAN DEFAULT false,
    accompaniments JSONB DEFAULT '[]'::jsonb,
    cremas JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA: PROMOCIONES (promotions) - Preserva IDs 'promo-1' a 'promo-4'
CREATE TABLE IF NOT EXISTS public.promotions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    original_price NUMERIC(10,2),
    image TEXT,
    badge TEXT,
    active BOOLEAN DEFAULT true,
    order_num INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    accompaniments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA: BANNERS / PORTADAS HERO (portadas) - Preserva IDs 'portada-1' a 'portada-5'
CREATE TABLE IF NOT EXISTS public.portadas (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    highlight TEXT,
    subtitle TEXT,
    badge TEXT,
    badge_type TEXT,
    image TEXT NOT NULL,
    image_mobile TEXT,
    button_text TEXT,
    button_category TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN DEFAULT true,
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA: PEDIDOS Y COMANDAS (orders) - Sincronizado con Panel de Pedidos y KDS Cocina
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL,
    order_code TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    order_type TEXT NOT NULL DEFAULT 'pickup',
    delivery_address TEXT,
    delivery_reference TEXT,
    table_number TEXT,
    payment_method TEXT NOT NULL DEFAULT 'efectivo',
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pendiente',
    subtotal NUMERIC(10,2) DEFAULT 0,
    delivery_fee NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLA: LIBRO DE RECLAMACIONES (claims)
CREATE TABLE IF NOT EXISTS public.claims (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    doc_type TEXT NOT NULL DEFAULT 'DNI',
    doc_number TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    claim_type TEXT NOT NULL DEFAULT 'reclamo',
    amount NUMERIC(10,2) DEFAULT 0,
    description TEXT NOT NULL,
    consumer_claim TEXT,
    status TEXT NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABLA: PERFILES DE USUARIO Y CLIENTES (perfiles) - Vista de Clientes del Panel Admin
CREATE TABLE IF NOT EXISTS public.perfiles (
    id TEXT PRIMARY KEY,
    uid TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    doc_type TEXT DEFAULT 'DNI',
    doc_number TEXT,
    role TEXT DEFAULT 'customer',
    is_admin BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABLA: CONFIGURACION GENERAL DEL NEGOCIO (configuracion)
CREATE TABLE IF NOT EXISTS public.configuracion (
    id TEXT PRIMARY KEY DEFAULT 'principal',
    business_name TEXT NOT NULL DEFAULT 'BuchiSapa Burger & Broaster',
    ruc TEXT DEFAULT '10723456781',
    address TEXT DEFAULT 'Jr. San Martin 456, Tarapoto, San Martin, Peru',
    phone TEXT DEFAULT '+51 942 475 459',
    email TEXT DEFAULT 'buchisapaweb@gmail.com',
    delivery_fee NUMERIC(10,2) DEFAULT 3.00,
    printer_ip TEXT DEFAULT '192.168.8.100',
    printer_port INTEGER DEFAULT 80,
    opening_hours TEXT DEFAULT 'Lunes a Domingo: 5:00 PM - 11:30 PM',
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDICES DE ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_products_popular ON public.products(popular);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_perfiles_role ON public.perfiles(role);
CREATE INDEX IF NOT EXISTS idx_perfiles_email ON public.perfiles(email);

-- 10. POLITICAS DE SEGURIDAD (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

-- Permisos completos para lectura y operaciones del panel y tienda
DROP POLICY IF EXISTS "Categorias publicas" ON public.categories;
CREATE POLICY "Categorias publicas" ON public.categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Productos publicos" ON public.products;
CREATE POLICY "Productos publicos" ON public.products FOR ALL USING (true);

DROP POLICY IF EXISTS "Promociones publicas" ON public.promotions;
CREATE POLICY "Promociones publicas" ON public.promotions FOR ALL USING (true);

DROP POLICY IF EXISTS "Portadas publicas" ON public.portadas;
CREATE POLICY "Portadas publicas" ON public.portadas FOR ALL USING (true);

DROP POLICY IF EXISTS "Pedidos publicos" ON public.orders;
CREATE POLICY "Pedidos publicos" ON public.orders FOR ALL USING (true);

DROP POLICY IF EXISTS "Reclamaciones publicas" ON public.claims;
CREATE POLICY "Reclamaciones publicas" ON public.claims FOR ALL USING (true);

DROP POLICY IF EXISTS "Perfiles publicos" ON public.perfiles;
CREATE POLICY "Perfiles publicos" ON public.perfiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Configuracion publica" ON public.configuracion;
CREATE POLICY "Configuracion publica" ON public.configuracion FOR ALL USING (true);

-- ==============================================================================
-- 11. INSERCION DE TODOS LOS DATOS CON SUS IDS EXACTOS
-- ==============================================================================

-- A. CATEGORIAS OFICIALES (10) - IDs: C0001 a C0010
`;

cats.forEach((c: any) => {
  sql += `INSERT INTO public.categories (id, slug, name, image) VALUES (${escapeSql(c.id)}, ${escapeSql(c.slug)}, ${escapeSql(c.name)}, ${escapeSql(c.image)}) ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name = EXCLUDED.name, image = EXCLUDED.image;\n`;
});

sql += `\n-- B. PLATOS / PRODUCTOS DEL ADMIN Y CARTA (57) - IDs: PL0001 a PL0057\n`;
prods.forEach((p: any) => {
  sql += `INSERT INTO public.products (id, name, category_id, category, price, description, available, stock, image, includes_sauces, accompaniments, cremas) VALUES (${escapeSql(p.id)}, ${escapeSql(p.name)}, ${escapeSql(p.category_id)}, ${escapeSql(p.category)}, ${p.price || 0}, ${escapeSql(p.description)}, ${p.available !== false ? 'TRUE' : 'FALSE'}, ${p.stock || 50}, ${escapeSql(p.image)}, ${p.includes_sauces ? 'TRUE' : 'FALSE'}, ${escapeSql(p.accompaniments || [])}, ${escapeSql(p.cremas || [])}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, stock = EXCLUDED.stock, available = EXCLUDED.available, image = EXCLUDED.image, accompaniments = EXCLUDED.accompaniments, cremas = EXCLUDED.cremas;\n`;
});

sql += `\n-- C. PORTADAS Y BANNERS DEL HERO SLIDER (5) - IDs: PT001 a PT005\n`;
portadas.forEach((pt: any) => {
  const cleanBadge = stripEmojis(pt.badge);
  sql += `INSERT INTO public.portadas (id, title, highlight, subtitle, badge, badge_type, image, image_mobile, button_text, button_category, features, active, order_num) VALUES (${escapeSql(pt.id)}, ${escapeSql(pt.title)}, ${escapeSql(pt.highlight || null)}, ${escapeSql(pt.subtitle || null)}, ${escapeSql(cleanBadge || null)}, ${escapeSql(pt.badgeType || null)}, ${escapeSql(pt.image)}, ${escapeSql(pt.imageMobile || null)}, ${escapeSql(pt.buttonText || null)}, ${escapeSql(pt.buttonCategory || null)}, ${escapeSql(pt.features || [])}, ${pt.active !== false ? 'TRUE' : 'FALSE'}, ${pt.order || 0}) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, image = EXCLUDED.image, image_mobile = EXCLUDED.image_mobile, active = EXCLUDED.active, order_num = EXCLUDED.order_num;\n`;
});

sql += `\n-- E. CLIENTES Y ADMINISTRADORES REALES DEL PANEL ADMIN (perfiles)\n`;
sql += `INSERT INTO public.perfiles (id, uid, email, name, first_name, last_name, phone, doc_type, doc_number, role, is_admin, email_verified) VALUES ('9b1fabb3-25d9-4c0a-921a-8d5a460e8a91', '9b1fabb3-25d9-4c0a-921a-8d5a460e8a91', 'admin@buchisapa.pe', 'Administrador Buchisapa', 'Admin', 'Buchisapa', '943 312 024', 'DNI', '72345678', 'admin', TRUE, TRUE) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, doc_number = EXCLUDED.doc_number;\n`;
sql += `INSERT INTO public.perfiles (id, uid, email, name, first_name, last_name, phone, doc_type, doc_number, role, is_admin, email_verified) VALUES ('166099db-28ad-4329-b3c4-117f63188472', '166099db-28ad-4329-b3c4-117f63188472', 'buchisapaweb@gmail.com', 'Administrador BuchiSapa', 'Administrador', 'BuchiSapa', '942 475 459', 'DNI', '70000001', 'admin', TRUE, TRUE) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, doc_number = EXCLUDED.doc_number;\n`;
sql += `INSERT INTO public.perfiles (id, uid, email, name, first_name, last_name, phone, doc_type, doc_number, role, is_admin, email_verified) VALUES ('loalopezjean', 'loalopezjean', 'loalopezjean@gmail.com', 'Jean Loa Lopez', 'Jean', 'Loa Lopez', '942 475 459', 'DNI', '74859612', 'admin', TRUE, TRUE) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, doc_number = EXCLUDED.doc_number;\n`;
sql += `INSERT INTO public.perfiles (id, uid, email, name, first_name, last_name, phone, doc_type, doc_number, role, is_admin, email_verified) VALUES ('cust-buchisapa-1', 'cust-buchisapa-1', 'cliente@buchisapa.pe', 'Cliente Buchisapa', 'Cliente', 'Buchisapa', '987 654 321', 'DNI', '45678901', 'customer', FALSE, TRUE) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, doc_number = EXCLUDED.doc_number;\n`;
sql += `INSERT INTO public.perfiles (id, uid, email, name, first_name, last_name, phone, doc_type, doc_number, role, is_admin, email_verified) VALUES ('1', '1', 'juan.perez@gmail.com', 'Juan Perez', 'Juan', 'Perez', '987654321', 'DNI', '45678902', 'customer', FALSE, TRUE) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, doc_number = EXCLUDED.doc_number;\n`;
sql += `INSERT INTO public.perfiles (id, uid, email, name, first_name, last_name, phone, doc_type, doc_number, role, is_admin, email_verified) VALUES ('2', '2', 'maria.garcia@gmail.com', 'Maria Garcia', 'Maria', 'Garcia', '912345678', 'DNI', '45678903', 'customer', FALSE, TRUE) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, doc_number = EXCLUDED.doc_number;\n`;
sql += `INSERT INTO public.perfiles (id, uid, email, name, first_name, last_name, phone, doc_type, doc_number, role, is_admin, email_verified) VALUES ('3', '3', 'carlos.lopez@gmail.com', 'Carlos Lopez', 'Carlos', 'Lopez', '955443322', 'DNI', '45678904', 'customer', FALSE, TRUE) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, doc_number = EXCLUDED.doc_number;\n`;

sql += `\n-- F. CONFIGURACION DEL NEGOCIO E IMPRESORA TERMICA\n`;
sql += `INSERT INTO public.configuracion (id, business_name, ruc, address, phone, email, delivery_fee, printer_ip, printer_port, opening_hours) VALUES ('principal', 'BuchiSapa Burger & Broaster', '10723456781', 'Jr. San Martin 456, Tarapoto, San Martin, Peru', '+51 942 475 459', 'buchisapaweb@gmail.com', 3.00, '192.168.8.100', 80, 'Lunes a Domingo: 5:00 PM - 11:30 PM') ON CONFLICT (id) DO UPDATE SET business_name = EXCLUDED.business_name, ruc = EXCLUDED.ruc, address = EXCLUDED.address, phone = EXCLUDED.phone, email = EXCLUDED.email, printer_ip = EXCLUDED.printer_ip;\n`;

fs.writeFileSync('supabase-schema.sql', sql, 'utf8');
console.log('supabase-schema.sql generado con tabla perfiles, sin iconos y con todos los datos exactos del panel admin.');
