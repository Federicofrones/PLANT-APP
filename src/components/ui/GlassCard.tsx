import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const GlassCard = ({ children, className, ...props }: GlassCardProps) => {
    return (
        <div
            className={cn(
                "glass-panel rounded-2xl overflow-hidden backdrop-blur-md",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            {children}
        </div>
    );
};

export default GlassCard;
