"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { 
  ChevronLeft, Trash2, Globe, AlertCircle,
  Instagram, Youtube, Twitter, 
  Music2, MessageCircle, Eye, EyeOff, Loader2, ChevronDown
} from 'lucide-react';

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: <Music2 size={18} />, prefix: '', placeholder: 'nom de profil' },
  { id: 'instagram', name: 'Instagram', icon: <Instagram size={18} />, prefix: '', placeholder: 'nom de profil' },
  { id: 'snapchat', name: 'Snapchat', icon: <MessageCircle size={18} />, prefix: '', placeholder: 'nom de profil' },
  { id: 'twitter', name: 'Twitter / X', icon: <Twitter size={18} />, prefix: '', placeholder: 'nom de profil' },
  { id: 'youtube', name: 'YouTube', icon: <Youtube size={18} />, prefix: '', placeholder: 'nom_de_la_chaine' },
];

export default function SocialMediaSelection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [socials, setSocials] = useState([{ id: Date.now(), platform: '', handle: '' }]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const isPasswordMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = 
    password.length >= 6 && 
    isPasswordMatch && 
    socials.length > 0 &&
    socials.every(s => s.platform !== '' && s.handle.trim().length >= 2);

  const handleFinish = async () => {
    if (!isFormValid || loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const email = localStorage.getItem('onboarding_email');
      const fullName = localStorage.getItem('user_full_name');
      const phone = localStorage.getItem('signup_phone');
      const ageRaw = localStorage.getItem('signup_age');
      const nichesRaw = localStorage.getItem('signup_niche');
      const avatarBase64 = localStorage.getItem('signup_avatar_file');

      
      if (!email) throw new Error("Détails d'inscription manquants (email).");

  
      const parsedAge = ageRaw ? parseInt(ageRaw, 10) : null;
      const finalAge = isNaN(parsedAge as number) ? null : parsedAge;

      
      let niches = [];
      try { 
        niches = nichesRaw ? JSON.parse(nichesRaw) : []; 
      } catch (e) { 
        niches = []; 
      }

      // 1. CRÉER LE COMPTE
      const { data, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName || "",
            phone: phone || "",
            age: finalAge,
            user_niches: niches,
            user_socials: socials.map(s => ({ platform: s.platform, handle: s.handle })),
            role: "creator"
          }
        }
      });

      if (authError) throw authError;

      if (!data.user) {
        throw new Error("Erreur lors de la création du compte");
      }

      const userId = data.user.id;
      console.log("✅ Compte créé:", userId);

      // 2. UPLOAD DE L'AVATAR VERS SUPABASE STORAGE (si existe)
      let avatarUrl = null;

      if (avatarBase64) {
        try {
          console.log("📤 Upload de l'avatar...");

          
          const base64Response = await fetch(avatarBase64);
          const blob = await base64Response.blob();

        
          const fileExt = blob.type.split('/')[1] || 'jpg';
          const fileName = `${userId}-${Date.now()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;

          // Upload vers Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('creator-avatars')
            .upload(filePath, blob, {
              contentType: blob.type,
              upsert: false
            });

          if (uploadError) {
            console.error("❌ Erreur upload avatar:", uploadError);
          } else {
            console.log("✅ Avatar uploadé:", filePath);

            // Obtenir l'URL publique
            const { data: { publicUrl } } = supabase.storage
              .from('creator-avatars')
              .getPublicUrl(filePath);

            avatarUrl = publicUrl;
            console.log("✅ URL publique:", avatarUrl);
          }
        } catch (uploadErr) {
          console.error("⚠️ Erreur upload avatar (non bloquant):", uploadErr);
        }
      }

// 3. CRÉER OU METTRE À JOUR LE PROFIL (UPSERT)
      const { error: profileError } = await supabase
        .from('createur')
        .upsert({
          id_w: userId, 
          full_name: fullName || "",
          email: email,
          phone: phone || "",
          age: finalAge,
          niche: niches,
          avatar_url: avatarUrl,
          role: 'creator',
          // Usernames réseaux sociaux
          instagram_username: socials.find(s => s.platform === 'instagram')?.handle || null,
          youtube_username: socials.find(s => s.platform === 'youtube')?.handle || null,
          tiktok_username: socials.find(s => s.platform === 'tiktok')?.handle || null,
          twitter_username: socials.find(s => s.platform === 'twitter')?.handle || null,
          snapchat_username: socials.find(s => s.platform === 'snapchat')?.handle || null,
          facebook_username: socials.find(s => s.platform === 'facebook')?.handle || null,
          user_socials: socials.map(s => ({ platform: s.platform, handle: s.handle }))
        }, { 
          onConflict: 'id_w'
        });

      if (profileError) {
      
        console.error("❌ Erreur SQL détaillée:", profileError);
        throw new Error(`Erreur base de données: ${profileError.message}`);
      }

      console.log("✅ Profil finalisé avec succès");

      // 4. NETTOYER ET REDIRIGER
      localStorage.clear();
      router.push('/creators/auth/success');

    } catch (err: any) {
      console.error("❌ Erreur Inscription détaillée:", err);
      const friendlyError = err.message === "User already registered" 
        ? "Cet email est déjà utilisé." 
        : "Erreur technique : " + (err.message || "vérifiez votre connexion.");
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const updateSocial = (id: number, field: string, value: string) => {
    setSocials(socials.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  
  const getPlatformIcon = (id: string) => PLATFORMS.find(p => p.id === id)?.icon || <Globe size={18} />;

  return (
    <main className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      <div className="bg-white border border-gray-200 rounded-[32px] p-8 md:p-12 w-full max-w-2xl shadow-xl shadow-gray-200/50">
        
        <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Vos Réseaux</h2>
            <p className="text-gray-500 font-medium text-sm">Connectez vos plateformes pour finaliser votre profil</p>
        </div>

        <div className="space-y-4 mb-6">
          {socials.map((social) => {
            const selectedPlatformInfo = PLATFORMS.find(p => p.id === social.platform);
            return (
                <div key={social.id} className="group flex items-center bg-white border border-gray-200 rounded-2xl p-1.5 focus-within:border-[#ceaf4a] focus-within:ring-4 focus-within:ring-[#ceaf4a]/10 transition-all">
                    <div className="relative min-w-[150px] md:min-w-[180px]">
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl">
                            <span className={social.platform ? 'text-[#ceaf4a]' : 'text-gray-400'}>{getPlatformIcon(social.platform)}</span>
                            <span className={`text-sm font-bold flex-1 truncate ${!social.platform ? 'text-gray-400' : 'text-gray-900'}`}>{selectedPlatformInfo ? selectedPlatformInfo.name : 'Plateforme'}</span>
                            <ChevronDown size={14} className="text-gray-400" />
                        </div>
                        <select 
                            value={social.platform} 
                            onChange={(e) => updateSocial(social.id, 'platform', e.target.value)} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                            <option value="" disabled>Choisir...</option>
                            {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="w-px h-8 bg-gray-200 mx-2" />
                    <div className="flex-1 flex items-center">
                        {selectedPlatformInfo?.prefix && <span className="text-black font-bold pl-2">{selectedPlatformInfo.prefix}</span>}
                        <input 
                            type="text" 
                            placeholder={selectedPlatformInfo?.placeholder || "Pseudo..."}
                            value={social.handle}
                            onChange={(e) => updateSocial(social.id, 'handle', e.target.value)}
                            disabled={!social.platform}
                            className="w-full py-3 px-1 outline-none text-black font-bold bg-transparent text-sm"
                        />
                    </div>
                    {socials.length > 1 && (
                        <button onClick={() => setSocials(socials.filter(s => s.id !== social.id))} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                    )}
                </div>
            );
          })}
        </div>

        <button 
            onClick={() => setSocials([...socials, { id: Date.now(), platform: '', handle: '' }])}
            className="w-full py-4 border border-dashed border-gray-300 rounded-2xl text-gray-500 hover:text-[#ceaf4a] font-bold text-sm mb-8"
        >
            + Ajouter un réseau
        </button>

        <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 space-y-4 mb-8">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest text-center mb-2">Créer votre mot de passe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600">Mot de passe</label>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-white text-black font-bold outline-none focus:border-[#ceaf4a]" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600">Confirmation</label>
                    <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full px-5 py-3.5 rounded-2xl border bg-white text-black font-bold outline-none ${isPasswordMatch ? 'border-green-500' : 'border-gray-200'}`} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                </div>
            </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-start gap-3 border border-red-100 font-bold text-sm"><AlertCircle size={20} /> {error}</div>}

        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          <Link href="/creators/auth/formulaire/etape2" className="text-gray-400 font-bold hover:text-black flex items-center gap-2 text-sm"><ChevronLeft size={18} /> Retour</Link>
          <button 
            onClick={handleFinish} 
            disabled={!isFormValid || loading} 
            className={`px-10 py-4 rounded-2xl font-bold transition-all text-sm uppercase flex items-center justify-center min-w-[200px] ${isFormValid && !loading ? "bg-[#ceaf4a] text-white shadow-xl" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Finaliser mon inscription"}
          </button>
        </div>
      </div>
    </main>
  );
}
