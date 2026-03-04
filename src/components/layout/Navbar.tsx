"use client";

import React from "react";
import { LogOut, Leaf, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/ui/GlassCard";

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 p-4 md:p-6 flex justify-center">
            <div className="w-full max-w-7xl">
                <GlassCard className="flex items-center justify-between px-6 py-4 rounded-[2rem] border-white/5 bg-[#0a0c0a]/60 backdrop-blur-3xl shadow-emerald-950/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <Leaf size={20} className="fill-emerald-400/20" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-black text-emerald-50 tracking-tighter uppercase italic">
                                Green<span className="text-emerald-500">Glass</span>
                            </h1>
                            <p className="text-[10px] text-white/30 tracking-[0.2em] font-bold uppercase leading-none mt-0.5">Plant Guardian</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-xs font-bold text-white/70">{user.displayName || "Admin"}</span>
                                    <span className="text-[9px] text-white/30 uppercase tracking-widest">{user.email}</span>
                                </div>
                                <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={14} className="text-white/20" />
                                    )}
                                </div>
                                <div className="h-6 w-px bg-white/10 mx-1" />
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-full hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                                    title="Cerrar sesión"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </nav>
    );
};

export default Navbar;
