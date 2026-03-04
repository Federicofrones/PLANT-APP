import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(date);
}

export interface WeatherInfo {
    temp: number;
    rain: number;
    humidity: number;
}

export function calculateWateringStatus(
    lastWateredAt: Date,
    nextWaterAt: Date,
    isOutdoor: boolean = false,
    weather?: WeatherInfo
) {
    const now = new Date();
    const total = nextWaterAt.getTime() - lastWateredAt.getTime();
    let elapsed = now.getTime() - lastWateredAt.getTime();

    // Smart adjustment for outdoors
    let weatherBonus = "";
    if (isOutdoor && weather) {
        // If it's hot (>30°C), demand increases (fake elapsed time goes up)
        if (weather.temp > 30) {
            elapsed += (1000 * 60 * 60 * 12); // Add half a day of "thirst"
            weatherBonus = "🔥 Mucho calor";
        }
        // If it's raining (>0.5mm), demand decreases (fake elapsed time goes down)
        if (weather.rain > 0.5) {
            elapsed -= (1000 * 60 * 60 * 24); // Subtract a full day of "thirst"
            weatherBonus = "🌧️ Regada por lluvia";
        }
        // High humidity also helps
        if (weather.humidity > 80 && weather.temp < 25) {
            elapsed -= (1000 * 60 * 60 * 6); // Subtract 6 hours
        }
    }

    const progress = Math.min(Math.max(elapsed / total, 0), 1);
    const remainingTime = total - elapsed;
    const diffDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

    let statusText = "";
    let statusColor = "bg-emerald-500/30 text-emerald-300";

    if (diffDays > 0) {
        statusText = weatherBonus || `Faltan ${diffDays} día${diffDays > 1 ? "s" : ""}`;
    } else if (diffDays === 0) {
        statusText = weatherBonus === "🌧️ Regada por lluvia" ? "Lluvia reciente" : "Hoy toca regar";
        statusColor = "bg-amber-500/30 text-amber-300 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]";
    } else {
        const overdue = Math.abs(diffDays);
        statusText = `Atrasada ${overdue} día${overdue > 1 ? "s" : ""}`;
        statusColor = "bg-red-500/30 text-red-300 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]";
    }

    return { progress, statusText, statusColor, diffDays, weatherBonus };
}
