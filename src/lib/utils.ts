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

export function calculateWateringStatus(lastWateredAt: Date, nextWaterAt: Date) {
    const now = new Date();
    const total = nextWaterAt.getTime() - lastWateredAt.getTime();
    const elapsed = now.getTime() - lastWateredAt.getTime();
    const progress = Math.min(Math.max(elapsed / total, 0), 1);

    const diffTime = nextWaterAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let statusText = "";
    let statusColor = "bg-emerald-500/30 text-emerald-300";

    if (diffDays > 0) {
        statusText = `Faltan ${diffDays} día${diffDays > 1 ? "s" : ""}`;
    } else if (diffDays === 0) {
        statusText = "Hoy toca regar";
        statusColor = "bg-amber-500/30 text-amber-300 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]";
    } else {
        const overdue = Math.abs(diffDays);
        statusText = `Atrasada ${overdue} día${overdue > 1 ? "s" : ""}`;
        statusColor = "bg-red-500/30 text-red-300 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]";
    }

    return { progress, statusText, statusColor, diffDays };
}
