import { Timestamp } from "firebase/firestore";

export type LightLevel = "sol" | "sombra" | "semisombra";

export interface PlantPhoto {
    fullUrl: string;
    thumbUrl: string;
}

export interface WateringEvent {
    date: Timestamp;
    note?: string;
    wasAutomatic?: boolean;
}

export interface ExtraTask {
    id: string;
    type: string; // 'fertilizar' | 'rotar' | 'poda' | 'otros'
    frequencyDays: number;
    lastDoneAt: Timestamp;
    nextDueAt: Timestamp;
}

export interface Plant {
    id: string;
    nickname: string;
    plantType: string;
    location: string;
    tags: string[];
    light: LightLevel;
    waterEveryDays: number;
    createdAt: Timestamp;
    lastWateredAt: Timestamp;
    nextWaterAt: Timestamp;
    photo: PlantPhoto;
    isOutdoor: boolean;
    isArchived: boolean;
    wateringHistory: WateringEvent[];
    extraTasks: ExtraTask[];
    notes?: string;
}

export interface UserSettings {
    holidayMode: boolean;
    dataSavingMode: boolean;
    notificationEnabled: boolean;
    locations: string[];
    customTags: string[];
}

export interface UserDoc {
    plantCount: number;
    settings?: UserSettings;
}
