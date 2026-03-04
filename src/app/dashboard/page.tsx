"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    LayoutGrid,
    List,
    Leaf,
    Clock,
    Search as SearchIcon,
    Sprout,
    Droplets,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { usePlants } from "@/hooks/usePlants";
import { Plant } from "@/lib/types";
import PlantCard from "@/components/plants/PlantCard";
import PlantModal from "@/components/plants/PlantModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Navbar from "@/components/layout/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const { plants, loading: plantsLoading, addPlant, updatePlant, deletePlant, waterPlant, isLimitReached } = usePlants();
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlant, setEditingPlant] = useState<Plant | undefined>(undefined);
    const [plantToDelete, setPlantToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/");
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
            </div>
        );
    }

    const filteredPlants = plants.filter(p =>
        p.nickname.toLowerCase().includes(search.toLowerCase()) ||
        p.plantType.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: plants.length,
        needsWater: plants.filter(p => {
            const next = p.nextWaterAt.toDate();
            const now = new Date();
            return next <= now;
        }).length,
    };

    const handleOpenAddModal = () => {
        setEditingPlant(undefined);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (plant: Plant) => {
        setEditingPlant(plant);
        setIsModalOpen(true);
    };

    const handleSavePlant = async (plantData: any) => {
        if (editingPlant) {
            await updateProjectedPlant(editingPlant.id, plantData);
        } else {
            await addPlant(plantData);
        }
    };

    // Wrapper for update because of naming conflict in hook
    const updateProjectedPlant = async (id: string, data: any) => {
        await updatePlant(id, data);
    };

    return (
        <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
            <Navbar />

            {/* Hero / Header Section */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl md:text-5xl font-black text-emerald-50 tracking-tight"
                        >
                            Tu Invernadero <span className="text-emerald-500 italic">Personal</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-white/40 font-medium"
                        >
                            Cuidando de {plants.length} compañeras verdes.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-wrap gap-3"
                    >
                        <button
                            onClick={handleOpenAddModal}
                            disabled={isLimitReached}
                            className={cn(
                                "px-6 py-4 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-xl active:scale-95 group",
                                isLimitReached
                                    ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                                    : "bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-emerald-500/20"
                            )}
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                            Nuevo Miembro
                        </button>
                    </motion.div>
                </div>

                {/* Quick Stats & Search */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <GlassCard className="p-5 flex items-center gap-4 bg-emerald-500/5 border-emerald-500/10">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Droplets size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Para Regar Hoy</p>
                            <p className="text-2xl font-black text-emerald-50">{stats.needsWater}</p>
                        </div>
                    </GlassCard>

                    <div className="md:col-span-3">
                        <GlassCard className="p-2 h-full flex items-center px-4 gap-4">
                            <SearchIcon size={20} className="text-white/20" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o especie..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent border-none focus:outline-none text-emerald-50 w-full placeholder:text-white/20 font-medium"
                            />
                        </GlassCard>
                    </div>
                </div>
            </section>

            {/* Plant Grid */}
            <section className="pb-12">
                {plantsLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
                        <Loader2 size={40} className="animate-spin text-emerald-500" />
                        <p className="text-sm font-bold uppercase tracking-widest">Cargando Invernadero...</p>
                    </div>
                ) : filteredPlants.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredPlants.map((plant) => (
                                <PlantCard
                                    key={plant.id}
                                    plant={plant}
                                    onWater={waterPlant}
                                    onEdit={handleOpenEditModal}
                                    onDelete={setPlantToDelete}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-32 text-center"
                    >
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-white/10 mb-6 border border-white/5">
                            <Sprout size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-white/40 italic">No hay nada por aquí...</h3>
                        <p className="text-sm text-white/20 mt-2 max-w-xs">Comienza añadiendo tu primera planta para verla crecer en GreenGlass.</p>
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

            <ConfirmModal
                isOpen={!!plantToDelete}
                onClose={() => setPlantToDelete(null)}
                onConfirm={async () => {
                    if (plantToDelete) {
                        await deletePlant(plantToDelete);
                        setPlantToDelete(null);
                    }
                }}
                title="¿Eliminar Planta?"
                message="Esta acción es irreversible. Se borrarán todos los datos y el historial de riego de esta planta."
            />

            {/* Plant Limit Indicator */}
            {isLimitReached && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
                    <GlassCard className="px-6 py-3 border-amber-500/20 bg-amber-500/5 text-amber-300 text-xs font-bold uppercase tracking-widest flex items-center gap-3 shadow-2xl">
                        <Clock size={16} />
                        Has alcanzado el límite de {plants.length}/30 plantas
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
