'use client';

import Link from 'next/link';
import { Users, Building2, Handshake, ArrowRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

function ChoiceCard({ icon, title, description, features, href, buttonText, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="group rounded-[40px] p-10 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 border border-black/5 bg-white/95 backdrop-blur-2xl shadow-2xl shadow-black/10 hover:border-booster-yellow/40 hover:shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
    >
      <div className="mb-6 p-5 rounded-3xl bg-slate-900 text-booster-yellow group-hover:bg-booster-yellow group-hover:text-black transition-colors duration-300 border border-black/5">
        {icon}
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>{title}</h2>
      <p className="text-slate-700 font-semibold mb-8 leading-tight h-12 flex items-center justify-center">{description}</p>
      <ul className="text-slate-600 text-[15px] space-y-4 mb-10 text-left w-full max-w-[240px] mx-auto">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-booster-yellow shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Link href={href} className="mt-auto w-full bg-booster-yellow hover:bg-yellow-400 text-black py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-yellow-500/15 active:scale-95">
        {buttonText} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}

export default function AuthChoicePage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Link
        href="/"
        className="fixed top-6 left-6 z-20 flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 text-sm font-black hover:bg-black/10 transition-colors"
      >
        <ChevronLeft size={20} /> Accueil
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-black mb-4 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
          Bienvenue sur <span className="underline decoration-black decoration-4 underline-offset-[0.18em]">Woutty</span>
        </h1>
        <p className="text-xl text-black font-medium italic">Choisissez votre profil pour commencer</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 w-full max-w-6xl">
        <ChoiceCard
          icon={<Users size={60} strokeWidth={1.2} />}
          title="Créateur"
          description={<>Vous créez du contenu sur les réseaux <br/> et souhaitez collaborer</>}
          features={["Accès aux opportunités", "Présentation de profil", "Gestion des candidatures"]}
          href="/creators/auth/formulaire/etape1"
          buttonText="Je suis créateur"
          delay={0.1}
        />
        <ChoiceCard
          icon={<Building2 size={60} strokeWidth={1.2} />}
          title="Marque/Entreprise"
          description={<>Vous cherchez des créateurs <br/> pour vos campagnes</>}
          features={["Trouvez les profils parfaits", "Lancez vos campagnes", "Suivi en temps réel"]}
          href="/brands/auth/formulaire/etape1"
          buttonText="Je suis une marque/Entreprise"
          delay={0.2}
        />
        <ChoiceCard
          icon={<Handshake size={60} strokeWidth={1.2} />}
          title="Partenariat"
          description={<>Développez l'écosystème <br/> via une alliance stratégique</>}
          features={["Projets exclusifs", "Ressources dédiées", "Visibilité mutuelle"]}
          href="/auth/register-partner"
          buttonText="Devenir partenaire"
          delay={0.3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-lg text-slate-800"
      >
        <span className="font-bold">Déjà inscrit ? </span>
        <Link href="/auth/login" className="text-booster-yellow font-black hover:underline decoration-2 underline-offset-4 transition-all">
          Se connecter
        </Link>
      </motion.div>
    </div>
  );
}