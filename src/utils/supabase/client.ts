import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckgvgfpcxeqyilfphnsu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_XLQDJByokKbI5m0UVkJHEw_KRTygH9M';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
