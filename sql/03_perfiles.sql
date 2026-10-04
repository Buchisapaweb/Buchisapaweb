-- ==============================================================================
-- TABLA 3: PERFILES DE USUARIO Y CLIENTES (perfiles) - 100% LIMPIA
-- BuchiSapa Burger & Broaster
-- ==============================================================================

-- Eliminar campos duplicados si existieran:
ALTER TABLE IF EXISTS public.perfiles DROP COLUMN IF EXISTS uid;
ALTER TABLE IF EXISTS public.perfiles DROP COLUMN IF EXISTS email_verified;
ALTER TABLE IF EXISTS public.perfiles DROP COLUMN IF EXISTS updated_at;

CREATE TABLE IF NOT EXISTS public.perfiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    doc_type TEXT DEFAULT 'DNI',
    doc_number TEXT,
    role TEXT DEFAULT 'customer',
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_perfiles_email ON public.perfiles(email);
CREATE INDEX IF NOT EXISTS idx_perfiles_role ON public.perfiles(role);

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Perfiles publicos" ON public.perfiles;
CREATE POLICY "Perfiles publicos" ON public.perfiles FOR ALL USING (true);

INSERT INTO public.perfiles (id, email, name, first_name, last_name, phone, doc_type, doc_number, role, is_admin) VALUES
('9b1fabb3-25d9-4c0a-921a-8d5a460e8a91', 'admin@buchisapa.pe', 'Administrador Buchisapa', 'Admin', 'Buchisapa', '943 312 024', 'DNI', '72345678', 'admin', TRUE),
('166099db-28ad-4329-b3c4-117f63188472', 'buchisapaweb@gmail.com', 'Administrador BuchiSapa', 'Administrador', 'BuchiSapa', '942 475 459', 'DNI', '70000001', 'admin', TRUE),
('loalopezjean', 'loalopezjean@gmail.com', 'Jean Loa Lopez', 'Jean', 'Loa Lopez', '942 475 459', 'DNI', '74859612', 'admin', TRUE),
('cust-buchisapa-1', 'cliente@buchisapa.pe', 'Cliente Buchisapa', 'Cliente', 'Buchisapa', '987 654 321', 'DNI', '45678901', 'customer', FALSE),
('1', 'juan.perez@gmail.com', 'Juan Perez', 'Juan', 'Perez', '987654321', 'DNI', '45678902', 'customer', FALSE),
('2', 'maria.garcia@gmail.com', 'Maria Garcia', 'Maria', 'Garcia', '912345678', 'DNI', '45678903', 'customer', FALSE),
('3', 'carlos.lopez@gmail.com', 'Carlos Lopez', 'Carlos', 'Lopez', '955443322', 'DNI', '45678904', 'customer', FALSE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, doc_number = EXCLUDED.doc_number, role = EXCLUDED.role, is_admin = EXCLUDED.is_admin;
