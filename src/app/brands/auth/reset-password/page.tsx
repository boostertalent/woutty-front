'use client';

import { useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus({ type: 'error', message: error.message });
      setLoading(false);
    } else {
      setStatus({ type: 'success', message: 'Mot de passe mis à jour ! Redirection...' });
      setTimeout(() => router.push('brands/auth/login'), 2000);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FDFDFD] px-4 py-12 overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[460px] space-y-8 bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-[2.8rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white"
      >
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white shadow-2xl mb-4">
            <Lock size={28} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Sécurisez votre compte</h2>
          <p className="text-gray-500 font-medium">Choisissez un nouveau mot de passe fort.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleUpdatePassword}>
          {/* Inputs (Password & Confirm) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-black font-bold ml-1">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-5 py-4 text-gray-900 transition-all focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5 focus:outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-black font-bold ml-1">Confirmer le mot de passe</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-5 py-4 text-gray-900 transition-all focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5 focus:outline-none"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Status Message Animé */}
          <AnimatePresence mode="wait">
            {status && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold border ${
                  status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                }`}
              >
                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {status.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* LE BOUTON ANIMÉ */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || status?.type === 'success'}
            className="relative w-full overflow-hidden rounded-2xl bg-black py-4.5 text-sm font-bold text-white shadow-xl disabled:opacity-50"
          >
            <AnimatePresence mode="wait" initial={false}>
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center"
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                </motion.div>
              ) : (
                <motion.span
                  key="text"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  Confirmer le changement
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}