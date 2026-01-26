'use client';

import { useState } from 'react';
import {
  Mail,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function ForgotPasswordPro() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
        message: 'Un lien sécurisé a été envoyé. Vérifiez votre boîte mail.'
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[420px] mx-auto min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white border border-gray-200 p-8 rounded-[40px] shadow-xl"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
           
            <h3 className="text-2xl font-black text-black">
              {status?.type === 'success' ? "Lien envoyé !" : "Récupération"}
            </h3>
          </div>
          <Link href="/auth/login" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-black transition-colors">
            <X size={20} />
          </Link>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            {status?.type === 'success'
              ? "Nous avons envoyé un lien de réinitialisation à votre adresse. Si vous ne le voyez pas, vérifiez vos spams."
              : "Entrez l'adresse email associée à votre compte Woutty pour recevoir les instructions."}
          </p>

          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              required
              type="email"
              disabled={status?.type === 'success'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full rounded-2xl border border-transparent bg-gray-50 pl-14 pr-5 py-4 text-black font-bold outline-none focus:bg-white focus:border-[#ceaf4a] focus:ring-4 focus:ring-[#ceaf4a]/5 placeholder:text-gray-400 placeholder:font-medium transition-all"
            />
          </div>

          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`flex items-center gap-3 p-4 rounded-2xl text-xs font-bold border ${
                  status.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : 'bg-red-50 text-red-700 border-red-100'
                }`}
              >
                {status.type === 'success'
                  ? <CheckCircle2 size={18} />
                  : <AlertCircle size={18} />}
                {status.message}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || status?.type === 'success'}
            className="w-full py-4 rounded-2xl bg-black text-white font-bold text-sm uppercase tracking-widest disabled:opacity-50 hover:bg-[#ceaf4a] transition-all active:scale-[0.98] shadow-lg shadow-black/5"
          >
            {loading ? <Loader2 className="animate-spin mx-auto h-5 w-5" /> : "Envoyer"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col items-center gap-4">
            <Link href="/auth/login" className="text-sm font-bold text-gray-400 hover:text-black transition-colors">
                Retour à la connexion
            </Link>
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
                Woutty Secure Shield
            </p>
        </div>
      </motion.div>
    </div>
  );
}