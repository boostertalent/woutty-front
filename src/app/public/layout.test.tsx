import Link from 'next/link';
import React from 'react';

// Si tu as installé Shadcn UI, tu peux importer le composant Button
// import { Button } from "@/components/ui/button"; 

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
      {/* --- HEADER / NAVBAR --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          
          {/* Logo */}
          <Link href="/public" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <span>UGC Platform</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/public/creators" className="hover:text-indigo-600 transition-colors">
              Pour les Créateurs
            </Link>
            <Link href="/public/brands" className="hover:text-indigo-600 transition-colors">
              Pour les Marques
            </Link>
            <Link href="/public/campaigns" className="hover:text-indigo-600 transition-colors">
              Campagnes
            </Link>
          </nav>

          {/* Boutons Auth */}
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium hover:underline underline-offset-4">
              Se connecter
            </Link>
            <Link href="/auth/register">
              {/* Remplace par <Button> si tu as Shadcn */}
              <button className="bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                S'inscrire
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* --- CONTENU DYNAMIQUE (Les pages s'insèrent ici) --- */}
      <main className="flex-1">
        {children}
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t bg-gray-50 py-10">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 md:flex-row md:justify-between">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} UGC Platform. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:underline">Mentions légales</Link>
            <Link href="#" className="hover:underline">Confidentialité</Link>
            <Link href="#" className="hover:underline">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}