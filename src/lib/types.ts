import { Timestamp } from "firebase/firestore";

export interface PlantPhoto {
    fullUrl: string;
    thumbUrl: string;
}

export interface Plant {
    id: string;
    nickname: string;
    plantType: string;
    waterEveryDays: number;
    createdAt: Timestamp;
    lastWateredAt: Timestamp;
    nextWaterAt: Timestamp;
    photo: PlantPhoto;
    isOutdoor: boolean;
}

export interface UserDoc {
    plantCount: number;
}
