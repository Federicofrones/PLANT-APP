"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LeafIcon = ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12 2C12 2 4 9 4 15C4 18.3137 6.68629 21 10 21C11.5 21 12 20.5 12 20.5M12 2C12 2 20 9 20 15C20 18.3137 17.3137 21 14 21C12.5 21 12 20.5 12 20.5M12 20.5V15"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const FallingLeaves = () => {
    const [leaves, setLeaves] = useState<{ id: number; x: number; duration: number; delay: number; scale: number; rotation: number }[]>([]);

    const spawnLeaves = useCallback(() => {
        // Only spawn if tab is active
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
            return;
        }

        const newLeaves = Array.from({ length: 15 }).map((_, i) => ({
            id: Date.now() + i,
            x: Math.random() * 100, // percentage
            duration: 6 + Math.random() * 6, // Slightly slower, more graceful
            delay: Math.random() * 3,
            scale: 0.6 + Math.random() * 0.8,
            rotation: Math.random() * 360,
        }));
        setLeaves(newLeaves);

        // Clear leaves after animation to keep DOM clean
        setTimeout(() => {
            setLeaves([]);
        }, 15000);
    }, []);

    useEffect(() => {
        // Initial delay so it doesn't happen exactly on load every time
        const initialDelay = setTimeout(spawnLeaves, 5000);

        // Set interval to 60 seconds
        const interval = setInterval(spawnLeaves, 60000);

        return () => {
            clearTimeout(initialDelay);
            clearInterval(interval);
        };
    }, [spawnLeaves]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
            <AnimatePresence>
                {leaves.map((leaf) => (
                    <motion.div
                        key={leaf.id}
                        initial={{ y: -50, x: `${leaf.x}vw`, opacity: 0, rotate: leaf.rotation }}
                        animate={{
                            y: "110vh",
                            x: `${leaf.x + (Math.random() * 30 - 15)}vw`,
                            opacity: [0, 1, 1, 0],
                            rotate: leaf.rotation + 360,
                        }}
                        transition={{
                            duration: leaf.duration,
                            delay: leaf.delay,
                            ease: "linear",
                        }}
                        className="absolute"
                        style={{ scale: leaf.scale }}
                    >
                        <LeafIcon color={leaf.id % 2 === 0 ? "#10b981" : "#059669"} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default FallingLeaves;
