"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// La modification de campagne a été supprimée.
// Les marques peuvent uniquement supprimer une campagne ou en créer une nouvelle.
export default function EditCampaignRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/brands/dashboard');
  }, [router]);

  return null;
}
