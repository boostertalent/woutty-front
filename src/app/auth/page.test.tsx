import React from 'react';
import Link from 'next/link';
import { Users, Building2, Handshake, ArrowRight } from 'lucide-react';

export default function AuthChoicePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Header avec animation d'entrée */}
      <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
        <h1 className="text-5xl md:text-6xl font-extrabold text-black mb-6 tracking-tight">
          Bienvenue sur <span className="text-[#ceaf4a]">Woutty !</span>
        </h1>
        <p className="text-xl text-gray-500 font-medium">Choisissez votre profil pour commencer</p>
      </div>

      {/* Grille responsive à 3 colonnes */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 w-full max-w-7xl">
        
        {/* CARTE CRÉATEUR */}
        <ChoiceCard 
          icon={<Users size={60} strokeWidth={1.2} />}
          title="Créateur"
          description={<>Vous créez du contenu sur les réseaux <br/> et souhaitez collaborer</>}
          features={[
            "Accès aux opportunités",
            "Présentation de profil",
            "Gestion des candidatures"
          ]}
          href="/creators/auth/profil"
          buttonText="Je suis créateur"
        />

        {/* CARTE MARQUE */}
        <ChoiceCard 
          icon={<Building2 size={60} strokeWidth={1.2} />}
          title="Marque/Entreprise"
          description={<>Vous cherchez des créateurs <br/> pour vos campagnes</>}
          features={[
            "Trouvez les profils parfaits",
            "Lancez vos campagnes",
            "Suivi en temps réel"
          ]}
          href="/brands/auth/entreprise"
          buttonText="Je suis une marque/Entreprise"
        />

        {/* CARTE PARTENARIAT */}
        <ChoiceCard 
          icon={<Handshake size={60} strokeWidth={1.2} />}
          title="Partenariat"
          description={<>Développez l'écosystème <br/> via une alliance stratégique</>}
          features={[
            "Projets exclusifs",
            "Ressources dédiées",
            "Visibilité mutuelle"
          ]}
          href="/auth/register-partner"
          buttonText="Devenir partenaire"
        />

      </div>

      {/* Footer link */}
      <div className="mt-16 text-lg group">
        <span className="text-gray-900 font-bold">Déjà inscrit ? </span>
        <Link href="/auth/login" className="text-[#ceaf4a] font-bold hover:underline decoration-2 underline-offset-4 transition-all">
          Se connecter
        </Link>
      </div>
    </main>
  );
}

// Composant réutilisable pour les cartes pour garder un code propre
function ChoiceCard({ icon, title, description, features, href, buttonText }: any) {
  return (
    <div className="group bg-white border border-gray-100 rounded-[40px] p-10 flex flex-col items-center text-center transition-all duration-300 hover:border-[#ceaf4a] hover:shadow-[0_20px_50px_rgba(206,175,74,0.15)] hover:-translate-y-2">
      <div className="mb-6 p-5 rounded-3xl bg-gray-50 text-[#ceaf4a] group-hover:bg-[#ceaf4a] group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      
      <h2 className="text-3xl font-bold text-[#ceaf4a] mb-4">{title}</h2>
      
      <p className="text-gray-700 font-semibold mb-8 leading-tight h-12 flex items-center justify-center">
        {description}
      </p>
      
      <ul className="text-gray-500 text-[15px] space-y-4 mb-10 text-left w-full max-w-[240px] mx-auto">
        {features.map((feature: string, index: number) => (
          <li key={index} className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ceaf4a] shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      
      <Link 
        href={href}
        className="mt-auto w-full bg-[#ceaf4a] hover:bg-[#b8962f] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-[#ceaf4a]/30 active:scale-95"
      >
        {buttonText} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}