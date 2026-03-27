"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Les packs ont été supprimés du flux de campagne.
// Les marques créent directement leur campagne via le formulaire en 4 étapes.
export default function CampaignChoiceRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/brands/auth/campagne');
  }, [router]);

  return null;
}
