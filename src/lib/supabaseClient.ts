import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// On crée une instance unique pour le client
let client: ReturnType<typeof createBrowserClient> | undefined;

export const getSupabaseBrowserClient = () => {
  if (client) return client;

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
};

// Pour garder la compatibilité avec tes imports actuels :
export const supabase = getSupabaseBrowserClient();