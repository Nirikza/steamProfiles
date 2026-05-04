import type { Achievement, GameAchievements } from "./types";

export function getAchievementSearchText(
    game: GameAchievements | null,
    achievement: Achievement
) {
    if (!game) return achievement.displayName;

    return `${game.name} ${achievement.displayName} achievement guide`;
}

export function buildAchievementGuideText(
    game: GameAchievements | null,
    achievement: Achievement
) {
    if (!game) return "";

    const searchText = getAchievementSearchText(game, achievement);

    const youtubeSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        searchText
    )}`;

    const writtenGuideSearch = `https://www.google.com/search?q=${encodeURIComponent(
        searchText
    )}`;

    return `Steam Platinum Tracker Guide

Game:
${game.name}

Achievement:
${achievement.displayName}

Description:
${achievement.description ||
        (achievement.hidden
            ? "Hidden achievement. Reveal it in the app or search online for details."
            : "No description available.")
        }

Status:
${achievement.achieved ? "Unlocked" : "Locked"}

Hidden:
${achievement.hidden ? "Yes" : "No"}

Rarity:
${typeof achievement.globalPercent === "number"
            ? `${achievement.globalPercent.toFixed(1)}% global unlock rate`
            : "Unknown"
        }

Recommended searches:

YouTube guide:
${youtubeSearch}

Written guide:
${writtenGuideSearch}

Personal notes:

- 
- 
- 
`;
}