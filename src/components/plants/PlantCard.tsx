"use client";

import React, { useState, useEffect } from "react";
import {
    Droplets,
    MoreVertical,
    Trash2,
    Edit3,
    Calendar,
    Sprout
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Plant } from "@/lib/types";
import { cn, calculateWateringStatus } from "@/lib/utils";
import GlassCard from "@/components/ui/GlassCard";
import { useWeather } from "@/hooks/useWeather";
import { Cloud, Home } from "lucide-react";

interface PlantCardProps {
    plant: Plant;
    onWater: (plant: Plant) => void;
    onEdit: (plant: Plant) => void;
    onDelete: (plantId: string) => void;
}

const PlantCard = ({ plant, onWater, onEdit, onDelete }: PlantCardProps) => {
    const [showMenu, setShowMenu] = useState(false);
    const weather = useWeather();
    const [status, setStatus] = useState(calculateWateringStatus(
        plant.lastWateredAt.toDate(),
        plant.nextWaterAt.toDate(),
        plant.isOutdoor,
        weather.loading ? undefined : weather
    ));

    // Update status every minute or when weather changes
    useEffect(() => {
        const updateStatus = () => {
            setStatus(calculateWateringStatus(
                plant.lastWateredAt.toDate(),
                plant.nextWaterAt.toDate(),
                plant.isOutdoor,
                weather.loading ? undefined : weather
            ));
        };

        updateStatus();
        const timer = setInterval(updateStatus, 60000);

        return () => clearInterval(timer);
    }, [plant.lastWateredAt, plant.nextWaterAt, plant.isOutdoor, weather]);

    const { progress, statusText, statusColor, diffDays } = status;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -5 }}
            className="relative group h-full"
        >
            <GlassCard className="h-full flex flex-col">
                {/* Plant Image Container */}
                <div className="relative h-48 w-full overflow-hidden bg-emerald-950/20">
                    <img
                        src={plant.photo.thumbUrl}
                        alt={plant.nickname}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c0a]/80 via-transparent to-transparent" />

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-all shadow-lg border border-white/5",
                            statusColor
                        )}>
                            {statusText}
                        </div>
                        <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/40 text-white/70 backdrop-blur-md flex items-center gap-1.5 border border-white/5 w-fit">
                            {plant.isOutdoor ? (
                                <><Cloud size={10} className="text-blue-400" /> Exterior</>
                            ) : (
                                <><Home size={10} className="text-amber-400" /> Interior</>
                            )}
                        </div>
                    </div>

                    {/* Menu Trigger */}
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {/* Actions Menu */}
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, x: 10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, x: 10 }}
                                className="absolute top-12 right-3 z-20 w-32 glass-panel rounded-xl overflow-hidden py-1 border-white/5 bg-[#0a0c0a]/90 backdrop-blur-xl"
                            >
                                <button
                                    onClick={() => { onEdit(plant); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/5 text-emerald-100 transition-colors"
                                >
                                    <Edit3 size={14} /> Editar
                                </button>
                                <button
                                    onClick={() => { onDelete(plant.id); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-red-900/10 text-red-400 transition-colors"
                                >
                                    <Trash2 size={14} /> Eliminar
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="text-lg font-semibold text-emerald-50 tracking-tight group-hover:text-emerald-400 transition-colors truncate">
                                {plant.nickname}
                            </h3>
                        </div>

                        {plant.plantType && (
                            <div className="flex items-center gap-1.5 text-xs text-white/40 mb-4">
                                <Sprout size={12} />
                                <span className="truncate">{plant.plantType}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Improved Hose-style Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end text-[10px] uppercase tracking-widest font-black">
                                <span className="text-white/30">Nivel de Agua</span>
                                <span className={cn(
                                    "font-mono flex items-center gap-1",
                                    diffDays < 0 ? "text-red-400" : diffDays === 0 ? "text-amber-400" : "text-emerald-400"
                                )}>
                                    <Droplets size={10} className="animate-pulse" />
                                    {Math.round((1 - progress) * 100)}%
                                </span>
                            </div>

                            {/* The Hose Container with Ribbed Effect */}
                            <div className="relative w-full h-5 bg-[#051a0d] rounded-full border-2 border-emerald-900/50 p-[3px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] overflow-hidden group/hose">
                                {/* Ribbed Texture Overlay */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.5) 50%)', backgroundSize: '8px 100%' }} />

                                {/* Water Flow */}
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(1 - progress) * 100}%` }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    className={cn(
                                        "h-full rounded-full relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.3)]",
                                        diffDays < 0 ? "bg-red-500" : diffDays === 0 ? "bg-amber-500" : "bg-emerald-500"
                                    )}
                                >
                                    {/* Liquid Depth Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20" />

                                    {/* Rapid Wave Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

                                    {/* Bubbles */}
                                    <div className="absolute inset-y-0 right-2 flex items-center gap-1.5 opacity-60">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping shadow-[0_0_8px_white]" />
                                        <div className="w-1 h-1 bg-white rounded-full animate-ping delay-150" />
                                    </div>
                                </motion.div>

                                {/* Detailed Nozzle */}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-6 bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-sm border border-emerald-400/30 group-hover/hose:scale-110 transition-transform shadow-lg z-10 flex items-center justify-center">
                                    <div className="w-1 h-4 bg-emerald-950/40 rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Last Watered Info */}
                        <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-tighter">
                            <Calendar size={12} className="opacity-50" />
                            <span>Ultimo riego: {plant.lastWateredAt.toDate().toLocaleDateString()}</span>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => onWater(plant)}
                            disabled={diffDays > 0}
                            className={cn(
                                "w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-500 border border-transparent",
                                diffDays <= 0
                                    ? "bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border-white/5 hover:border-emerald-500/30 button-glow"
                                    : "bg-white/5 text-white/20 cursor-default"
                            )}
                        >
                            <Droplets size={16} />
                            {diffDays > 0 ? "Hidratada" : "Regar Ahora"}
                        </button>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default PlantCard;
