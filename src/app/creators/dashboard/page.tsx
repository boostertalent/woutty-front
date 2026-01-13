"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { 
  LogOut, User, Loader2, MessageSquare, 
  ArrowUpRight, Zap, CheckCheck 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- ANIMATIONS ---
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

const data = [
  { name: 'Jan', revenus: 1200 },
  { name: 'Fév', revenus: 2100 },
  { name: 'Mar', revenus: 1800 },
  { name: 'Avr', revenus: 3400 },
  { name: 'Mai', revenus: 2900 },
  { name: 'Juin', revenus: 4200 },
];

export default function CreatorDashboard() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{full_name: string, avatar_url: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function getUserData() {
      // 1. On récupère l'utilisateur authentifié
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/auth/login');
        return;
      }

      // 2. On récupère les infos dans la table "createur"
      // CHANGEMENT ICI : On utilise id_w au lieu de id
      const { data, error } = await supabase
        .from('createur') 
        .select('full_name, avatar_url')
        .eq('id_w', user.id) // <--- CHANGEMENT D'ID EFFECTUÉ ICI
        .single();

      if (!error && data) {
        setUserProfile(data);
      } else if (error) {
        console.error("Erreur profil:", error.message);
      }
      
      setLoading(false);
    }
    getUserData();
  }, [supabase, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#ceaf4a]" size={40} />
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-8 p-6 md:p-10 bg-[#f8f9fa] min-h-screen font-sans"
    >
      {/* --- HEADER --- */}
      <motion.div variants={itemVariants} className="flex justify-between items-center bg-white p-4 pr-6 rounded-[32px] shadow-sm border border-gray-100">
        <div className="pl-4">
          <h1 className="text-xl font-black italic text-gray-900 tracking-tighter uppercase">
            Woutty <span className="text-[#ceaf4a]">Panel</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-r border-gray-100 pr-6">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Créateur Connecté</p>
              <p className="font-bold text-gray-900 leading-tight">
                {userProfile?.full_name || "Utilisateur"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#ceaf4a]/20 bg-gray-50">
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#ceaf4a]">
                  <User size={20} />
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
          </button>
        </div>
      </motion.div>

      {/* --- GRILLE PRINCIPALE --- */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <motion.div variants={itemVariants} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 italic">Analyse des revenus</h3>
                  <p className="text-gray-400 font-medium">Suivi financier Woutty</p>
                </div>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-2xl text-sm font-black">
                  <ArrowUpRight size={18} /> +12.5%
                </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ceaf4a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ceaf4a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 'bold'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenus" stroke="#ceaf4a" strokeWidth={4} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickActionCard icon={Zap} title="Campagnes" desc="12 nouveaux briefs" color="bg-blue-500" />
            <QuickActionCard icon={CheckCheck} title="Paiements" desc="3 en cours" color="bg-[#ceaf4a]" />
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black italic">Messages</h3>
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                <MessageSquare size={20} />
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              <p className="text-gray-400 text-sm font-bold text-center py-10 uppercase tracking-widest">
                Aucune nouvelle conversation.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function QuickActionCard({ icon: Icon, title, desc, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-transform cursor-pointer">
      <div className={`${color} p-4 rounded-2xl text-white shadow-lg`}><Icon size={24} /></div>
      <div>
        <h4 className="font-black text-gray-900">{title}</h4>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{desc}</p>
      </div>
    </div>
  );
}