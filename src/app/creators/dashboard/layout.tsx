'use client';

import React, { useEffect, useState } from "react";
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
    
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !user) {
        
        setTimeout(() => {
          if (mounted && !isAuthorized) {
            router.replace('/creators/auth/login');
          }
        }, 500);
      } else {
        setIsAuthorized(true);
        setIsLoading(false);
      }
    };

    checkSession();

    // 3. Écouteur de changement d'état (capte le SIGNED_IN de Google)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        if (session) {
          setIsAuthorized(true);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthorized(false);
          router.replace('/creators/auth/login');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase, isAuthorized]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
          <p className="text-sm font-medium text-gray-400">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#F8FAFC]">
      {children}
    </section>
  );
}