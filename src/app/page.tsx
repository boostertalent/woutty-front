"use client";

import { useState } from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/ModeToggle";
import { Reveal } from "@/components/Reveal";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* Header */}
      <header className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4 md:px-8">
          
          {/* 1. Logo */}
          <div className="flex-1">
            <Link href="/" className="text-2xl font-black tracking-tighter text-primary">
              Woutty
            </Link>
          </div>

          {/* 2. Menu desktop AU CENTRE */}
          <nav className="hidden md:flex items-center justify-center space-x-8 flex-grow">
            {[
              { name: "Accueil", href: "/" },
              { name: "Je suis créateur", href: "/creators" },
              { name: "Je suis marque", href: "/brands" },
              { name: "Partenariats", href: "/partenariat" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="group relative py-2 text-sm font-bold transition-colors hover:text-primary"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* 3. Actions à droite */}
          <div className="flex-1 flex justify-end items-center gap-3">
            <div className="hidden md:flex items-center border-l border-border pl-6">
              <ModeToggle />
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <ModeToggle />
              <button
                className="p-2 text-2xl transition-transform active:scale-90"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar mobile */}
        <div
          className={`fixed inset-0 top-[65px] bg-background z-40 transition-transform duration-500 ease-in-out md:hidden ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <nav className="flex flex-col p-10 space-y-8 text-3xl font-black">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Accueil</Link>
            <Link href="/creators" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Créateurs</Link>
            <Link href="/brands" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Marques</Link>
            <Link href="/partenariat" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Partenariats</Link>
            <div className="pt-6 border-t border-border text-base font-normal">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-bold">Options</p>
              <ModeToggle />
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-40 pb-16 px-4">
        <Reveal>
          <section className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 lg:flex-row">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <span className="inline-block rounded-full bg-secondary px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-secondary-foreground shadow-sm">
                Influence & Marketing
              </span>
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
                Connectez votre marque aux <span className="text-primary">meilleurs</span> créateurs.
              </h1>
              <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0 font-medium">
                Woutty simplifie la collaboration entre les marques audacieuses et les créateurs de contenu influents.
              </p>
             
            </div>
          </section>
        </Reveal>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border pt-16 pb-8 px-4 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            <div className="col-span-1 md:col-span-1 space-y-4">
              <Link href="/" className="text-2xl font-black tracking-tighter text-primary">
                Woutty
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                La plateforme de référence pour connecter les créateurs de contenu talentueux avec les marques les plus audacieuses au Sénégal.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-primary">Plateforme</h4>
              <ul className="space-y-2 text-sm font-medium">
                <li><Link href="/creators" className="text-muted-foreground hover:text-primary transition-colors">Pour les Créateurs</Link></li>
                <li><Link href="/brands" className="text-muted-foreground hover:text-primary transition-colors">Pour les Marques</Link></li>
                <li><Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Tarifs</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-primary">Entreprise</h4>
              <ul className="space-y-2 text-sm font-medium">
                <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">À propos</Link></li>
                <li><Link href="/partenariat" className="text-muted-foreground hover:text-primary transition-colors">Partenariats</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-primary">Légal</h4>
              <ul className="space-y-2 text-sm font-medium">
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Conditions d'utilisation</Link></li>
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Confidentialité</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-xs text-muted-foreground font-medium">
              © {new Date().getFullYear()} Woutty. Tous droits réservés.
            </p>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest">Instagram</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest">LinkedIn</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest">TikTok</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}