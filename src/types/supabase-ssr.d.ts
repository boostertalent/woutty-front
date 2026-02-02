declare module '@supabase/ssr' {
  export function createBrowserClient<
    Database = any
  >(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): any;
}
