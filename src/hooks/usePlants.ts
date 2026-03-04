"use client";

import { useState, useEffect } from "react";
import {
    collection,
    onSnapshot,
    query,
    orderBy,
    updateDoc,
    doc,
    Timestamp,
    runTransaction,
    increment,
    getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plant } from "@/lib/types";
import { useAuth } from "./useAuth";

const PLANT_LIMIT = 30;

export const usePlants = () => {
    const { user } = useAuth();
    const [plants, setPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setPlants([]);
            setLoading(false);
            return;
        }

        const plantsRef = collection(db, "users", user.uid, "plants");
        const q = query(plantsRef, orderBy("nextWaterAt", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const plantList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Plant[];
            setPlants(plantList);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching plants:", err);
            setError("Failed to fetch plants.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addPlant = async (plantData: Omit<Plant, "id" | "createdAt" | "nextWaterAt">) => {
        if (!user) throw new Error("You must be logged in to add a plant.");

        return await runTransaction(db, async (transaction) => {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await transaction.get(userRef);

            const currentCount = userSnap.data()?.plantCount || 0;
            if (currentCount >= PLANT_LIMIT) {
                throw new Error(`Has alcanzado el límite de ${PLANT_LIMIT} plantas.`);
            }

            const nextWaterAt = new Date(plantData.lastWateredAt.toDate());
            nextWaterAt.setDate(nextWaterAt.getDate() + plantData.waterEveryDays);

            const newPlantRef = doc(collection(db, "users", user.uid, "plants"));

            transaction.set(newPlantRef, {
                ...plantData,
                createdAt: Timestamp.now(),
                nextWaterAt: Timestamp.fromDate(nextWaterAt),
            });

            transaction.update(userRef, { plantCount: increment(1) });
        });
    };

    const updatePlant = async (plantId: string, updates: Partial<Plant>) => {
        if (!user) throw new Error("You must be logged in to update a plant.");

        const plantRef = doc(db, "users", user.uid, "plants", plantId);

        if (updates.waterEveryDays !== undefined || updates.lastWateredAt !== undefined) {
            const snap = await getDoc(plantRef);
            const current = snap.data() as Plant;
            const days = updates.waterEveryDays ?? current.waterEveryDays;
            const last = (updates.lastWateredAt ?? current.lastWateredAt).toDate();
            const next = new Date(last);
            next.setDate(next.getDate() + (days));
            updates.nextWaterAt = Timestamp.fromDate(next);
        }

        await updateDoc(plantRef, updates);
    };

    const deletePlant = async (plantId: string) => {
        if (!user) throw new Error("You must be logged in to delete a plant.");

        return await runTransaction(db, async (transaction) => {
            const userRef = doc(db, "users", user.uid);
            const plantRef = doc(db, "users", user.uid, "plants", plantId);

            transaction.delete(plantRef);
            transaction.update(userRef, { plantCount: increment(-1) });
        });
    };

    const waterPlant = async (plant: Plant) => {
        if (!user) throw new Error("You must be logged in.");

        const now = new Date();
        const next = new Date(now);
        next.setDate(next.getDate() + plant.waterEveryDays);

        const plantRef = doc(db, "users", user.uid, "plants", plant.id);
        await updateDoc(plantRef, {
            lastWateredAt: Timestamp.fromDate(now),
            nextWaterAt: Timestamp.fromDate(next),
        });
    };

    return {
        plants,
        loading,
        error,
        addPlant,
        updatePlant,
        deletePlant,
        waterPlant,
        isLimitReached: plants.length >= PLANT_LIMIT
    };
};
