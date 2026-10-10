import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ckgvgfpcxeqyilfphnsu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_XLQDJByokKbI5m0UVkJHEw_KRTygH9M';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
