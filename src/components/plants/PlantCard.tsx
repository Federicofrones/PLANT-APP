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

interface PlantCardProps {
    plant: Plant;
    onWater: (plant: Plant) => void;
    onEdit: (plant: Plant) => void;
    onDelete: (plantId: string) => void;
}

const PlantCard = ({ plant, onWater, onEdit, onDelete }: PlantCardProps) => {
    const [showMenu, setShowMenu] = useState(false);
    const [status, setStatus] = useState(calculateWateringStatus(plant.lastWateredAt.toDate(), plant.nextWaterAt.toDate()));

    // Update status every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setStatus(calculateWateringStatus(plant.lastWateredAt.toDate(), plant.nextWaterAt.toDate()));
        }, 60000);

        return () => clearInterval(timer);
    }, [plant.lastWateredAt, plant.nextWaterAt]);

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

                    {/* Status Badge */}
                    <div className={cn(
                        "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md transition-all",
                        statusColor
                    )}>
                        {statusText}
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
                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end text-[10px] uppercase tracking-widest font-bold">
                                <span className="text-white/30">Nivel de Agua</span>
                                <span className={cn(
                                    "font-mono",
                                    diffDays < 0 ? "text-red-400" : diffDays === 0 ? "text-amber-400" : "text-emerald-400"
                                )}>
                                    {Math.round((1 - progress) * 100)}%
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(1 - progress) * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={cn(
                                        "h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]",
                                        diffDays < 0 ? "bg-red-500" : diffDays === 0 ? "bg-amber-500" : "bg-emerald-500"
                                    )}
                                />
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
