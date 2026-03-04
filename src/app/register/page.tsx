"use client";

import React from "react";
import { Leaf, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AuthForm from "@/components/ui/AuthForm";

const RegisterPage = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="flex flex-col items-center text-center space-y-4 mb-2">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-2">
                        <Leaf size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-emerald-50 tracking-tighter uppercase italic">
                            Green<span className="text-emerald-500">Glass</span>
                        </h1>
                        <p className="text-xs text-white/30 tracking-[0.2em] font-bold uppercase leading-none mt-1">Unirse al Cuidado</p>
                    </div>
                </div>

                <GlassCard className="p-8 border-white/10 shadow-3xl bg-[#0a0c0a]/60 backdrop-blur-3xl">
                    <AuthForm type="register" />
                </GlassCard>

                <button
                    onClick={() => router.push("/")}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white/60 mx-auto transition-colors"
                >
                    <ChevronLeft size={14} /> Volver al Inicio
                </button>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
