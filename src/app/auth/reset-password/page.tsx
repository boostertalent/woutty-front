'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
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
      setTimeout(() => router.push('/auth/login'), 2000);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 overflow-hidden font-sans">
      
      {/* Background Glows Dorés */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ceaf4a]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ceaf4a]/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-[460px] space-y-8 bg-white p-8 sm:p-12 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100"
      >
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ceaf4a]/10 text-[#ceaf4a] mb-4">
            <Lock size={28} />
          </div>
          <h2 className="text-3xl font-bold text-[#ceaf4a] tracking-tight">Sécurisez votre compte</h2>
          <p className="text-gray-500 font-medium">Choisissez un nouveau mot de passe fort.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleUpdatePassword}>
          <div className="space-y-4">
            {/* Nouveau mot de passe */}
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1 text-gray-700 uppercase tracking-wider">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-5 py-4 text-gray-900 transition-all focus:border-[#ceaf4a] focus:bg-white focus:outline-none shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ceaf4a] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmation */}
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1 text-gray-700 uppercase tracking-wider">Confirmer le mot de passe</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="block w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-5 py-4 text-gray-900 transition-all focus:border-[#ceaf4a] focus:bg-white focus:outline-none shadow-sm"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status && (
              <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-bold border ${
                  status.type === 'success' 
                    ? 'bg-green-50 text-green-700 border-green-100' 
                    : 'bg-red-50 text-red-600 border-red-100'
                }`}
              >
                {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                <span className="leading-tight">{status.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BOUTON DORÉ */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || status?.type === 'success'}
            className={`group relative w-full h-[60px] overflow-hidden rounded-2xl text-sm font-bold text-white transition-all shadow-lg ${
              loading || status?.type === 'success'
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#ceaf4a] hover:bg-[#b8962f] shadow-[#ceaf4a]/30"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
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
                  <span>Mettre à jour le mot de passe</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}