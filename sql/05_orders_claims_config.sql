-- ==============================================================================
-- TABLA 5: PEDIDOS, RECLAMOS Y CONFIGURACION (orders, claims, configuracion)
-- BuchiSapa Burger & Broaster - 100% LIMPIAS
-- ==============================================================================

-- Eliminar campos duplicados de pedidos si existieran:
ALTER TABLE IF EXISTS public.orders DROP COLUMN IF EXISTS order_code;
ALTER TABLE IF EXISTS public.orders DROP COLUMN IF EXISTS subtotal;
ALTER TABLE IF EXISTS public.orders DROP COLUMN IF EXISTS user_id;
ALTER TABLE IF EXISTS public.orders DROP COLUMN IF EXISTS updated_at;

CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL,
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
    delivery_fee NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
    opening_hours TEXT DEFAULT 'Lunes a Domingo: 5:00 PM - 11:30 PM'
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pedidos publicos" ON public.orders;
CREATE POLICY "Pedidos publicos" ON public.orders FOR ALL USING (true);
DROP POLICY IF EXISTS "Reclamaciones publicas" ON public.claims;
CREATE POLICY "Reclamaciones publicas" ON public.claims FOR ALL USING (true);
DROP POLICY IF EXISTS "Configuracion publica" ON public.configuracion;
CREATE POLICY "Configuracion publica" ON public.configuracion FOR ALL USING (true);

INSERT INTO public.configuracion (id, business_name, ruc, address, phone, email, delivery_fee, printer_ip, printer_port, opening_hours) VALUES
('principal', 'BuchiSapa Burger & Broaster', '10723456781', 'Jr. San Martin 456, Tarapoto, San Martin, Peru', '+51 942 475 459', 'buchisapaweb@gmail.com', 3.00, '192.168.8.100', 80, 'Lunes a Domingo: 5:00 PM - 11:30 PM')
ON CONFLICT (id) DO UPDATE SET business_name = EXCLUDED.business_name, ruc = EXCLUDED.ruc, address = EXCLUDED.address, phone = EXCLUDED.phone, email = EXCLUDED.email, printer_ip = EXCLUDED.printer_ip;
