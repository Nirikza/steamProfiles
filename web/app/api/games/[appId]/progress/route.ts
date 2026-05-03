import { prisma } from "@/lib/prisma";

type RouteParams = {
    params: Promise<{
        appId: string;
    }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
    const { appId } = await params;
    const appIdNumber = Number(appId);

    if (!Number.isInteger(appIdNumber)) {
        return Response.json({ error: "appId inválido" }, { status: 400 });
    }

    const game = await prisma.game.findUnique({
        where: { appId: appIdNumber },
        include: {
            achievements: true,
        },
    });

    if (!game) {
        return Response.json({ error: "Jogo não encontrado" }, { status: 404 });
    }

    const totalAchievements = game.achievements.length;
    const unlockedAchievements = game.achievements.filter(
        (achievement) => achievement.achieved
    ).length;

    const percentage =
        totalAchievements > 0
            ? Math.round((unlockedAchievements / totalAchievements) * 100)
            : 0;

    const isPlatinum =
        totalAchievements > 0 && unlockedAchievements === totalAchievements;

    return Response.json({
        appId: game.appId,
        name: game.name,
        totalAchievements,
        unlockedAchievements,
        percentage,
        isPlatinum,
    });
}