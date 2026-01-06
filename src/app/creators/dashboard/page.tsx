"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { 
  LogOut, User, Loader2, MessageSquare, 
  MoreHorizontal, ArrowUpRight, TrendingUp, Zap, CheckCheck 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- DEFINITION DES ANIMATIONS (Correction de l'erreur) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

// Données fictives pour le graphique
const data = [
  { name: 'Jan', revenus: 1200 },
  { name: 'Fév', revenus: 2100 },
  { name: 'Mar', revenus: 1800 },
  { name: 'Avr', revenus: 3400 },
  { name: 'Mai', revenus: 2900 },
  { name: 'Juin', revenus: 4200 },
];

export default function EnhancedDashboard() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{full_name: string, avatar_url: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/auth/logiin'); 
    router.refresh();
  };

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (!error && data) setUserProfile(data);
      }
      setLoading(false);
    }
    getUserData();
  }, [supabase]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-8 p-8 bg-[#f8f9fa] min-h-screen font-sans"
    >
      {/* --- HEADER --- */}
      <motion.div variants={itemVariants} className="flex justify-between items-center bg-white p-4 pr-6 rounded-[32px] shadow-sm border border-gray-100">
        <div className="pl-4">
          <h1 className="text-xl font-black italic text-gray-900 tracking-tighter uppercase">
            Mojo <span className="text-[#ceaf4a]">Panel</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-r border-gray-100 pr-6">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Créateur Connecté</p>
              <p className="font-bold text-gray-900 leading-tight">
                {loading ? "Chargement..." : userProfile?.full_name || "Utilisateur"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#ceaf4a]/20">
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[#ceaf4a]">
                  <User size={20} />
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-sm"
          >
            {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
          </button>
        </div>
      </motion.div>

      {/* --- CONTENU --- */}
      <div className="grid grid-cols-12 gap-8">
        {/* ANALYTICS */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-10">
               <div>
                  <h3 className="text-3xl font-black text-gray-900 italic">Analyse des revenus</h3>
                  <p className="text-gray-400">Vos revenus ce mois-ci</p>
               </div>
               <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-2xl text-sm font-black">
                 <ArrowUpRight size={18} /> +12.5%
               </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ceaf4a" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ceaf4a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenus" stroke="#ceaf4a" strokeWidth={4} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <QuickActionCard icon={Zap} title="Campagnes" desc="12 briefs" color="bg-blue-500" />
            <QuickActionCard icon={CheckCheck} title="Paiements" desc="3 en attente" color="bg-[#ceaf4a]" />
          </div>
        </motion.div>

        {/* MESSAGES */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4">
           {/* Ton code pour la section Messages ici... */}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Composant pour les cartes d'action
function QuickActionCard({ icon: Icon, title, desc, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
      <div className={`${color} p-4 rounded-2xl text-white shadow-lg`}><Icon size={24} /></div>
      <div>
        <h4 className="font-black text-gray-900">{title}</h4>
        <p className="text-xs text-gray-400 font-bold uppercase">{desc}</p>
      </div>
    </div>
  );
}