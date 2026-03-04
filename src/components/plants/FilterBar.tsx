"use client";

import React, { useState } from "react";
import {
    Filter,
    Sun,
    Cloud,
    CloudSun,
    Home,
    MapPin,
    Tag as TagIcon,
    X,
    FilterX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface FilterBarProps {
    onFilterChange: (filters: PlantFilters) => void;
    availableLocations: string[];
    availableTags: string[];
}

export interface PlantFilters {
    environment: 'all' | 'interior' | 'exterior';
    light: 'all' | 'sol' | 'sombra' | 'semisombra';
    location: string;
    tag: string;
}

const FilterBar = ({ onFilterChange, availableLocations, availableTags }: FilterBarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<PlantFilters>({
        environment: 'all',
        light: 'all',
        location: 'all',
        tag: 'all'
    });

    const updateFilter = (newFilters: Partial<PlantFilters>) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        onFilterChange(updated);
    };

    const clearFilters = () => {
        const reset = { environment: 'all', light: 'all', location: 'all', tag: 'all' } as PlantFilters;
        setFilters(reset);
        onFilterChange(reset);
    };

    const hasActiveFilters = filters.environment !== 'all' || filters.light !== 'all' || filters.location !== 'all' || filters.tag !== 'all';

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        isOpen ? "bg-emerald-500 text-white shadow-lg" : "bg-white/5 text-white/40 hover:bg-white/10"
                    )}
                >
                    <Filter size={14} /> Filtros Avanzados
                </button>

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <FilterX size={14} /> Limpiar
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <GlassCard className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 border-white/5">
                            {/* Environment */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 flex items-center gap-2">
                                    <Home size={12} /> Entorno
                                </label>
                                <div className="flex gap-1 bg-black/20 p-1 rounded-xl">
                                    {['all', 'interior', 'exterior'].map((env) => (
                                        <button
                                            key={env}
                                            onClick={() => updateFilter({ environment: env as any })}
                                            className={cn(
                                                "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all",
                                                filters.environment === env ? "bg-white text-emerald-950" : "text-white/30 hover:text-white/60"
                                            )}
                                        >
                                            {env === 'all' ? 'Todo' : env}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Light */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 flex items-center gap-2">
                                    <Sun size={12} /> Luz
                                </label>
                                <div className="flex gap-1 bg-black/20 p-1 rounded-xl">
                                    {['all', 'sol', 'sombra', 'semisombra'].map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => updateFilter({ light: l as any })}
                                            className={cn(
                                                "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all",
                                                filters.light === l ? "bg-white text-emerald-950" : "text-white/30 hover:text-white/60"
                                            )}
                                        >
                                            {l === 'all' ? 'Todo' : l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-500/60 flex items-center gap-2">
                                    <MapPin size={12} /> Ubicación
                                </label>
                                <select
                                    value={filters.location}
                                    onChange={(e) => updateFilter({ location: e.target.value })}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white/60 focus:outline-none focus:border-emerald-500/50 appearance-none font-bold uppercase tracking-wider"
                                >
                                    <option value="all">Cualquier sitio</option>
                                    {availableLocations.filter(Boolean).map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Tags */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-purple-500/60 flex items-center gap-2">
                                    <TagIcon size={12} /> Etiqueta
                                </label>
                                <select
                                    value={filters.tag}
                                    onChange={(e) => updateFilter({ tag: e.target.value })}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white/60 focus:outline-none focus:border-emerald-500/50 appearance-none font-bold uppercase tracking-wider"
                                >
                                    <option value="all">Cualquier tag</option>
                                    {availableTags.filter(Boolean).map(tag => (
                                        <option key={tag} value={tag}>#{tag}</option>
                                    ))}
                                </select>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default FilterBar;
