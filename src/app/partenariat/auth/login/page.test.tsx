'use client';

import { useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      setStatus({ 
        type: 'success', 
        message: '📩 Un lien de réinitialisation a été envoyé sur votre boîte mail.' 
      });
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FDFDFD] px-4 py-12 overflow-hidden font-sans">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-[460px] space-y-8 bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-[2.8rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white"
      >
        
        <div className="text-center space-y-3">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-4">
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Oubli ?</h2>
          <p className="text-black font-bold hover:text-black transition-colors">
            Entrez votre adresse email pour recevoir un lien de réinitialisation sécurisé.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleReset}>
          <div className="space-y-2">
            <label className="text-black font-bold ml-1">Adresse Email</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 pl-14 pr-5 py-4 text-gray-900 transition-all placeholder:text-gray-300 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5 focus:outline-none"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status && (
              <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold border ${
                  status.type === 'success' 
                    ? 'bg-emerald-50/50 text-emerald-700 border-emerald-100' 
                    : 'bg-red-50/50 text-red-600 border-red-100'
                }`}
              >
                {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                {status.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* LE BOUTON ANIMÉ */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || status?.type === 'success'}
            className="group relative w-full h-[60px] overflow-hidden rounded-2xl bg-black text-sm font-bold text-white shadow-2xl shadow-black/10 transition-all hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AnimatePresence mode="wait" initial={false}>
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex items-center justify-center w-full"
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex items-center justify-center gap-2"
                >
                  <span>Réinitialiser</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-400 font-medium">
            Une question ? <Link href="#" className="text-black font-bold hover:underline decoration-2">Contactez le support</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}