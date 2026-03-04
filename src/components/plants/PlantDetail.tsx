"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
    Droplets,
    Sprout,
    MapPin,
    Tag as TagIcon,
    X,
    QrCode,
    Clock,
    History,
    ChevronRight,
    StickyNote,
    Sun,
    Cloud,
    CloudSun,
    CheckCircle2,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Plant, WateringEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import GlassCard from "@/components/ui/GlassCard";
import { QRCodeSVG } from "qrcode.react";

interface PlantDetailProps {
    plant: Plant | null;
    isOpen: boolean;
    onClose: () => void;
    onWater: (plant: Plant) => void;
    onAddTask: (plantId: string, task: { type: string, frequencyDays: number }) => Promise<void>;
    onCompleteTask: (plantId: string, taskId: string) => Promise<void>;
    onUpdatePlant: (plantId: string, updates: Partial<Plant>) => Promise<void>;
}

const PlantDetail = ({ plant, isOpen, onClose, onWater, onAddTask, onCompleteTask, onUpdatePlant }: PlantDetailProps) => {
    const [activeTab, setActiveTab] = useState<'info' | 'history' | 'tasks'>('info');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskDays, setNewTaskDays] = useState(30);

    if (!plant) return null;

    const handleAddTask = async () => {
        if (!newTaskName) return;
        await onAddTask(plant.id, {
            type: newTaskName,
            frequencyDays: newTaskDays
        });
        setNewTaskName("");
        setIsAddingTask(false);
    };

    const handleAdjustInterval = async (avg: number) => {
        await onUpdatePlant(plant.id, { waterEveryDays: avg });
    };

    const downloadQR = () => {
        const svg = document.getElementById(`qr-${plant.id}`);
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new window.Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `QR-${plant.nickname}.png`;
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };
        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    };

    const lightIcons = {
        sol: <Sun size={14} className="text-amber-400" />,
        sombra: <Cloud size={14} className="text-white/40" />,
        semisombra: <CloudSun size={14} className="text-amber-200/60" />,
    };

    const stats = {
        avgInterval: plant.wateringHistory.length > 1
            ? Math.round(
                (plant.wateringHistory[plant.wateringHistory.length - 1].date.toDate().getTime() -
                    plant.wateringHistory[0].date.toDate().getTime()) /
                (plant.wateringHistory.length - 1) /
                (1000 * 60 * 60 * 24)
            )
            : plant.waterEveryDays
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={plant.nickname} size="large">
            <div className="flex flex-col gap-6">
                {/* Hero section with Full Image */}
                <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden shadow-2xl group">
                    <Image
                        src={plant.photo.fullUrl}
                        alt={plant.nickname}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c0a] via-[#0a0c0a]/20 to-transparent" />

                    {/* Floating Info */}
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-white italic drop-shadow-lg">{plant.nickname}</h2>
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] drop-shadow-md">
                                {plant.plantType || "Especie no definida"}
                            </p>
                        </div>
                        <button
                            onClick={downloadQR}
                            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all active:scale-95"
                        >
                            <QrCode size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 p-1 rounded-xl gap-1 border border-white/5">
                    {[
                        { id: 'info', icon: <Sprout size={14} />, label: 'Ficha' },
                        { id: 'history', icon: <History size={14} />, label: 'Historial' },
                        { id: 'tasks', icon: <CheckCircle2 size={14} />, label: 'Tareas' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'info' | 'history' | 'tasks')}
                            className={cn(
                                "flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                activeTab === tab.id ? "bg-emerald-500 text-white shadow-lg" : "text-white/40 hover:bg-white/5"
                            )}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'info' && (
                        <motion.div
                            key="info"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            {/* Data Grid */}
                            <div className="space-y-4">
                                <GlassCard className="p-4 space-y-4">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                <MapPin size={16} />
                                            </div>
                                            <span className="text-[10px] uppercase font-black text-white/30 tracking-widest">Ubicación</span>
                                        </div>
                                        <span className="text-xs font-bold text-white uppercase italic">{plant.location || "No definida"}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                                                <Sun size={16} />
                                            </div>
                                            <span className="text-[10px] uppercase font-black text-white/30 tracking-widest">Nivel de Luz</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {lightIcons[plant.light]}
                                            <span className="text-xs font-bold text-white uppercase italic">{plant.light}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                <Clock size={16} />
                                            </div>
                                            <span className="text-[10px] uppercase font-black text-white/30 tracking-widest">Ciclo</span>
                                        </div>
                                        <span className="text-xs font-bold text-white uppercase italic">Cada {plant.waterEveryDays} días</span>
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-black text-white/30 tracking-widest">
                                        <TagIcon size={14} className="text-emerald-500/40" /> Tags
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {plant.tags.length > 0 ? plant.tags.map(t => (
                                            <span key={t} className="px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-white/60">#{t}</span>
                                        )) : <span className="text-white/20 italic">Sin etiquetas</span>}
                                    </div>
                                </GlassCard>
                            </div>

                            <div className="space-y-4">
                                <GlassCard className="p-4 space-y-3 h-full">
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-black text-white/30 tracking-widest">
                                        <StickyNote size={14} className="text-amber-500/40" /> Notas
                                    </div>
                                    <p className="text-xs text-white/60 leading-relaxed italic">
                                        {plant.notes || "No hay notas adicionales para esta planta."}
                                    </p>
                                </GlassCard>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <GlassCard className="p-4 flex flex-col items-center text-center">
                                    <span className="text-[8px] uppercase font-black text-white/20 mb-1">Riegos Totales</span>
                                    <span className="text-2xl font-black text-emerald-400">{plant.wateringHistory.length}</span>
                                </GlassCard>
                                <GlassCard className="p-4 flex flex-col items-center text-center">
                                    <span className="text-[8px] uppercase font-black text-white/20 mb-1">Frecuencia Real</span>
                                    <span className="text-2xl font-black text-blue-400">{stats.avgInterval}d</span>
                                </GlassCard>
                            </div>

                            <GlassCard className="p-2 overflow-hidden">
                                <div className="max-h-60 overflow-y-auto custom-scrollbar px-2 space-y-1">
                                    {plant.wateringHistory.length > 0 ? (
                                        [...plant.wateringHistory].reverse().map((event, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                        <Droplets size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white">Riego {event.wasAutomatic ? 'Automático' : 'Manual'}</p>
                                                        <p className="text-[10px] text-white/30">{event.date.toDate().toLocaleDateString()} - {event.date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={14} className="text-white/10" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center opacity-30 italic text-sm">No hay registros de riego.</div>
                                    )}
                                </div>
                            </GlassCard>

                            {/* Auto-suggestion */}
                            {plant.wateringHistory.length >= 3 && Math.abs(stats.avgInterval - plant.waterEveryDays) >= 1 && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                        <Clock size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest leading-none mb-1">Sugerencia Inteligente</p>
                                        <p className="text-xs text-white/70">Tu promedio real es {stats.avgInterval} días. ¿Ajustar?</p>
                                    </div>
                                    <button
                                        onClick={() => handleAdjustInterval(stats.avgInterval)}
                                        className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95"
                                    >
                                        Ajustar
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'tasks' && (
                        <motion.div
                            key="tasks"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <GlassCard className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em]">Tareas Recurrentes</h3>
                                    <button
                                        onClick={() => setIsAddingTask(true)}
                                        className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300"
                                    >
                                        Añadir
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {isAddingTask && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3 mb-4 overflow-hidden"
                                            >
                                                <input
                                                    autoFocus
                                                    placeholder="Ej: Fertilizar, Podar..."
                                                    className="w-full bg-black/40 border-none focus:outline-none text-xs text-white p-2 rounded-lg"
                                                    value={newTaskName}
                                                    onChange={(e) => setNewTaskName(e.target.value)}
                                                />
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] uppercase font-black text-white/20">Frecuencia:</span>
                                                        <input
                                                            type="number"
                                                            className="w-16 bg-black/40 border-none focus:outline-none text-xs text-emerald-400 p-2 rounded-lg font-bold"
                                                            value={newTaskDays}
                                                            onChange={(e) => setNewTaskDays(Number(e.target.value))}
                                                        />
                                                        <span className="text-[9px] uppercase font-black text-white/20">días</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setIsAddingTask(false)} className="p-2 text-white/20 hover:text-white"><X size={16} /></button>
                                                        <button onClick={handleAddTask} className="p-2 bg-emerald-500 text-white rounded-lg"><Check size={16} /></button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {plant.extraTasks && plant.extraTasks.length > 0 ? plant.extraTasks.map(task => (
                                        <div key={task.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                    task.nextDueAt.toDate() <= new Date() ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-white/20"
                                                )}>
                                                    <CheckCircle2 size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white uppercase tracking-wider">{task.type}</p>
                                                    <p className="text-[10px] text-white/30 italic">
                                                        Cada {task.frequencyDays}d • Siguiente: {task.nextDueAt.toDate().toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onCompleteTask(plant.id, task.id)}
                                                className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 hover:bg-emerald-500 hover:text-white transition-all"
                                            >
                                                Hecho
                                            </button>
                                        </div>
                                    )) : !isAddingTask && (
                                        <div className="py-10 text-center text-white/20 italic text-xs">No hay tareas adicionales.</div>
                                    )}
                                </div>
                            </GlassCard>

                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                                <Sun size={18} className="text-amber-400" />
                                <p className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">Recordatorio: Revisar plagas cada 15 días</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Final QR Section (Hidden SVG for export) */}
                <div className="hidden">
                    <QRCodeSVG
                        id={`qr-${plant.id}`}
                        value={`https://greenglass.vercel.app/plant/${plant.id}`}
                        size={512}
                        level="H"
                        includeMargin
                    />
                </div>

                {/* Main Action */}
                <button
                    onClick={() => onWater(plant)}
                    className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.5)] transition-all transform active:scale-95 text-xs"
                >
                    <Droplets size={20} className="animate-pulse" /> Marcar como regada
                </button>
            </div>
        </Modal>
    );
};

export default PlantDetail;
