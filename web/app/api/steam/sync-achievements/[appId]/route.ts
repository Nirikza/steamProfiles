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

    if (!API_KEY || !STEAM_ID) {
        return Response.json(
            { error: "STEAM_API_KEY ou STEAM_ID em falta no .env" },
            { status: 400 }
        );
    }

    const appIdNumber = Number(appId);

    if (!Number.isInteger(appIdNumber)) {
        return Response.json(
            { error: "appId inválido" },
            { status: 400 }
        );
    }

    const game = await prisma.game.findUnique({
        where: { appId: appIdNumber },
    });

    if (!game) {
        return Response.json(
            { error: "Jogo não encontrado na base de dados. Faz sync dos jogos primeiro." },
            { status: 404 }
        );
    }

    const url =
        `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/` +
        `?appid=${appIdNumber}` +
        `&key=${API_KEY}` +
        `&steamid=${STEAM_ID}` +
        `&l=english`;

    const res = await fetch(url);

    if (!res.ok) {
        const text = await res.text();

        return Response.json(
            {
                error: "Erro ao buscar achievements da Steam",
                status: res.status,
                body: text,
            },
            { status: 500 }
        );
    }

    const data = await res.json();
    const achievements = data.playerstats?.achievements ?? [];

    for (const achievement of achievements) {
        await prisma.achievement.upsert({
            where: {
                gameId_apiName: {
                    gameId: game.id,
                    apiName: achievement.apiname,
                },
            },
            update: {
                achieved: achievement.achieved === 1,
                unlockTime:
                    achievement.unlocktime && achievement.unlocktime > 0
                        ? new Date(achievement.unlocktime * 1000)
                        : null,
            },
            create: {
                gameId: game.id,
                apiName: achievement.apiname,
                displayName: achievement.name ?? achievement.apiname,
                description: achievement.description ?? null,
                achieved: achievement.achieved === 1,
                unlockTime:
                    achievement.unlocktime && achievement.unlocktime > 0
                        ? new Date(achievement.unlocktime * 1000)
                        : null,
            },
        });
    }

    return Response.json({
        appId: appIdNumber,
        game: game.name,
        synced: achievements.length,
    });
}