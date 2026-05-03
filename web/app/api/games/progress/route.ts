import { prisma } from "@/lib/prisma";

export async function GET() {
    const games = await prisma.game.findMany({
        include: {
            achievements: true,
        },
        orderBy: {
            name: "asc",
        },
    });

    const progress = games.map((game) => {
        const totalAchievements = game.achievements?.length;

        const unlockedAchievements = game.achievements.filter(
            (achievement) => achievement.achieved
        ).length;

        const percentage =
            totalAchievements > 0
                ? Math.round((unlockedAchievements / totalAchievements) * 100)
                : 0;

        const isPlatinum =
            totalAchievements > 0 && unlockedAchievements === totalAchievements;

        return {
            appId: game.appId,
            name: game.name,
            totalAchievements,
            unlockedAchievements,
            percentage,
            isPlatinum,
        };
    });

    return Response.json(progress);
}