import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckgvgfpcxeqyilfphnsu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_XLQDJByokKbI5m0UVkJHEw_KRTygH9M';

console.log('🚀 Iniciando sincronización de datos a Supabase...');
console.log(`📡 URL de Supabase: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

export async function syncAllToSupabase() {
  const results = {
    categories: 0,
    products: 0,
    promotions: 0,
    portadas: 0,
    orders: 0,
    perfiles: 0,
    configuracion: 0,
    errors: [] as string[]
  };

  // 1. Sincronizar Categorías
  try {
    const cats = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/categories.json'), 'utf8'));
    console.log(`📦 Sincronizando ${cats.length} categorías...`);
    const { data, error } = await supabase
      .from('categories')
      .upsert(cats.map((c: any) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        image: c.image
      })), { onConflict: 'id' });

    if (error) {
      console.warn('⚠️ Error en categorías:', error.message);
      results.errors.push(`Categorías: ${error.message}`);
    } else {
      results.categories = cats.length;
      console.log(`✅ ${cats.length} categorías sincronizadas.`);
    }
  } catch (err: any) {
    results.errors.push(`Categorías: ${err.message}`);
  }

  // 2. Sincronizar Productos
  try {
    const prods = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/products.json'), 'utf8'));
    console.log(`🍔 Sincronizando ${prods.length} productos...`);
    const { data, error } = await supabase
      .from('products')
      .upsert(prods.map((p: any) => ({
        id: p.id,
        name: p.name,
        category_id: p.category_id,
        category: p.category,
        price: p.price,
        description: p.description,
        available: p.available !== false,
        stock: p.stock || 50,
        image: p.image,
        includes_sauces: Boolean(p.includes_sauces),
        accompaniments: p.accompaniments || [],
        cremas: p.cremas || []
      })), { onConflict: 'id' });

    if (error) {
      console.warn('⚠️ Error en productos:', error.message);
      results.errors.push(`Productos: ${error.message}`);
    } else {
      results.products = prods.length;
      console.log(`✅ ${prods.length} productos sincronizados.`);
    }
  } catch (err: any) {
    results.errors.push(`Productos: ${err.message}`);
  }

  // 3. Sincronizar Promociones
  try {
    const promos = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/promociones.json'), 'utf8'));
    console.log(`🔥 Sincronizando ${promos.length} promociones...`);
    const { data, error } = await supabase
      .from('promotions')
      .upsert(promos.map((pr: any) => ({
        id: pr.id,
        title: pr.title,
        description: pr.description,
        price: pr.price,
        original_price: pr.originalPrice || null,
        image: pr.image,
        badge: pr.badge || null,
        active: pr.active !== false,
        order_num: pr.order || 0,
        features: pr.features || [],
        accompaniments: pr.accompaniments || []
      })), { onConflict: 'id' });

    if (error) {
      console.warn('⚠️ Error en promociones:', error.message);
      results.errors.push(`Promociones: ${error.message}`);
    } else {
      results.promotions = promos.length;
      console.log(`✅ ${promos.length} promociones sincronizadas.`);
    }
  } catch (err: any) {
    results.errors.push(`Promociones: ${err.message}`);
  }

  // 4. Sincronizar Portadas / Hero Banners
  try {
    const portadasFile = path.join(process.cwd(), 'data/portadas.json');
    if (fs.existsSync(portadasFile)) {
      const portadas = JSON.parse(fs.readFileSync(portadasFile, 'utf8'));
      console.log(`🖼️ Sincronizando ${portadas.length} portadas...`);
      const { data, error } = await supabase
        .from('portadas')
        .upsert(portadas.map((pt: any) => ({
          id: pt.id,
          title: pt.title,
          highlight: pt.highlight || null,
          subtitle: pt.subtitle || null,
          badge: pt.badge || null,
          badge_type: pt.badgeType || null,
          image: pt.image,
          image_mobile: pt.imageMobile || null,
          button_text: pt.buttonText || null,
          button_category: pt.buttonCategory || null,
          features: pt.features || [],
          active: pt.active !== false,
          order_num: pt.order || 0
        })), { onConflict: 'id' });

      if (error) {
        results.errors.push(`Portadas: ${error.message}`);
      } else {
        results.portadas = portadas.length;
        console.log(`✅ ${portadas.length} portadas sincronizadas.`);
      }
    }
  } catch (err: any) {
    results.errors.push(`Portadas: ${err.message}`);
  }

  // 5. Sincronizar Configuración General
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .upsert({
        id: 'principal',
        business_name: 'BuchiSapa Burger & Broaster',
        ruc: '10723456781',
        address: 'Jr. San Martín 456, Tarapoto, San Martín, Perú',
        phone: '+51 942 475 459',
        email: 'buchisapaweb@gmail.com',
        delivery_fee: 3.00,
        printer_ip: '192.168.8.100',
        printer_port: 80,
        opening_hours: 'Lunes a Domingo: 5:00 PM - 11:30 PM'
      }, { onConflict: 'id' });

    if (error) {
      results.errors.push(`Configuración: ${error.message}`);
    } else {
      results.configuracion = 1;
      console.log(`✅ Configuración sincronizada.`);
    }
  } catch (err: any) {
    results.errors.push(`Configuración: ${err.message}`);
  }

  // 6. Sincronizar Pedidos si existen
  try {
    const ordersFile = path.join(process.cwd(), 'data/orders.json');
    if (fs.existsSync(ordersFile)) {
      const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
      if (Array.isArray(orders) && orders.length > 0) {
        console.log(`📋 Sincronizando ${orders.length} pedidos...`);
        const { data, error } = await supabase
          .from('orders')
          .upsert(orders.map((o: any) => ({
            id: o.id,
            order_number: String(o.orderNumber || o.order_number || o.id),
            order_code: o.orderCode || o.order_code || null,
            customer_name: o.customerName || o.customer_name || 'Cliente',
            customer_phone: o.customerPhone || o.customer_phone || '',
            customer_email: o.customerEmail || o.customer_email || null,
            order_type: o.orderType || o.order_type || 'pickup',
            delivery_address: o.deliveryAddress || o.delivery_address || null,
            delivery_reference: o.deliveryReference || o.delivery_reference || null,
            table_number: o.tableNumber || o.table_number || null,
            payment_method: o.paymentMethod || o.payment_method || 'efectivo',
            notes: o.notes || null,
            status: o.status || 'pendiente',
            subtotal: o.subtotal || 0,
            delivery_fee: o.deliveryFee || o.delivery_fee || 0,
            total: o.total || 0,
            items: o.items || []
          })), { onConflict: 'id' });

        if (error) {
          results.errors.push(`Pedidos: ${error.message}`);
        } else {
          results.orders = orders.length;
          console.log(`✅ ${orders.length} pedidos sincronizados.`);
        }
      }
    }
  } catch (err: any) {
    results.errors.push(`Pedidos: ${err.message}`);
  }

  // 7. Sincronizar Perfiles (Clientes y Administradores del Panel)
  try {
    const defaultPerfiles = [
      { id: '9b1fabb3-25d9-4c0a-921a-8d5a460e8a91', uid: '9b1fabb3-25d9-4c0a-921a-8d5a460e8a91', email: 'admin@buchisapa.pe', name: 'Administrador Buchisapa', phone: '943 312 024', doc_type: 'DNI', doc_number: '72345678', role: 'admin', is_admin: true, email_verified: true },
      { id: '166099db-28ad-4329-b3c4-117f63188472', uid: '166099db-28ad-4329-b3c4-117f63188472', email: 'buchisapaweb@gmail.com', name: 'Administrador BuchiSapa', phone: '942 475 459', doc_type: 'DNI', doc_number: '70000001', role: 'admin', is_admin: true, email_verified: true },
      { id: 'loalopezjean', uid: 'loalopezjean', email: 'loalopezjean@gmail.com', name: 'Jean Loa Lopez', phone: '942 475 459', doc_type: 'DNI', doc_number: '74859612', role: 'admin', is_admin: true, email_verified: true },
      { id: 'cust-buchisapa-1', uid: 'cust-buchisapa-1', email: 'cliente@buchisapa.pe', name: 'Cliente Buchisapa', phone: '987 654 321', doc_type: 'DNI', doc_number: '45678901', role: 'customer', is_admin: false, email_verified: true },
      { id: '1', uid: '1', email: 'juan.perez@gmail.com', name: 'Juan Perez', phone: '987654321', doc_type: 'DNI', doc_number: '45678902', role: 'customer', is_admin: false, email_verified: true },
      { id: '2', uid: '2', email: 'maria.garcia@gmail.com', name: 'Maria Garcia', phone: '912345678', doc_type: 'DNI', doc_number: '45678903', role: 'customer', is_admin: false, email_verified: true },
      { id: '3', uid: '3', email: 'carlos.lopez@gmail.com', name: 'Carlos Lopez', phone: '955443322', doc_type: 'DNI', doc_number: '45678904', role: 'customer', is_admin: false, email_verified: true }
    ];
    const { data, error } = await supabase.from('perfiles').upsert(defaultPerfiles, { onConflict: 'id' });
    if (error) {
      results.errors.push(`Perfiles: ${error.message}`);
    } else {
      results.perfiles = defaultPerfiles.length;
      console.log(`✅ ${defaultPerfiles.length} perfiles sincronizados.`);
    }
  } catch (err: any) {
    results.errors.push(`Perfiles: ${err.message}`);
  }

  return results;
}

// Si se ejecuta directamente desde la terminal
if (process.argv[1] && process.argv[1].endsWith('sync-supabase.ts')) {
  syncAllToSupabase().then(res => {
    console.log('\n📊 Resumen de sincronización a Supabase:', res);
    if (res.errors.length > 0) {
      console.log('\n💡 Recuerda haber ejecutado previamente `supabase-schema.sql` en tu SQL Editor de Supabase para crear las tablas necesarias.');
    }
  });
}
