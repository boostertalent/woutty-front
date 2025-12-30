 'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users, 
  BarChart3, 
  Target, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Search,
  MessageSquare,
  ShieldCheck,
  icons
} from 'lucide-react';

export default function BrandLandingPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* --- Navigation --- */}
      <nav className="flex justify-between items-center px-8 py-8 max-w-7xl mx-auto relative z-50">
        <div className="text-4xl font-black italic tracking-tighter">W.</div>
        
        <div className="flex items-center gap-4">
           <Link href="/brands/auth/login" className="text-sm font-black bg-black text-white px-8 py-3 rounded-full hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all">
            Connexion
          </Link>
          <Link href="/brands/auth/register" className="text-sm font-black bg-black text-white px-8 py-3 rounded-full hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all">
            S'inscrire
          </Link>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="px-6 pt-20 pb-32 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">+500 marques nous font confiance</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-8"
        >
          Propulsez votre marque <br />
          <span className="text-gray-400 italic">via les meilleurs créateurs.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl text-gray-500 text-lg md:text-xl font-medium mb-12"
        >
          Accédez à un catalogue exclusif de créateurs de contenu certifiés au Sénégal et boostez votre visibilité en quelques clics.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <Link href="/brands/auth/register" className="bg-black text-white px-8 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-black/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
            Lancer une campagne <ArrowRight size={20} />
          </Link>
         
        </motion.div>
      </section>

      {/* --- Stats Section --- */}
      <section className="bg-gray-50 py-20 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Créateurs actifs", val: "2.5k+" },
            { label: "Campagnes livrées", val: "12k+" },
            { label: "Engagement moyen", val: "8.4%" },
            { label: "Pays couverts", val: "5" },
            
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black mb-1">{stat.val}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Workflow Section --- */}
      <section id="solutions" className="py-32 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Comment ça marche ?</h2>
          <p className="text-gray-500 font-bold">Trois étapes simples pour vos collaborations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { 
              icon: <Search className="text-blue-500" />, 
              title: "1. Trouvez", 
              desc: "Utilisez nos filtres avancés (âge, type de contenus, thématique) pour trouver le créateur idéal." 
            },
            { 
              icon: <MessageSquare className="text-purple-500" />, 
              title: "2. Briefez", 
              desc: "Envoyez votre brief directement via notre plateforme et négociez en toute sécurité." 
            },
            { 
              icon: <BarChart3 className="text-green-500" />, 
              title: "3. Analysez", 
              desc: "Suivez les performances de vos campagnes en temps réel avec des rapports détaillés." 
            },
        
          ].map((step, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/[0.02] hover:shadow-black/[0.05] transition-all">
              <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-black mb-4">{step.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA Final --- */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto bg-black rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
          {/* Cercles de décoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32" />

          <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10">
            Prêt à transformer <br />votre marketing ?
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto font-medium">
            Rejoignez les marques visionnaires qui collaborent avec les créateurs de demain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link href="/brands/auth/register" className="bg-white text-black px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all">
              Commencer maintenant
            </Link>
            <button className="bg-transparent border-2 border-white/20 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/10 transition-all">
              Contacter un expert
            </button>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 border-t border-gray-100 text-center">
        <div className="text-sm font-bold text-gray-400">
          © 2025 W platform. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}