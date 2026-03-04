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
    AlertCircle,
    Tag,
    MapPin,
    Sun,
    Cloud,
    CloudSun,
    StickyNote,
    Plus,
    X
} from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { Plant, LightLevel } from "@/lib/types";
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
        location: "",
        light: "semisombra" as LightLevel,
        notes: "",
    });
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                nickname: initialData.nickname,
                plantType: initialData.plantType || "",
                waterEveryDays: initialData.waterEveryDays,
                lastWateredAt: initialData.lastWateredAt.toDate().toISOString().split("T")[0],
                isOutdoor: initialData.isOutdoor || false,
                location: initialData.location || "",
                light: initialData.light || "semisombra",
                notes: initialData.notes || "",
            });
            setTags(initialData.tags || []);
            setPreviewUrl(initialData.photo.thumbUrl);
        } else {
            setFormData({
                nickname: "",
                plantType: "",
                waterEveryDays: 7,
                lastWateredAt: new Date().toISOString().split("T")[0],
                isOutdoor: false,
                location: "",
                light: "semisombra",
                notes: "",
            });
            setTags([]);
            setPreviewUrl(null);
            setSelectedFile(null);
        }
    }, [initialData, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    const addTag = () => {
        if (currentTag && !tags.includes(currentTag.trim())) {
            setTags([...tags, currentTag.trim()]);
            setCurrentTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
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
                tags,
                lastWateredAt: Timestamp.fromDate(new Date(formData.lastWateredAt + "T12:00:00")),
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
                            "w-full h-56 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden relative",
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
                                <span className="text-xs text-white/40 font-medium">Capturar o subir foto</span>
                            </>
                        )}

                        {loading && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                                <Loader2 className="animate-spin text-emerald-400" size={32} />
                            </div>
                        )}

                        {previewUrl && !loading && (
                            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity z-10">
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

                {/* Section: Basic Info */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-1">ESPECIE / TIPO</label>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-1">UBICACIÓN (AMBIENTE)</label>
                            <div className="relative group">
                                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Ej. Living, Balcón..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-1">NIVEL DE LUZ</label>
                            <div className="flex bg-white/5 p-1 rounded-xl gap-1 border border-white/5 h-[54px]">
                                {[
                                    { id: 'sol', icon: <Sun size={14} />, label: 'Sol' },
                                    { id: 'semisombra', icon: <CloudSun size={14} />, label: 'Semi' },
                                    { id: 'sombra', icon: <Cloud size={14} />, label: 'Sombra' }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, light: item.id as LightLevel }))}
                                        className={cn(
                                            "flex-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1",
                                            formData.light === item.id ? "bg-emerald-500 text-white shadow-lg" : "text-white/40 hover:bg-white/5"
                                        )}
                                    >
                                        {item.icon}
                                        <span className="text-[8px] uppercase">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-1">INTERVALO (DÍAS)</label>
                            <div className="relative group">
                                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max="365"
                                    name="waterEveryDays"
                                    value={formData.waterEveryDays}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-1">ÚLTIMO RIEGO</label>
                            <input
                                required
                                type="date"
                                name="lastWateredAt"
                                value={formData.lastWateredAt}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all h-[54px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-1">TAGS (OPCIONAL)</label>
                        <div className="flex flex-wrap gap-2 mb-2 min-h-4">
                            {tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 group">
                                    {tag}
                                    <X size={10} className="cursor-pointer hover:text-white" onClick={() => removeTag(tag)} />
                                </span>
                            ))}
                        </div>
                        <div className="relative group">
                            <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                            <input
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                placeholder="Agregar tag y presiona Enter..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-1">NOTAS / CUIDADOS ESPECIALES</label>
                        <div className="relative group">
                            <StickyNote size={16} className="absolute left-4 top-5 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Escribe aquí cualquier detalle importante..."
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Indoor/Outdoor Toggle */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-1">ENTORNO</label>
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
