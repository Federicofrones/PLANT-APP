"use client";

import Image from "next/image";

import React, { useState, useRef, useEffect } from "react";
import {
    Camera,
    Leaf,
    HelpCircle,
    Clock,
    Upload,
    Check,
    Loader2,
    AlertCircle
} from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { Plant } from "@/lib/types";
import Modal from "@/components/ui/Modal";
import { processImage, uploadPlantImage } from "@/lib/image-utils";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface PlantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (plantData: Partial<Plant>) => Promise<void>;
    initialData?: Plant;
    isLimitReached?: boolean;
}

const PlantModal = ({ isOpen, onClose, onSave, initialData, isLimitReached }: PlantModalProps) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        nickname: "",
        plantType: "",
        waterEveryDays: 7,
        lastWateredAt: new Date().toISOString().split("T")[0],
        isOutdoor: false,
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                nickname: initialData.nickname,
                plantType: initialData.plantType,
                waterEveryDays: initialData.waterEveryDays,
                lastWateredAt: initialData.lastWateredAt.toDate().toISOString().split("T")[0],
                isOutdoor: initialData.isOutdoor || false,
            });
            setPreviewUrl(initialData.photo.thumbUrl);
        } else {
            setFormData({
                nickname: "",
                plantType: "",
                waterEveryDays: 7,
                lastWateredAt: new Date().toISOString().split("T")[0],
                isOutdoor: false,
            });
            setPreviewUrl(null);
            setSelectedFile(null);
        }
    }, [initialData, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === "waterEveryDays" ? parseInt(value) : value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (loading) return;
        if (!initialData && !selectedFile) {
            setError("Por favor, selecciona una foto de tu planta.");
            return;
        }
        if (!initialData && isLimitReached) {
            setError("Has alcanzado el límite de 30 plantas.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let photoData = initialData?.photo;

            if (selectedFile) {
                const { fullFile } = await processImage(selectedFile as File);
                const plantId = initialData?.id || Math.random().toString(36).substring(7);
                photoData = await uploadPlantImage(user.uid, plantId, fullFile as File);
            }

            await onSave({
                ...formData,
                lastWateredAt: Timestamp.fromDate(new Date(formData.lastWateredAt)),
                photo: photoData,
            });

            onClose();
        } catch (err: unknown) {
            console.error("Error saving plant:", err);
            setError(err instanceof Error ? err.message : "Error al guardar la planta. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Planta" : "Nueva Planta"}>
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center gap-3">
                        <AlertCircle size={18} className="shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Photo Selection */}
                <div className="relative flex flex-col items-center">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "w-full h-48 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden",
                            previewUrl ? "border-solid border-emerald-500/30" : "hover:bg-white/5 bg-white/3"
                        )}
                    >
                        {previewUrl ? (
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <>
                                <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400">
                                    <Camera size={24} />
                                </div>
                                <span className="text-xs text-white/40 font-medium">Click para subir foto</span>
                            </>
                        )}

                        {loading && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                                <Loader2 className="animate-spin text-emerald-400" size={32} />
                            </div>
                        )}

                        {previewUrl && !loading && (
                            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                <div className="bg-black/60 px-4 py-2 rounded-full text-xs text-white flex items-center gap-2 border border-white/10">
                                    <Upload size={14} /> Cambiar foto
                                </div>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-1">APODO (REQUERIDO)</label>
                        <div className="relative group">
                            <Leaf size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                            <input
                                required
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleInputChange}
                                placeholder="Ej. Mi Cactus"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-1">ESPECIE / TIPO (OPCIONAL)</label>
                        <div className="relative group">
                            <HelpCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                            <input
                                name="plantType"
                                value={formData.plantType}
                                onChange={handleInputChange}
                                placeholder="Ej. Ficus lyrata"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-1">INTERVALO (DÍAS)</label>
                            <div className="relative group">
                                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max="100"
                                    name="waterEveryDays"
                                    value={formData.waterEveryDays}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-1">ÚLTIMO RIEGO</label>
                            <div className="relative group">
                                <input
                                    required
                                    type="date"
                                    name="lastWateredAt"
                                    value={formData.lastWateredAt}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Indoor/Outdoor Toggle */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-1">UBICACIÓN</label>
                        <div className="flex bg-white/5 p-1 rounded-xl gap-1 border border-white/5">
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, isOutdoor: false }))}
                                className={cn(
                                    "flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                                    !formData.isOutdoor ? "bg-emerald-500 text-white shadow-lg" : "text-white/40 hover:bg-white/5"
                                )}
                            >
                                Interior
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, isOutdoor: true }))}
                                className={cn(
                                    "flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                                    formData.isOutdoor ? "bg-emerald-500 text-white shadow-lg" : "text-white/40 hover:bg-white/5"
                                )}
                            >
                                Exterior
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || (!initialData && isLimitReached)}
                    className={cn(
                        "w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300 transform active:scale-95",
                        loading
                            ? "bg-white/5 text-white/20"
                            : "bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.5)] hover:bg-emerald-400"
                    )}
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            <Check size={20} />
                            {initialData ? "Guardar Cambios" : "Agregar Planta"}
                        </>
                    )}
                </button>
            </form>
        </Modal >
    );
};

export default PlantModal;
