"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export default function BrandVisual() {
  const { scrollYProgress } = useScroll();

  const bgY = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    /* ✅ bg-background remplace bg-[#050505] pour changer de couleur au clic */
    <section className="relative w-full h-[600px] md:h-[850px] flex items-center justify-center overflow-hidden bg-background transition-colors duration-500">

      {/* ================= BACKGROUND DYNAMIQUE ================= */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0"
      >
        {/* Aura principale jaune (Légèrement plus opaque en mode clair pour rester visible) */}
        <motion.div
          animate={{
            x: [0, 120, -80, 0],
            y: [0, -100, 80, 0],
            scale: [1, 1.3, 0.9, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-booster-yellow/20 dark:bg-booster-yellow/20 rounded-full blur-[140px]"
        />

        {/* Aura secondaire chaude */}
        <motion.div
          animate={{
            x: [0, -100, 100, 0],
            y: [0, 120, -120, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-400/10 dark:bg-orange-400/10 rounded-full blur-[130px]"  />

        {/* Aura froide (S'adapte : Bleue en sombre, Grise en clair) */}
        <motion.div
          animate={{
            x: [0, 60, -60, 0],
            y: [0, -60, 60, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/3 w-[420px] h-[420px] bg-blue-400/5 dark:bg-white/6 rounded-full blur-[110px]"
        />

        {/* Gradient animé global */}
        <motion.div
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,208,0,0.1),transparent_65%)]"
        />
      </motion.div>

      {/* ================= CONTENU ================= */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* Glow pulsant sous le titre */}
          <motion.div
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 blur-[70px] bg-booster-yellow/30 scale-150 rounded-full"
          />

          {/* ✅ text-foreground remplace text-white pour devenir noir en mode clair */}
          <h1 className="
            relative
            text-[110px] md:text-[240px]
            font-normal italic
            font-instrument
            text-foreground
            leading-none
            tracking-tighter
            drop-shadow-[0_12px_20px_rgba(0,0,0,0.1)]
            dark:drop-shadow-[0_12px_20px_rgba(0,0,0,0.6)]
            transition-colors duration-500
          ">
            Woutty
          </h1>
        </motion.div>

        {/* ✅ text-muted-foreground pour un gris qui s'adapte au fond */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-muted-foreground text-[10px] md:text-xs uppercase mt-8 tracking-[0.4em] font-bold text-center max-w-[250px] md:max-w-none"
        >
          Une plateforme qui connecte les marques aux créateurs les plus authentiques.
        </motion.p>
      </div>

      {/* ================= TEXTURES ================= */}
      <motion.div
        animate={{ opacity: [0.04, 0.07, 0.04] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-100"
      />

      {/* Fade bottom - ✅ from-background remplace from-[#050505] */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent transition-colors duration-500" />
    </section>
  );
}