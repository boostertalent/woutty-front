declare module '@supabase/ssr' {
  export function createBrowserClient<
    Database = any
  >(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): any;

  export type CookieOptions = any;

  export function createServerClient<
    Database = any
  >(
    supabaseUrl: string,
    supabaseKey: string,
    options: {
      cookies: {
        get(name: string): string | undefined;
        set(name: string, value: string, options: CookieOptions): void;
        remove(name: string, options: CookieOptions): void;
      };
    }
  ): any;
}
