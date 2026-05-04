export type Achievement = {
    id: number;
    apiName: string;
    displayName: string;
    description: string | null;
    achieved: boolean;
    hidden: boolean;
    unlockTime: string | null;
    icon: string | null;
    globalPercent: number | null;
};

export type GameAchievements = {
    appId: number;
    name: string;
    headerImage: string | null;
    iconImage: string | null;
    achievements: Achievement[];
};

export type Filter = "all" | "unlocked" | "locked" | "hidden" | "rare" | "common";

export type Sort =
    | "default"
    | "unlocked-first"
    | "locked-first"
    | "name"
    | "rarity-asc"
    | "rarity-desc";

export type GameStats = {
    total: number;
    unlocked: number;
    locked: number;
    percentage: number;
    isPlatinum: boolean;
    hidden: number;
    rare: number;
    rareUnlocked: number;
};

export type AISource = {
    title: string;
    url: string;
    snippet?: string;
};