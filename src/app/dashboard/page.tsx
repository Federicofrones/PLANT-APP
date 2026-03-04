"use client";

import Image from "next/image";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search as SearchIcon,
    Sprout,
    Droplets,
    Loader2,
    Route,
    ChevronRight,
    ChevronLeft,
    Copy,
    Bell,
    Download,
    Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { usePlants } from "@/hooks/usePlants";
import { Plant } from "@/lib/types";
import PlantCard from "@/components/plants/PlantCard";
import PlantModal from "@/components/plants/PlantModal";
import PlantDetail from "@/components/plants/PlantDetail";
import FilterBar, { PlantFilters } from "@/components/plants/FilterBar";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Navbar from "@/components/layout/Navbar";
import WeatherBar from "@/components/ui/WeatherBar";
import GlassCard from "@/components/ui/GlassCard";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const {
        plants,
        loading: plantsLoading,
        addPlant,
        updatePlant,
        deletePlant,
        waterPlant,
        snoozePlant,
        archivePlant,
        duplicatePlant,
        addTask,
        completeTask,
        exportBackup,
        importBackup,
        isLimitReached
    } = usePlants();
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<PlantFilters>({
        environment: 'all',
        light: 'all',
        location: 'all',
        tag: 'all'
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editingPlant, setEditingPlant] = useState<Plant | undefined>(undefined);
    const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
    const [plantToDelete, setPlantToDelete] = useState<string | null>(null);
    const [isRouteMode, setIsRouteMode] = useState(false);
    const [routeIndex, setRouteIndex] = useState(0);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const handleRequestNotifications = async () => {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            showToast("Notificaciones activadas");
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                await importBackup(event.target?.result as string);
                showToast("Backup importado con éxito");
            } catch (err) {
                const message = err instanceof Error ? err.message : "Error desconocido";
                showToast(message, 'error');
            }
        };
        reader.readAsText(file);
    };

    // Derived Data
    const availableLocations = useMemo(() => Array.from(new Set(plants.map(p => p.location))), [plants]);
    const availableTags = useMemo(() => Array.from(new Set(plants.flatMap(p => p.tags))), [plants]);

    const filteredPlants = useMemo(() => {
        return plants.filter(p => {
            const matchesSearch = p.nickname.toLowerCase().includes(search.toLowerCase()) ||
                p.plantType.toLowerCase().includes(search.toLowerCase());
            const matchesEnv = filters.environment === 'all' ||
                (filters.environment === 'interior' && !p.isOutdoor) ||
                (filters.environment === 'exterior' && p.isOutdoor);
            const matchesLight = filters.light === 'all' || p.light === filters.light;
            const matchesLoc = filters.location === 'all' || p.location === filters.location;
            const matchesTag = filters.tag === 'all' || p.tags.includes(filters.tag);

            return matchesSearch && matchesEnv && matchesLight && matchesLoc && matchesTag;
        });
    }, [plants, search, filters]);

    const needsWaterNow = useMemo(() =>
        plants.filter(p => !p.isArchived && p.nextWaterAt.toDate() <= new Date()),
        [plants]);

    const stats = {
        total: plants.length,
        needsWater: needsWaterNow.length,
    };

    if (authLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#050705]">
                <div className="relative">
                    <Loader2 size={48} className="animate-spin text-emerald-500" />
                    <div className="absolute inset-0 blur-2xl bg-emerald-500/20 rounded-full animate-pulse" />
                </div>
            </div>
        );
    }

    const handleOpenAddModal = () => {
        setEditingPlant(undefined);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (plant: Plant) => {
        setEditingPlant(plant);
        setIsModalOpen(true);
    };

    const handleSavePlant = async (plantData: Partial<Plant>) => {
        if (editingPlant) {
            await updatePlant(editingPlant.id, plantData);
            showToast("Planta actualizada");
        } else {
            await addPlant(plantData as Omit<Plant, "id" | "createdAt" | "nextWaterAt">);
            showToast("Nueva planta sembrada");
        }
    };

    const toggleRouteMode = () => {
        setIsRouteMode(!isRouteMode);
        setRouteIndex(0);
    };

    const currentRoutePlant = needsWaterNow[routeIndex];

    return (
        <div className="min-h-screen bg-[#050705]">
            <Navbar />
            <div className="pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto space-y-8">

                <WeatherBar />

                {/* Hero section */}
                <section className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-3">
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-5xl md:text-6xl font-black text-emerald-50 tracking-tighter leading-tight"
                            >
                                Tu <span className="text-emerald-500">Invernadero</span>
                                <br />
                                <span className="text-white/20 italic font-serif">Personal</span>
                            </motion.h2>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-wrap gap-4"
                        >
                            <button
                                onClick={toggleRouteMode}
                                disabled={stats.needsWater === 0}
                                className={cn(
                                    "px-6 py-4 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all relative overflow-hidden group border",
                                    isRouteMode
                                        ? "bg-amber-500 text-white border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                                        : stats.needsWater > 0
                                            ? "bg-white/5 text-emerald-400 border-white/5 hover:bg-white/10"
                                            : "bg-white/2 text-white/10 border-white/5 cursor-not-allowed"
                                )}
                            >
                                <Route size={18} className={cn(isRouteMode && "animate-pulse")} />
                                {isRouteMode ? "Cerrar Ruta" : "Iniciar Ruta"}
                                {stats.needsWater > 0 && !isRouteMode && (
                                    <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white">
                                        {stats.needsWater}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={handleOpenAddModal}
                                disabled={isLimitReached}
                                className={cn(
                                    "px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 relative group",
                                    isLimitReached
                                        ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                                        : "bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-emerald-500/40"
                                )}
                            >
                                <Plus size={18} className="transition-transform duration-500 group-hover:rotate-90" />
                                Nuevo Miembro
                            </button>
                        </motion.div>
                    </div>

                    {/* Stats & Search */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <GlassCard className="p-6 flex items-center gap-5 bg-emerald-950/20 border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 relative z-10">
                                <Droplets size={28} className={cn(stats.needsWater > 0 && "animate-bounce")} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-1">Para Regar Hoy</p>
                                <p className="text-3xl font-black text-emerald-50 tracking-tighter">{stats.needsWater}</p>
                            </div>
                        </GlassCard>

                        <div className="md:col-span-3">
                            <GlassCard className="p-2 h-full flex items-center px-6 gap-6 bg-white/5 border-white/5 focus-within:border-emerald-500/30 transition-all">
                                <SearchIcon size={24} className="text-white/10" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, especie o familia..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-transparent border-none focus:outline-none text-emerald-50 w-full placeholder:text-white/10 font-bold text-lg"
                                />
                            </GlassCard>
                        </div>
                    </div>

                    <FilterBar
                        availableLocations={availableLocations}
                        availableTags={availableTags}
                        onFilterChange={setFilters}
                    />
                </section>

                {/* Watering Route Mode */}
                <AnimatePresence>
                    {isRouteMode && currentRoutePlant && (
                        <motion.section
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="bg-[#0f140f] rounded-[2.5rem] p-8 md:p-12 border border-emerald-500/20 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] flex flex-col items-center gap-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                                <motion.div
                                    className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((routeIndex + 1) / needsWaterNow.length) * 100}%` }}
                                />
                            </div>

                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                    Planta {routeIndex + 1} de {needsWaterNow.length}
                                </div>
                                <h3 className="text-3xl font-black text-white italic tracking-tight">{currentRoutePlant.nickname}</h3>
                                <p className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">{currentRoutePlant.location}</p>
                            </div>

                            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-8 border-white/5 shadow-2xl">
                                <Image
                                    src={currentRoutePlant.photo.fullUrl}
                                    alt={currentRoutePlant.nickname}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setRouteIndex(Math.max(0, routeIndex - 1))}
                                    disabled={routeIndex === 0}
                                    className="p-6 rounded-full bg-white/5 text-white/20 hover:bg-white/10 disabled:opacity-0 transition-all"
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                <button
                                    onClick={async () => {
                                        await waterPlant(currentRoutePlant);
                                        showToast(`${currentRoutePlant.nickname} regada`);
                                        if (routeIndex < needsWaterNow.length - 1) {
                                            setRouteIndex(routeIndex + 1);
                                        } else {
                                            setIsRouteMode(false);
                                            showToast("¡Ruta finalizada!");
                                        }
                                    }}
                                    className="px-12 py-6 rounded-full bg-emerald-500 text-white font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-emerald-400 active:scale-95 transition-all flex items-center gap-4"
                                >
                                    <Droplets size={24} /> ¡Regada!
                                </button>

                                <button
                                    onClick={() => setRouteIndex(Math.min(needsWaterNow.length - 1, routeIndex + 1))}
                                    disabled={routeIndex === needsWaterNow.length - 1}
                                    className="p-6 rounded-full bg-white/5 text-emerald-400/40 hover:bg-white/10 disabled:opacity-0 transition-all"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Plant Grid */}
                <section className="pb-12">
                    {plantsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-[450px] rounded-3xl bg-white/5 animate-pulse border border-white/5 overflow-hidden">
                                    <div className="h-48 bg-white/5" />
                                    <div className="p-6 space-y-4">
                                        <div className="h-6 w-2/3 bg-white/5 rounded-lg" />
                                        <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
                                        <div className="h-20 w-full bg-white/5 rounded-2xl pt-10" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredPlants.length > 0 ? (
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredPlants.map((plant) => (
                                    <div key={plant.id} onClick={() => setSelectedPlant(plant)} className="cursor-pointer">
                                        <PlantCard
                                            plant={plant}
                                            onWater={async (p) => {
                                                await waterPlant(p);
                                                showToast(`${p.nickname} regada`);
                                            }}
                                            onEdit={(p) => handleOpenEditModal(p)}
                                            onDelete={(id) => setPlantToDelete(id)}
                                            onSnooze={async (p, d) => {
                                                await snoozePlant(p, d);
                                                showToast(`Pospuesta ${d} día(s)`);
                                            }}
                                            onArchive={async (id, arc) => {
                                                await archivePlant(id, arc);
                                                showToast(arc ? "Planta archivada" : "Planta restaurada");
                                            }}
                                            onDuplicate={async (p) => {
                                                await duplicatePlant(p);
                                                showToast("Planta duplicada");
                                            }}
                                        />
                                    </div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-40 text-center"
                        >
                            <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center text-white/5 mb-8 border border-white/5 shadow-inner">
                                <Sprout size={64} />
                            </div>
                            <h3 className="text-2xl font-black text-white/20 italic tracking-tight uppercase">Vacío total</h3>
                            <p className="text-xs text-white/10 mt-4 max-w-xs font-bold uppercase tracking-widest leading-relaxed">
                                Tu invernadero digital está esperando a su primer habitante.
                                <br />
                                Dale vida al cristal.
                            </p>
                        </motion.div>
                    )}
                </section>

                {/* Modals */}
                <PlantModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSavePlant}
                    initialData={editingPlant}
                    isLimitReached={isLimitReached}
                />

                <PlantDetail
                    plant={selectedPlant}
                    isOpen={!!selectedPlant}
                    onClose={() => setSelectedPlant(null)}
                    onWater={async (p) => {
                        await waterPlant(p);
                        showToast(`${p.nickname} regada`);
                    }}
                    onAddTask={async (id, t) => {
                        await addTask(id, t);
                        showToast("Tarea añadida");
                    }}
                    onCompleteTask={async (pid, tid) => {
                        await completeTask(pid, tid);
                        showToast("Tarea completada");
                    }}
                    onUpdatePlant={async (id, u) => {
                        await updatePlant(id, u);
                        showToast("Propiedades actualizadas");
                    }}
                />

                <ConfirmModal
                    isOpen={!!plantToDelete}
                    onClose={() => setPlantToDelete(null)}
                    onConfirm={async () => {
                        if (plantToDelete) {
                            await deletePlant(plantToDelete);
                            setPlantToDelete(null);
                            showToast("Planta eliminada", 'error');
                        }
                    }}
                    title="¿Borrrar del registro?"
                    message="Esta planta y todo su historial de crecimiento se perderán en el vacío. No hay vuelta atrás."
                />

                <Modal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    title="Configuración Avanzada"
                >
                    <div className="space-y-6">
                        <section className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-white/30 tracking-widest">Datos y Seguridad</h4>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => { exportBackup(); showToast("Copia descargada"); }}
                                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-between group transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <Download size={18} className="text-emerald-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Exportar Backup JSON</span>
                                    </div>
                                    <ChevronRight size={14} className="text-white/10 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <label className="p-4 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-between group transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Copy size={18} className="text-blue-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Importar Backup JSON</span>
                                    </div>
                                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                                    <ChevronRight size={14} className="text-white/10 group-hover:translate-x-1 transition-transform" />
                                </label>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-white/30 tracking-widest">Preferencias</h4>
                            <button
                                onClick={handleRequestNotifications}
                                className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center gap-3 transition-all"
                            >
                                <Bell size={18} className="text-amber-500" />
                                <span className="text-xs font-bold uppercase tracking-widest text-left">Activar Notificaciones</span>
                            </button>
                        </section>

                        <div className="pt-4 border-t border-white/5">
                            <p className="text-[9px] text-white/20 text-center uppercase tracking-widest leading-relaxed">
                                GreenGlass v1.0.0-PRO<br />
                                Diseñado para el cuidado absoluto.
                            </p>
                        </div>
                    </div>
                </Modal>

                {/* Toasts */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: 20, x: '-50%' }}
                            className={cn(
                                "fixed bottom-28 left-1/2 z-50 px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-3xl border shadow-2xl",
                                toast.type === 'success' ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-red-500/20 border-red-500/30 text-red-400"
                            )}
                        >
                            <div className={cn("w-2 h-2 rounded-full", toast.type === 'success' ? "bg-emerald-500" : "bg-red-500")} />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">{toast.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Global Stats Overlay (Fixed Bottom) */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-md">
                    <GlassCard className="px-8 py-4 flex items-center justify-between border-white/10 bg-[#0a0c0a]/90 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="flex flex-col text-center">
                            <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Colección</span>
                            <span className="text-sm font-black text-emerald-50">{plants.length}/30</span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex flex-col text-center" onClick={() => { if (stats.needsWater > 0) toggleRouteMode(); }}>
                            <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Pendientes</span>
                            <span className={cn("text-sm font-black transition-colors", stats.needsWater > 0 ? "text-amber-400 animate-pulse" : "text-white/20")}>
                                {stats.needsWater}
                            </span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 transition-all hover:text-emerald-400 active:scale-90"
                        >
                            <Settings size={18} />
                        </button>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
