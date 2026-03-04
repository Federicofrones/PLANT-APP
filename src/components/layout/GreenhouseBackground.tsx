"use client";

import React from "react";

const GreenhouseBackground = () => {
    return (
        <div className="glasshouse-bg">
            <div className="sunlight-ray"></div>

            {/* Decorative leaf shapes (simulated with gradients) */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-green-900/10 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 -right-20 w-[400px] h-[400px] bg-green-800/5 rounded-full blur-[120px]" />
            <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[150px]" />

            {/* Structural glass panes overlay effect */}
            <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03]">
                <div className="w-full h-full" style={{
                    backgroundImage: `linear-gradient(90deg, #fff 1px, transparent 1px), linear-gradient(#fff 1px, transparent 1px)`,
                    backgroundSize: '33.33% 33.33%'
                }} />
            </div>

            {/* Bokeh effects */}
            <div className="absolute bottom-20 right-20 w-4 h-4 rounded-full bg-white/10 blur-sm" />
            <div className="absolute top-40 left-10 w-2 h-2 rounded-full bg-white/5 blur-xs animate-pulse" />
        </div>
    );
};

export default GreenhouseBackground;
