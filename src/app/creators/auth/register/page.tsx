'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../../lib/supabaseClient';
import { 
  Loader2, 
  AlertCircle, 
  Instagram, 
  Eye, 
  EyeOff, 
  Facebook, 
  Youtube, 
  Twitter, 
  Ghost,
  Check,
  Plus,
  Lock,
  ArrowRight,
  AtSign
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// Configuration des plateformes
const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: 'text-pink-600', bg: 'bg-pink-50', icon: <Instagram size={18} /> },
  { id: 'tiktok', label: 'TikTok', color: 'text-black', bg: 'bg-gray-100', icon: <span className="text-[12px] font-black">TT</span> },
  { id: 'youtube', label: 'YouTube', color: 'text-red-600', bg: 'bg-red-50', icon: <Youtube size={18} /> },
  { id: 'facebook', label: 'Facebook', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Facebook size={18} /> },
  { id: 'twitter', label: 'Twitter/X', color: 'text-black', bg: 'bg-gray-50', icon: <Twitter size={18} /> },
  { id: 'snapchat', label: 'Snapchat', color: 'text-yellow-500', bg: 'bg-yellow-50', icon: <Ghost size={18} /> },
  { id: 'autre', label: 'Autre', color: 'text-purple-600', bg: 'bg-purple-50', icon: <Plus size={18} /> },
];

const CONTENT_TYPES = ["Vlogs", "Humour", "Beauté/Mode", "Tech", "Cuisine", "Gaming", "Éducation", "Sport", "Storytime", "Business","Divertissement", "Autre"];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // États pour les plateformes
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, string[]>>({});
  const [profileNames, setProfileNames] = useState<Record<string, string>>({}); // Nouvel état pour les noms de profil
  const [otherPlatformName, setOtherPlatformName] = useState("");
  const [customContentTypes, setCustomContentTypes] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    social_link: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (formData.confirmPassword !== '') {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [formData.password, formData.confirmPassword]);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => {
      const newPlatforms = { ...prev };
      if (newPlatforms[platformId]) {
        // Désélection : on nettoie tout
        delete newPlatforms[platformId];
        
        if (platformId === 'autre') setOtherPlatformName("");
        
        const newCustomContent = { ...customContentTypes };
        delete newCustomContent[platformId];
        setCustomContentTypes(newCustomContent);

        // Nettoyage du nom de profil
        const newProfileNames = { ...profileNames };
        delete newProfileNames[platformId];
        setProfileNames(newProfileNames);

      } else {
        // Sélection
        newPlatforms[platformId] = [];
      }
      return newPlatforms;
    });
  };

  const toggleContentType = (platformId: string, type: string) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [platformId]: prev[platformId].includes(type)
        ? prev[platformId].filter(t => t !== type)
        : [...prev[platformId], type]
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordsMatch) {
      setErrorMsg("Les mots de passe ne correspondent pas.");
      return;
    }

    if (Object.keys(selectedPlatforms).length === 0) {
      setErrorMsg("Veuillez sélectionner au moins une plateforme.");
      return;
    }

    // Validation spécifique pour "Autre"
    if (selectedPlatforms['autre'] && otherPlatformName.trim().length < 2) {
      setErrorMsg("Veuillez spécifier le nom de l'autre plateforme.");
      return;
    }

    // Validation : Vérifier si les noms de profils sont remplis pour les plateformes sélectionnées
    for (const platformId of Object.keys(selectedPlatforms)) {
        if (!profileNames[platformId] || profileNames[platformId].trim().length < 1) {
            setErrorMsg(`Veuillez entrer votre nom de profil pour ${platformId === 'autre' ? "la plateforme personnalisée" : platformId}.`);
            return;
        }
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.name } },
      });

      if (authError) throw authError;

      if (data.user) {
        const finalCreatorData = {
          platforms: selectedPlatforms,
          usernames: profileNames,    
          other_platform_custom_name: otherPlatformName, 
          custom_content_details: customContentTypes 
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: data.user.id, 
            full_name: formData.name, 
            phone: formData.phone,
            age: formData.age ? parseInt(formData.age) : null,
            social_link: formData.social_link || null,
            creator_type: finalCreatorData, 
            role: 'creator' 
          });

        if (profileError) throw profileError;

        router.push('/creators/auth/login?registered=true');
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 font-sans selection:bg-black selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[720px] bg-white border border-gray-200 rounded-[2rem] p-8 sm:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-10 space-y-2">
          <Link href="/" className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-xl font-black text-lg mb-2 hover:scale-105 transition-transform">
            W
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">Devenir Créateur</h2>
          <p className="text-gray-500 font-medium text-sm text-center max-w-sm">
            Rejoignez la communauté exclusive des talents qui façonnent l'influence de demain.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-10">
          
          {/* Section 1: Identité */}
          <section className="space-y-5">  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-gray-700 ml-1 group-focus-within:text-black transition-colors">Nom complet</label>
                <input
                  type="text" required
                  className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none"
                placeholder="Thiam Alioune"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-gray-700 ml-1 group-focus-within:text-black transition-colors">Âge</label>
                <input
                  type="number" required min="13"
                  className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none"
                  placeholder="24"
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="space-y-2 group">
                <label className="text-xs font-bold text-gray-700 ml-1 group-focus-within:text-black transition-colors">Email</label>
                <input
                  type="email" required
                  className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none"
                  placeholder="contact@exemple.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-gray-700 ml-1 group-focus-within:text-black transition-colors">Téléphone / WhatsApp</label>
                <input
                  type="tel" required
                  value={formData.phone}
                  className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none"
                  placeholder="+221..."
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

          </section>

          {/* Section 2: Plateformes */}
          <section className="space-y-5">
             <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">2</span>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Vos Univers</h3>
                </div>
                <span className="text-[10px] font-bold bg-black text-white px-3 py-1 rounded-full shadow-sm">Choix multiples</span>
             </div>

             <LayoutGroup>
                <motion.div layout className="grid grid-cols-1 gap-4">
                  {PLATFORMS.map((platform) => {
                    const isSelected = !!selectedPlatforms[platform.id];
                    const isAutre = platform.id === 'autre';
                    
                    // Logique de verrouillage :
                    // On ne verrouille le contenu que si c'est "Autre" et que le nom de la plateforme n'est pas mis.
                    // On n'oblige pas encore le profilName pour déverrouiller le contenu, mais on l'affiche en premier.
                    const isContentLocked = isAutre && isSelected && otherPlatformName.trim().length < 2;

                    return (
                      <motion.div
                        layout
                        key={platform.id}
                        initial={false}
                        animate={{ 
                            backgroundColor: isSelected ? "#ffffff" : "rgba(249, 250, 251, 0.5)",
                            borderColor: isSelected ? "#000000" : "transparent"
                        }}
                        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                          isSelected ? "shadow-lg shadow-black/5 ring-1 ring-black/5" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {/* Header de la carte */}
                        <div 
                          onClick={() => togglePlatform(platform.id)}
                          className="flex items-center justify-between p-4 cursor-pointer select-none group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl transition-colors duration-300 ${isSelected ? platform.bg : "bg-white text-gray-300 group-hover:text-gray-400"}`}>
                              <div className={isSelected ? platform.color : ""}>{platform.icon}</div>
                            </div>
                            <span className={`font-bold text-sm transition-colors ${isSelected ? "text-black" : "text-gray-500 group-hover:text-gray-700"}`}>
                              {platform.label}
                            </span>
                          </div>
                          
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 ${
                            isSelected ? "bg-black border-black scale-100" : "border-gray-200 scale-90 group-hover:border-gray-300"
                          }`}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                        </div>

                        {/* Corps de la carte (Expandable) */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="px-4"
                            >
                              <div className="pb-5 pl-[3.25rem]"> 
                                
                                {/* 1. INPUT NOM PLATEFORME (Seulement pour 'Autre') */}
                                {isAutre && (
                                  <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2 block">
                                        Nom de la plateforme <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input 
                                        type="text" 
                                        autoFocus
                                        value={otherPlatformName}
                                        placeholder="Ex: Twitch, LinkedIn..."
                                        className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none"
                                        onChange={(e) => setOtherPlatformName(e.target.value)}
                                        />
                                    </div>
                                  </div>
                                )}

                                {/* 2. INPUT NOM DE PROFIL (NOUVEAU CHAMPS) */}
                                <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-1">
                                        Nom de profil  <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                            <AtSign size={16} />
                                        </div>
                                        <input 
                                        type="text" 
                                        value={profileNames[platform.id] || ''}
                                        placeholder={platform.id === 'autre' ? "Lien ou pseudo" : "@monprofil"}
                                        className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 pl-11 pr-4 py-3.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none"
                                        onChange={(e) => setProfileNames({ ...profileNames, [platform.id]: e.target.value })}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {(profileNames[platform.id] || '').length >= 2 && (
                                                <Check size={16} className="text-green-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 3. SÉLECTION DU CONTENU */}
                                <div className={`transition-all duration-500 ${isContentLocked ? "opacity-40 blur-[1px] grayscale pointer-events-none select-none" : "opacity-100"}`}>
                                    
                                    {isContentLocked && (
                                      <div className="absolute inset-0 z-10 flex items-center justify-center">
                                          <div className="bg-black/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-sm">
                                              <Lock size={10} />
                                              <span>Nom requis d'abord</span>
                                          </div>
                                      </div>
                                    )}

                                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-3 flex items-center justify-between">
                                        <span>Type de contenu</span>
                                        {selectedPlatforms[platform.id].length > 0 && (
                                            <span className="text-black">{selectedPlatforms[platform.id].length} sélectionné(s)</span>
                                        )}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {CONTENT_TYPES.map(type => {
                                            const isActive = selectedPlatforms[platform.id].includes(type);
                                            return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={(e) => {
                                                if(isContentLocked) return;
                                                e.stopPropagation();
                                                toggleContentType(platform.id, type);
                                                }}
                                                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                                                isActive 
                                                    ? "bg-black text-white border-black shadow-md shadow-black/10 transform scale-105" 
                                                    : "bg-white text-gray-500 border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                            >
                                                {type}
                                            </button>
                                            )
                                        })}
                                    </div>

                                    {/* CHAMP DYNAMIQUE "AUTRE CONTENU" */}
                                    <AnimatePresence>
                                        {selectedPlatforms[platform.id].includes('Autre') && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="mt-4 pt-2 border-t border-dashed border-gray-200"
                                        >
                                            <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Précision (Contenu)</label>
                                            <input 
                                            type="text" 
                                            value={customContentTypes[platform.id] || ''}
                                            placeholder="Ex: Astrologie, Crypto..."
                                            className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none"
                                            onChange={(e) => setCustomContentTypes({
                                                ...customContentTypes,
                                                [platform.id]: e.target.value
                                            })}
                                            />
                                        </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
             </LayoutGroup>
          </section>

          {/* Section 3: Sécurité */}
          <section className="space-y-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
               <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">3</span>
               <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Sécurisation</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-gray-700 ml-1 group-focus-within:text-black transition-colors">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required minLength={6}
                    className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none"
                    placeholder="••••••••"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

            <div className="space-y-2 group">
  <label className="text-xs font-bold text-gray-700 ml-1 group-focus-within:text-black transition-colors">
    Confirmation
  </label>
  <input
    type={showPassword ? "text" : "password"}
    required
    placeholder="••••••••"
    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
    className={`block w-full rounded-2xl border-2 px-4 py-3.5 text-sm font-medium outline-none transition-all ${
      !passwordsMatch
        ? "border-red-200 bg-red-50 text-red-900 focus:border-black focus:bg-white focus:text-black" 
        : "border-gray-100 bg-gray-50/50 text-gray-900 focus:border-black focus:bg-white"
    }`}
  />
</div>
            </div>
          </section>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-red-50 p-4 rounded-xl text-red-600 text-sm font-bold border border-red-100"
            >
              <AlertCircle size={18} /> {errorMsg}
            </motion.div>
          )}

          <div className="pt-4">
            <button
                type="submit"
                disabled={loading || !passwordsMatch}
                className="group relative w-full bg-black text-white py-4 rounded-2xl font-black text-base tracking-wide overflow-hidden shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20 transition-all disabled:opacity-50 disabled:hover:shadow-none"
            >
                <div className="absolute inset-0 w-full h-full bg-zinc-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                        <>
                        Créer mon espace créateur <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </span>
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-gray-500">
          Déjà membre ? <Link href="/creators/auth/login" className="text-black font-black hover:underline underline-offset-4 decoration-2">Connexion</Link>
        </p>
      </motion.div>
    </div>
  );
}