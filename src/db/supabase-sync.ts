import { createClient } from '@supabase/supabase-js';
import { Product } from './types.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckgvgfpcxeqyilfphnsu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_XLQDJByokKbI5m0UVkJHEw_KRTygH9M';
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function syncCategoryToSupabase(category: { id: string; slug?: string; name: string; image?: string }, action: 'upsert' | 'delete') {
  try {
    if (action === 'delete') {
      await supabase.from('categories').delete().eq('id', category.id);
    } else {
      await supabase.from('categories').upsert({
        id: category.id,
        slug: category.slug,
        name: category.name,
        image: category.image || ''
      }, { onConflict: 'id' });
    }
  } catch (err: any) {
    console.warn('⚠️ Error sincronizando categoría a Supabase:', err.message);
  }
}

export async function syncProductToSupabase(product: Product, action: 'upsert' | 'delete') {
  try {
    if (action === 'delete') {
      await supabase.from('products').delete().eq('id', product.id);
    } else {
      await supabase.from('products').upsert({
        id: product.id,
        name: product.name,
        category_id: product.category_id,
        category: product.category || '',
        price: product.price,
        description: product.description || '',
        available: product.available !== false,
        stock: product.stock || 50,
        image: product.image,
        includes_sauces: Boolean(product.includes_sauces),
        accompaniments: product.accompaniments || [],
        cremas: product.cremas || []
      }, { onConflict: 'id' });
    }
  } catch (err: any) {
    console.warn('⚠️ Error sincronizando producto a Supabase:', err.message);
  }
}
