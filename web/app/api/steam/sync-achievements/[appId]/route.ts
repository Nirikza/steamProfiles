import { prisma } from "@/lib/prisma";

const API_KEY = process.env.STEAM_API_KEY;
const STEAM_ID = process.env.STEAM_ID;

type RouteParams = {
    params: Promise<{
        appId: string;
    }>;
};

export async function POST(_request: Request, { params }: RouteParams) {
    const { appId } = await params;
    const appIdNumber = Number(appId);

    if (!API_KEY || !STEAM_ID) {
        return Response.json(
            { error: "STEAM_API_KEY ou STEAM_ID em falta no .env" },
            { status: 400 }
        );
    }

    const game = await prisma.game.findUnique({
        where: { appId: appIdNumber },
    });

    if (!game) {
        return Response.json({ error: "Jogo não encontrado" }, { status: 404 });
    }

    const schemaUrl =
        `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/` +
        `?key=${API_KEY}&appid=${appIdNumber}&l=english`;

    const playerUrl =
        `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/` +
        `?appid=${appIdNumber}&key=${API_KEY}&steamid=${STEAM_ID}&l=english`;

    const [schemaRes, playerRes] = await Promise.all([
        fetch(schemaUrl),
        fetch(playerUrl),
    ]);

    if (!schemaRes.ok || !playerRes.ok) {
        return Response.json(
            { error: "Erro ao buscar achievements da Steam" },
            { status: 500 }
        );
    }

    const schemaData = await schemaRes.json();
    const playerData = await playerRes.json();

    const schemaAchievements =
        schemaData.game?.availableGameStats?.achievements ?? [];

    const playerAchievements = playerData.playerstats?.achievements ?? [];

    const playerMap = new Map(
        playerAchievements.map((achievement: any) => [
            achievement.apiname,
            achievement,
        ])
    );

    for (const schemaAchievement of schemaAchievements) {
        const playerAchievement = playerMap.get(schemaAchievement.name) as any;

        const displayName =
            schemaAchievement.displayName?.trim() ||
            playerAchievement?.name?.trim() ||
            schemaAchievement.name;

        const description =
            schemaAchievement.description?.trim() ||
            playerAchievement?.description?.trim() ||
            null;

        const icon = schemaAchievement.icon || playerAchievement?.icon || null;

        await prisma.achievement.upsert({
            where: {
                gameId_apiName: {
                    gameId: game.id,
                    apiName: schemaAchievement.name,
                },
            },
            update: {
                displayName,
                description,
                icon,
                hidden: schemaAchievement.hidden === 1,
                achieved: playerAchievement?.achieved === 1,
                unlockTime:
                    playerAchievement?.unlocktime && playerAchievement.unlocktime > 0
                        ? new Date(playerAchievement.unlocktime * 1000)
                        : null,
            },
            create: {
                gameId: game.id,
                apiName: schemaAchievement.name,
                displayName,
                description,
                icon,
                hidden: schemaAchievement.hidden === 1,
                achieved: playerAchievement?.achieved === 1,
                unlockTime:
                    playerAchievement?.unlocktime && playerAchievement.unlocktime > 0
                        ? new Date(playerAchievement.unlocktime * 1000)
                        : null,
            },
        });
    }

    return Response.json({
        appId: appIdNumber,
        game: game.name,
        synced: schemaAchievements.length,
    });
}