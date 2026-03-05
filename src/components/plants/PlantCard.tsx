"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
    Droplets,
    MoreVertical,
    Trash2,
    Edit3,
    Calendar,
    Sprout,
    Archive,
    Copy,
    MapPin,
    Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Plant } from "@/lib/types";
import { cn, calculateWateringStatus } from "@/lib/utils";
import GlassCard from "@/components/ui/GlassCard";
import { useWeather } from "@/hooks/useWeather";
import { Cloud, Home, Sun, CloudSun } from "lucide-react";

interface PlantCardProps {
    plant: Plant;
    onWater: (plant: Plant) => void;
    onEdit: (plant: Plant) => void;
    onDelete: (plantId: string) => void;
    onSnooze: (plantId: string, days: number) => void;
    onArchive: (plantId: string, isArchived: boolean) => void;
    onDuplicate: (plant: Plant) => void;
}

const PlantCard = ({ plant, onWater, onEdit, onDelete, onSnooze, onArchive, onDuplicate }: PlantCardProps) => {
    const [showMenu, setShowMenu] = useState(false);
    const weather = useWeather();
    const [status, setStatus] = useState(calculateWateringStatus(
        plant.lastWateredAt?.toDate?.() || new Date(),
        plant.nextWaterAt?.toDate?.() || new Date(),
        plant.isOutdoor,
        weather.loading ? undefined : weather
    ));

    useEffect(() => {
        const updateStatus = () => {
            setStatus(calculateWateringStatus(
                plant.lastWateredAt?.toDate?.() || new Date(),
                plant.nextWaterAt?.toDate?.() || new Date(),
                plant.isOutdoor,
                weather.loading ? undefined : weather
            ));
        };

        updateStatus();
        const timer = setInterval(updateStatus, 60000);
        return () => clearInterval(timer);
    }, [plant.lastWateredAt, plant.nextWaterAt, plant.isOutdoor, weather]);

    const { progress, statusText, statusColor, diffDays } = status;

    const lightIcons = {
        sol: <Sun size={12} className="text-amber-400" />,
        sombra: <Cloud size={12} className="text-white/40" />,
        semisombra: <CloudSun size={12} className="text-amber-200/60" />,
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -5 }}
            className="relative group h-full"
        >
            <GlassCard className="h-full flex flex-col overflow-visible">
                {/* Plant Image Container */}
                <div className="relative h-48 w-full overflow-hidden bg-emerald-950/20 rounded-t-[1.5rem]">
                    <Image
                        src={plant.photo?.thumbUrl || "/placeholder-plant.png"}
                        alt={plant.nickname || "Planta"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c0a]/90 via-transparent to-transparent" />

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-all shadow-lg border border-white/5",
                            statusColor
                        )}>
                            {statusText}
                        </div>
                        <div className="flex gap-1.5">
                            <div className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/40 text-white/70 backdrop-blur-md flex items-center gap-1 border border-white/5">
                                {plant.isOutdoor ? <Cloud size={10} className="text-blue-400" /> : <Home size={10} className="text-amber-400" />}
                            </div>
                            <div className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/40 text-white/70 backdrop-blur-md flex items-center gap-1 border border-white/5">
                                {lightIcons[plant.light]}
                            </div>
                        </div>
                    </div>

                    {/* Menu Trigger */}
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors z-30"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {/* Actions Menu */}
                    <AnimatePresence>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute top-12 right-3 z-30 w-44 glass-panel rounded-2xl overflow-hidden py-2 border-white/10 bg-[#0a0c0a]/95 backdrop-blur-2xl shadow-2xl"
                                >
                                    <div className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-white/20 border-b border-white/5 mb-1">Acciones</div>
                                    <button onClick={() => { onEdit(plant); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left hover:bg-white/5 text-emerald-100 transition-colors uppercase font-bold tracking-wider">
                                        <Edit3 size={14} className="text-emerald-500" /> Editar Ficha
                                    </button>
                                    <button onClick={() => { onDuplicate(plant); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left hover:bg-white/5 text-white/60 transition-colors uppercase font-bold tracking-wider">
                                        <Copy size={14} className="text-blue-400" /> Duplicar
                                    </button>
                                    <button onClick={() => { onArchive(plant.id, !plant.isArchived); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left hover:bg-white/5 text-white/60 transition-colors uppercase font-bold tracking-wider">
                                        <Archive size={14} className="text-amber-400" /> Archivar
                                    </button>

                                    <div className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-white/20 border-b border-white/5 my-1">Posponer</div>
                                    <div className="grid grid-cols-3 gap-1 px-2 py-1">
                                        {[1, 2, 7].map(d => (
                                            <button key={d} onClick={() => { onSnooze(plant.id, d); setShowMenu(false); }} className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-[10px] font-black transition-colors text-white/60 hover:text-emerald-400">
                                                +{d}D
                                            </button>
                                        ))}
                                    </div>

                                    <button onClick={() => { onDelete(plant.id); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-colors uppercase font-bold tracking-wider mt-1 border-t border-white/5">
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="text-lg font-bold text-emerald-50 tracking-tight group-hover:text-emerald-400 transition-colors truncate">
                                {plant.nickname}
                            </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
                            {plant.plantType && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                    <Sprout size={10} className="text-emerald-500/50" />
                                    <span className="truncate max-w-[80px]">{plant.plantType}</span>
                                </div>
                            )}
                            {plant.location && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                    <MapPin size={10} className="text-blue-500/50" />
                                    <span className="truncate max-w-[80px]">{plant.location}</span>
                                </div>
                            )}
                        </div>

                        {/* Tags Preview */}
                        {plant.tags && plant.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                                {plant.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="px-1.5 py-0.5 rounded-md bg-white/5 text-[8px] font-black uppercase tracking-tighter text-white/20 border border-white/5">
                                        #{tag}
                                    </span>
                                ))}
                                {plant.tags.length > 3 && <span className="text-[8px] text-white/10">+{plant.tags.length - 3}</span>}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-2">
                        {/* Improved Hose-style Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end text-[9px] uppercase tracking-widest font-black">
                                <span className="text-white/20">Progreso del Ciclo</span>
                                <span className={cn(
                                    "font-mono flex items-center gap-1",
                                    diffDays < 0 ? "text-red-400" : diffDays === 0 ? "text-amber-400" : "text-emerald-400"
                                )}>
                                    {diffDays < 0 ? `Atrasada ${Math.abs(diffDays)}d` : diffDays === 0 ? "Hoy toca" : `Faltan ${diffDays}d`}
                                </span>
                            </div>

                            {/* The Hose Container */}
                            <div className="relative w-full h-4 bg-emerald-950/20 rounded-full border border-white/5 p-[2px] overflow-hidden group/hose">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, progress * 100)}%` }}
                                    className={cn(
                                        "h-full rounded-full relative shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors duration-500",
                                        diffDays < 0 ? "bg-red-500" : diffDays === 0 ? "bg-amber-500" : "bg-emerald-500"
                                    )}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Quick Stats Overlay (Details/Actions) */}
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.15em] text-white/20">
                            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white/[0.02]">
                                <Calendar size={10} />
                                <span>Último: {plant.lastWateredAt?.toDate?.()?.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white/[0.02]">
                                <Moon size={10} />
                                <span>Cada {plant.waterEveryDays}d</span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onWater(plant); }}
                            className={cn(
                                "w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all duration-500 shadow-xl",
                                diffDays <= 0
                                    ? "bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-emerald-500/40 active:scale-95"
                                    : "bg-white/5 text-emerald-400/60 hover:text-emerald-400 hover:bg-white/10 active:scale-95 border border-white/5"
                            )}
                        >
                            <Droplets size={16} className={cn(diffDays <= 0 && "animate-bounce")} />
                            {diffDays < 0 ? "Regar ahora" : diffDays === 0 ? "¡Hoy toca!" : "Adelantar Riego"}
                        </button>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default PlantCard;
