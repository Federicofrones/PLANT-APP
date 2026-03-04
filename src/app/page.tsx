
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Leaf,
  LogIn,
  Loader2,
  Clock,
  Droplets,
  LayoutGrid
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/ui/GlassCard";

const LandingPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6 pb-20 pt-10">

      {/* Hero Content */}
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-center space-y-12">

        {/* Animated Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-4 group cursor-default"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_80px_rgba(16,185,129,0.2)] transition-shadow duration-700">
            <Leaf size={48} className="fill-emerald-400/20 group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-5xl md:text-7xl font-black text-emerald-50 tracking-tighter uppercase italic drop-shadow-2xl">
              Green<span className="text-emerald-500">Glass</span>
            </h1>
            <p className="text-sm md:text-base text-white/30 tracking-[0.4em] font-bold uppercase leading-none">Guardian de la Vida</p>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl px-4">
          {[
            { icon: <Clock size={20} />, title: "Recordatorios", desc: "No vuelvas a olvidar un riego" },
            { icon: <Droplets size={20} />, title: "Seguimiento", desc: "Historial y ciclo de hidratación" },
            { icon: <LayoutGrid size={20} />, title: "30 Plantas", desc: "Gestión personal ilimitada hasta 30" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
            >
              <GlassCard className="p-6 border-white/5 bg-white/2 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 mx-auto">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight uppercase mb-1">{item.title}</h3>
                <p className="text-xs text-white/40 font-medium">{item.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Login CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm"
        >
          <GlassCard className="p-8 border-white/10 shadow-2xl space-y-6 bg-white/5 backdrop-blur-3xl">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-emerald-50">Comienza Hoy</h2>
              <p className="text-sm text-white/40">Accede a tu invernadero personal en la nube.</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => router.push("/login")}
                className="w-full py-4 rounded-2xl bg-white text-black font-black flex items-center justify-center gap-3 hover:bg-emerald-50 transition-all transform active:scale-95 shadow-xl shadow-white/5"
              >
                <LogIn size={20} /> Entrar
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">o crea tu cuenta</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => router.push("/register")}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
                >
                  Registrarme
                </button>
              </div>
            </div>

            <p className="text-[10px] text-white/20 uppercase tracking-tighter leading-relaxed">
              Al entrar, aceptas que esta es una herramienta <br /> de uso personal y educativo.
            </p>
          </GlassCard>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10 flex items-center gap-3"
        >
          <span>GreenGlass v1.0.0</span>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <span>Local Stable Build</span>
        </motion.div>
      </div>

      {/* Background Orbs (Client side only decorative) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
    </div>
  );
};

export default LandingPage;
