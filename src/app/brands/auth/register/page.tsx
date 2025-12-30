'use client';

import * as React from "react";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../../lib/supabaseClient';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    domaine: '', 
    website: ''  
  });

  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Vérification de la correspondance des mots de passe
  useEffect(() => {
    if (formData.password_confirmation !== "") {
      setPasswordsMatch(formData.password === formData.password_confirmation);
    } else {
      setPasswordsMatch(true);
    }
  }, [formData.password, formData.password_confirmation]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordsMatch) {
      setErrorMsg("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Inscription dans l'Auth de Supabase
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        // 2. Insertion manuelle dans la table 'profiles'
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: data.user.id, 
            full_name: formData.name, 
            phone: formData.phone,
            role: 'creator',
            
            domaine: formData.domaine, 
            website: formData.website
          });

        if (profileError) console.error("Erreur Profil:", profileError);

        alert("Compte créé avec succès ! Connectez-vous maintenant.");
        router.push('/brands/auth/login');
      }

    } catch (error: any) {
      setErrorMsg(error.message || "Une erreur technique est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-[550px] space-y-8 bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100">
        
        <div className="text-center">
          <Link href="/" className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white text-2xl font-black transition-transform hover:scale-110">
            W
          </Link>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Espace marque</h2>
          <p className="text-black font-bold hover:text-black transition-colors">Rejoignez woutty</p>
        </div>

        <form className="mt-10 space-y-5" onSubmit={handleRegister}>
          <div className="space-y-4">
            
            {/* Nom */}
            <div className="space-y-1.5">
              <label className="text-black font-bold hover:text-black transition-colors">Nom de marque</label>
              <input
                type="text"
                required
                className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none"
                placeholder="Thiam Alioune"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-black font-bold hover:text-black transition-colors">Email</label>
                <input
                  type="email"
                  required
                  className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none"
                  placeholder="thiam.alioune@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-black font-bold hover:text-black transition-colors">Téléphone</label>
                <input
                  type="tel"
                  className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none"
                  placeholder="+221 ..."
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            {/* Domaine & Site Web */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-black font-bold hover:text-black transition-colors">
                  Domaine
                </label>
                <Select
                  value={formData.domaine}
                  onValueChange={(value) => setFormData({ ...formData, domaine: value })}
                >
                  <SelectTrigger className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3.5 text-gray-900 transition-all focus:border-black focus:bg-white focus:outline-none">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Domaines</SelectLabel>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="tech">Technologie</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="sante">Santé</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-bold hover:text-black transition-colors">
                  Site officiel
                </label>
                <input
                  type="url"
                  required
                  className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none"
                  placeholder="www.marque.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-black font-bold hover:text-black transition-colors">Mot de passe</label>
                <input
                  type="password"
                  required
                  className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3.5 text-gray-900 transition-all focus:border-black focus:bg-white focus:outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-black font-bold hover:text-black transition-colors">Confirmation</label>
                <input
                  type="password"
                  required
                  className={`block w-full rounded-2xl border-2 px-4 py-3.5 text-gray-900 transition-all focus:border-black focus:bg-white focus:outline-none ${
                    !passwordsMatch && formData.password_confirmation !== "" 
                    ? "border-red-200 bg-red-50/30" 
                    : "border-gray-50 bg-gray-50/50"
                  }`}
                  placeholder="••••••••"
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">
              <AlertCircle size={18} />
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !passwordsMatch}
            className="group w-full bg-black text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Créer mon compte"
              )}
            </span>
          </button>
        </form>

        <div className="text-center">
           <p className="text-center mt-8 text-sm font-medium text-gray-500">
          Déjà membre ? <Link href="/brands/auth/login" className="text-black font-black hover:underline underline-offset-4 decoration-2">Connexion</Link>
        </p>
        </div>
      </div>
    </div>
  );
}