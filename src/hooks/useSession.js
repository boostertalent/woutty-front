'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@//lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CreatorsDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/creators/auth/login');
      } else {
        setUser(data.session.user);
      }
      setLoading(false);
    };
    fetchSession();
  }, [router]);

  if (loading) return <p>Chargement de votre session...</p>;

  return <div>Bienvenue, {user?.email}</div>;
}
