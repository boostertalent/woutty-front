import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase avec service role.
 * À utiliser UNIQUEMENT dans les API routes Next.js (côté serveur).
 * Ne jamais importer ce fichier dans des pages ou composants client.
 *
 * Requiert la variable d'environnement SUPABASE_SERVICE_ROLE_KEY
 * (sans préfixe NEXT_PUBLIC_ — ne doit jamais être exposée au navigateur).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
