"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { CREATORS } from "@/data/creators";

const creators = CREATORS.map((c) => ({
  ...c,
  engagement: "—",
  conversion: "—",
  stars: 4,
  tags: ["UGC", "Créativité"],
}));

type Creator = typeof creators[0];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= count ? "text-booster-yellow text-base" : "text-slate-300 text-base"}>★</span>
      ))}
    </div>
  );
}

function CreatorModal({ creator, onClose }: { creator: Creator; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-card border border-border rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl"
        >
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Grande photo */}
          <div className="w-full h-[320px] overflow-hidden bg-black flex items-center justify-center">
            <img
              src={creator.img}
              alt={creator.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Glow jaune */}
          <div className="absolute top-[280px] left-1/2 -translate-x-1/2 w-48 h-8 bg-booster-yellow/20 blur-2xl rounded-full" />

          {/* Infos */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-1">{creator.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{creator.role}</p>
            <StarRating count={creator.stars} />

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-background rounded-2xl p-3 text-center border border-border">
                <p className="text-xs text-muted-foreground mb-1">Engagement</p>
                <p className="text-booster-yellow font-bold text-lg">{creator.engagement}</p>
              </div>
              <div className="bg-background rounded-2xl p-3 text-center border border-border">
                <p className="text-xs text-muted-foreground mb-1">Conversion</p>
                <p className="text-booster-yellow font-bold text-lg">{creator.conversion}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {creator.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function CreatorCard({ creator, onClick }: { creator: Creator; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -4, borderColor: "#F5C200" }}
      onClick={onClick}
      className="w-[280px] flex-shrink-0 bg-card border border-border rounded-2xl p-6 cursor-pointer transition-colors"
    >
      <div className="w-20 h-20 rounded-full overflow-hidden mb-4 bg-slate-100">
        <img
          src={creator.img}
          alt={creator.name}
          className="object-cover w-full h-full"
        />
      </div>
      <p className="font-semibold text-base text-foreground mb-1">{creator.name}</p>
      <p className="text-sm text-muted-foreground mb-3">{creator.role}</p>
      <StarRating count={creator.stars} />
      <div className="space-y-1.5 mb-4 mt-2">
        <p className="text-sm text-muted-foreground">
          Engagement : <span className="text-foreground font-medium">{creator.engagement}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Conversion : <span className="text-foreground font-medium">{creator.conversion}</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {creator.tags.map((tag) => (
          <span key={tag} className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function CreatorCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selected, setSelected] = useState<Creator | null>(null);
  const doubled = [...creators, ...creators];

  const scroll = (direction: "left" | "right") => {
    if (trackRef.current) {
      trackRef.current.scrollBy({
        left: direction === "right" ? 300 : -300,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {selected && (
        <CreatorModal creator={selected} onClose={() => setSelected(null)} />
      )}

      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

        <button
          onClick={() => { scroll("left"); setIsPaused(true); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-booster-yellow transition-colors shadow-md"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        <button
          onClick={() => { scroll("right"); setIsPaused(true); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-booster-yellow transition-colors shadow-md"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>

        <div
          ref={trackRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="overflow-x-auto py-4 px-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div
            className="flex gap-6 w-max"
            style={{ animation: isPaused ? "none" : "marquee 60s ease-in-out infinite" }}
          >
            {doubled.map((creator, index) => (
              <CreatorCard
                key={`${creator.name}-${index}`}
                creator={creator}
                onClick={() => setSelected(creator)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}