"use client";

import React from "react";
import { CloudRain, Sun, Cloud, Wind, Thermometer, Droplets, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "./GlassCard";
import { useWeather } from "@/hooks/useWeather";

const WeatherBar = () => {
    const weather = useWeather();

    if (weather.loading) return (
        <div className="w-full h-12 bg-white/5 rounded-xl animate-pulse" />
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <GlassCard className="!bg-emerald-950/20 border-emerald-500/10 py-3 px-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                    {/* Location & Condition */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            {weather.rain > 0 ? <CloudRain size={18} /> : weather.condition === "Despejado" ? <Sun size={18} /> : <Cloud size={18} />}
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-black text-white/30 leading-none mb-1">San José de Mayo</p>
                            <p className="text-sm font-bold text-emerald-50 leading-none">{weather.condition}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 shrink-0 border-l border-white/5 pl-6">
                        <div className="flex items-center gap-2">
                            <Thermometer size={14} className="text-orange-400" />
                            <span className="text-sm font-bold text-white">{weather.temp}°C</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/60">
                            <Droplets size={14} className="text-blue-400" />
                            <span className="text-xs font-medium">{weather.humidity}%</span>
                        </div>
                        {weather.windSpeed > 10 && (
                            <div className="flex items-center gap-2 text-white/60">
                                <Wind size={14} className="text-slate-400" />
                                <span className="text-xs font-medium">{Math.round(weather.windSpeed)} km/h</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Alerts */}
                <AnimatePresence>
                    {weather.isAlert && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-red-500/20 border border-red-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 text-red-200 text-[10px] font-black animate-pulse"
                        >
                            <AlertTriangle size={14} />
                            {weather.alertMsg.toUpperCase()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </motion.div>
    );
};

export default WeatherBar;
