"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Save, Loader2, Calendar, Target, DollarSign, Info } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function EditCampaign() {
  const params = useParams();
  // CORRECTION : On récupère "id" car le dossier est [id]
  const id_t_campagne = params?.id; 
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [formData, setFormData] = useState({
    title: '',
    budget: '',
    currency: 'CFA',
    description: '',
    objectives: [] as string[],
    end_date: ''
  });

  const availableObjectives = ["Notoriété", "Ventes", "Engagement", "Conversions"];

  // AJOUT : Fonction pour gérer la sélection des objectifs
  const toggleObjective = (obj: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.includes(obj)
        ? prev.objectives.filter(i => i !== obj)
        : [...prev.objectives, obj]
    }));
  };

  useEffect(() => {
    async function fetchCampaign() {
      if (!id_t_campagne) return; 

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id_t_campagne', id_t_campagne)
          .single();

        if (error) throw error;
        
        if (data) {
          setFormData({
            title: data.title || '',
            budget: data.budget?.toString() || '',
            currency: data.currency || 'CFA',
            description: data.description || '',
            objectives: Array.isArray(data.objectives) ? data.objectives : [],
            end_date: data.end_date || ''
          });
        }
      } catch (err: any) {
        console.error("Erreur de chargement:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaign();
  }, [id_t_campagne, supabase]); 

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id_t_campagne) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          title: formData.title,
          budget: Number(formData.budget),
          objectives: formData.objectives,
          end_date: formData.end_date,
          updated_at: new Date().toISOString()
        })
        .eq('id_t_campagne', id_t_campagne);

      if (error) throw error;
      
      router.push('/brands/dashboard');
      router.refresh();
    } catch (error: any) {
      alert("Erreur lors de la mise à jour : " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F9FAFB] z-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#D4A017]" size={40} />
        <p className="text-gray-500 font-bold">Chargement...</p>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#F9FAFB] min-h-screen">
      <div className="max-w-3xl mx-auto p-6 md:p-10">
        
        <style jsx global>{`
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
          input[type=number] { -moz-appearance: textfield; }
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(68%) sepia(85%) saturate(350%) hue-rotate(355deg) brightness(95%) contrast(85%);
            cursor: pointer;
          }
        `}</style>

        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-gray-400 hover:text-[#111827] mb-8 font-bold transition-all group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Annuler les modifications
        </button>

        <div className="bg-white rounded-[40px] p-8 md:p-12 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 rounded-bl-full -mr-16 -mt-16" />

          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-[#D4A017] text-white rounded-2xl shadow-lg shadow-[#D4A017]/20">
              <Info size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#111827]">Mise à jour</h1>
              <p className="text-gray-400 text-sm">Modifiez les paramètres de votre campagne</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Titre</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[20px] outline-none focus:ring-2 focus:ring-[#D4A017]/20 focus:bg-white transition-all font-bold text-black"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <DollarSign size={14} className="text-[#D4A017]"/> Budget (CFA)
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[20px] outline-none focus:ring-2 focus:ring-[#D4A017]/20 focus:bg-white transition-all font-black text-black"
                    required
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-400 text-xs">CFA</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Calendar size={14} className="text-[#D4A017]"/> Date de fin
                </label>
                <input 
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[20px] outline-none focus:ring-2 focus:ring-[#D4A017]/20 focus:bg-white transition-all font-bold text-black"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Target size={14} className="text-[#D4A017]"/> Objectifs
              </label>
              <div className="flex flex-wrap gap-3">
                {availableObjectives.map(obj => (
                  <button
                    key={obj}
                    type="button"
                    onClick={() => toggleObjective(obj)}
                    className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                      formData.objectives.includes(obj) 
                      ? 'bg-[#D4A017] text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-400 border border-gray-100'
                    }`}
                  >
                    {obj}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full bg-[#111827] text-white py-5 rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? "Mise à jour..." : "Enregistrer les modifications"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}