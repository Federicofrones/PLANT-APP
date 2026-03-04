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
    getDoc,
    where,
    arrayUnion
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plant, WateringEvent } from "@/lib/types";
import { useAuth } from "./useAuth";

const PLANT_LIMIT = 30;

export const usePlants = (includeArchived = false) => {
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
        let q = query(plantsRef, orderBy("nextWaterAt", "asc"));

        if (!includeArchived) {
            q = query(plantsRef, where("isArchived", "==", false), orderBy("nextWaterAt", "asc"));
        }

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
    }, [user, includeArchived]);

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
                isArchived: false,
                wateringHistory: [],
                extraTasks: [],
                createdAt: Timestamp.now(),
                nextWaterAt: Timestamp.fromDate(nextWaterAt),
            });

            transaction.update(userRef, { plantCount: increment(1) });
        });
    };

    const updatePlant = async (plantId: string, updates: Partial<Plant>) => {
        if (!user) throw new Error("You must be logged in to update a plant.");

        const plantRef = doc(db, "users", user.uid, "plants", plantId);

        if (updates.waterEveryDays !== undefined || (updates.lastWateredAt !== undefined && !updates.nextWaterAt)) {
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

    const waterPlant = async (plant: Plant, manualDate?: Date) => {
        if (!user) throw new Error("You must be logged in.");

        const date = manualDate || new Date();
        const next = new Date(date);
        next.setDate(next.getDate() + plant.waterEveryDays);

        const event: WateringEvent = {
            date: Timestamp.fromDate(date),
            wasAutomatic: !manualDate
        };

        const plantRef = doc(db, "users", user.uid, "plants", plant.id);
        await updateDoc(plantRef, {
            lastWateredAt: Timestamp.fromDate(date),
            nextWaterAt: Timestamp.fromDate(next),
            wateringHistory: arrayUnion(event)
        });
    };

    const snoozePlant = async (plantId: string, days: number) => {
        if (!user) throw new Error("You must be logged in.");
        const plantRef = doc(db, "users", user.uid, "plants", plantId);
        const snap = await getDoc(plantRef);
        const current = snap.data() as Plant;

        const next = current.nextWaterAt.toDate();
        next.setDate(next.getDate() + days);

        await updateDoc(plantRef, {
            nextWaterAt: Timestamp.fromDate(next)
        });
    };

    const archivePlant = async (plantId: string, isArchived: boolean) => {
        if (!user) throw new Error("You must be logged in.");
        const plantRef = doc(db, "users", user.uid, "plants", plantId);
        await updateDoc(plantRef, { isArchived });
    };

    const duplicatePlant = async (plant: Plant) => {
        const cleanData: Omit<Plant, "id" | "createdAt" | "nextWaterAt"> = {
            nickname: `${plant.nickname} (Copia)`,
            plantType: plant.plantType,
            location: plant.location,
            waterEveryDays: plant.waterEveryDays,
            lastWateredAt: plant.lastWateredAt,
            notes: plant.notes,
            photo: plant.photo,
            isOutdoor: plant.isOutdoor,
            light: plant.light,
            tags: plant.tags,
            wateringHistory: [],
            isArchived: false,
            extraTasks: [],
        };

        return await addPlant(cleanData);
    };

    const addTask = async (plantId: string, task: Omit<Plant['extraTasks'][0], 'id' | 'lastDoneAt' | 'nextDueAt'>) => {
        if (!user) throw new Error("You must be logged in.");
        const plantRef = doc(db, "users", user.uid, "plants", plantId);
        const nextDueAt = new Date();
        nextDueAt.setDate(nextDueAt.getDate() + task.frequencyDays);

        const newTask = {
            ...task,
            id: Math.random().toString(36).substr(2, 9),
            lastDoneAt: null,
            nextDueAt: Timestamp.fromDate(nextDueAt)
        };

        await updateDoc(plantRef, {
            extraTasks: arrayUnion(newTask)
        });
    };

    const completeTask = async (plantId: string, taskId: string) => {
        if (!user) throw new Error("You must be logged in.");
        const plantRef = doc(db, "users", user.uid, "plants", plantId);
        const snap = await getDoc(plantRef);
        const current = snap.data() as Plant;

        const updatedTasks = current.extraTasks.map(t => {
            if (t.id === taskId) {
                const now = new Date();
                const next = new Date(now);
                next.setDate(next.getDate() + t.frequencyDays);
                return {
                    ...t,
                    lastDoneAt: Timestamp.fromDate(now),
                    nextDueAt: Timestamp.fromDate(next)
                };
            }
            return t;
        });

        await updateDoc(plantRef, { extraTasks: updatedTasks });
    };

    const exportBackup = () => {
        const data = JSON.stringify(plants, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GreenGlass-Backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const importBackup = async (jsonData: string) => {
        if (!user) throw new Error("You must be logged in.");
        try {
            const importedPlants = JSON.parse(jsonData) as Plant[];
            if (!Array.isArray(importedPlants)) throw new Error("Formato inválido.");

            // Basic validation
            for (const p of importedPlants) {
                if (!p.nickname || !p.waterEveryDays) throw new Error("Datos de planta incompletos.");
            }

            // We use batching or just sequential addPlant (transactional)
            // For now, let's just alert success and start adding
            for (const p of importedPlants) {
                const cleanData: Omit<Plant, "id" | "createdAt" | "nextWaterAt"> = {
                    nickname: p.nickname,
                    plantType: p.plantType,
                    location: p.location,
                    waterEveryDays: p.waterEveryDays,
                    lastWateredAt: p.lastWateredAt,
                    notes: p.notes,
                    photo: p.photo,
                    isOutdoor: p.isOutdoor,
                    light: p.light,
                    tags: p.tags,
                    wateringHistory: p.wateringHistory || [],
                    isArchived: p.isArchived || false,
                    extraTasks: p.extraTasks || [],
                };
                await addPlant(cleanData);
            }
        } catch (err) {
            console.error("Import error:", err);
            throw new Error("Fallo al importar backup. Revisa el archivo.");
        }
    };

    return {
        plants,
        loading,
        error,
        addPlant,
        updatePlant,
        deletePlant,
        waterPlant,
        snoozePlant,
        archivePlant,
        duplicatePlant,
        addTask,
        completeTask,
        exportBackup,
        importBackup,
        isLimitReached: plants.length >= PLANT_LIMIT
    };
};
