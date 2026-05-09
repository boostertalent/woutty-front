"use client";

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Instagram, Youtube, Music2, Search, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CreatorsPublicPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  useEffect(() => {
    const fetchCreators = async () => {
      const { data } = await supabase
        .from('createur')
        .select('*')
        .eq('role', 'creator');
      setCreators(data || []);
      setLoading(false);
    };
    fetchCreators();
  }, []);

  const formatNumber = (n: number) =>
    n >= 1000000 ? (n / 1000000).toFixed(1) + 'M'
    : n >= 1000 ? (n / 1000).toFixed(1) + 'K'
    : n?.toString() || '0';

  const filtered = creators.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.instagram_username?.toLowerCase().includes(search.toLowerCase()) ||
    c.tiktok_username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/brands/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nos Créateurs</h1>
            <p className="text-muted-foreground text-sm mt-1">{creators.length} créateurs disponibles</p>
          </div>
        </div>

        {/* Recherche */}
        <div className="relative mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un créateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl outline-none focus:border-booster-yellow transition-colors text-foreground"
          />
        </div>

        {/* Grille */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Aucun créateur trouvé</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((creator, i) => (
              <motion.div
                key={creator.id_w}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-3xl p-6 hover:border-booster-yellow hover:shadow-lg transition-all"
              >
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mx-auto mb-4">
                  {creator.avatar_url ? (
                    <img src={creator.avatar_url} alt={creator.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-booster-yellow/20 text-booster-yellow font-black text-2xl">
                      {creator.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>

                {/* Nom */}
                <h3 className="font-bold text-foreground text-center mb-1">{creator.full_name || 'Créateur'}</h3>
                <p className="text-xs text-muted-foreground text-center mb-4">
                  {Array.isArray(creator.niche) && creator.niche.length > 0
                    ? creator.niche.slice(0, 2).join(' • ')
                    : 'Créateur de contenu'}
                </p>

                {/* Réseaux */}
                <div className="space-y-2">
                  {creator.instagram_username && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Instagram size={14} className="text-pink-500 shrink-0" />
                      <span className="truncate">@{creator.instagram_username}</span>
                      {creator.instagram_followers > 0 && (
                        <span className="ml-auto font-bold text-foreground">{formatNumber(creator.instagram_followers)}</span>
                      )}
                    </div>
                  )}
                  {creator.tiktok_username && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Music2 size={14} className="text-gray-600 shrink-0" />
                      <span className="truncate">@{creator.tiktok_username}</span>
                      {creator.tiktok_followers > 0 && (
                        <span className="ml-auto font-bold text-foreground">{formatNumber(creator.tiktok_followers)}</span>
                      )}
                    </div>
                  )}
                  {creator.youtube_username && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Youtube size={14} className="text-red-500 shrink-0" />
                      <span className="truncate">@{creator.youtube_username}</span>
                      {creator.youtube_followers > 0 && (
                        <span className="ml-auto font-bold text-foreground">{formatNumber(creator.youtube_followers)}</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}