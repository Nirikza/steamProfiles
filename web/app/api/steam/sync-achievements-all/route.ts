import { prisma } from "@/lib/prisma";

function timeoutSignal(ms: number) {
    const controller = new AbortController();

    setTimeout(() => {
        controller.abort();
    }, ms);

    return controller.signal;
}

export async function POST() {
    const games = await prisma.game.findMany({
        orderBy: {
            name: "asc",
        },
    });

    let syncedGames = 0;
    let failedGames = 0;
    let syncedAchievements = 0;

    const failures: {
        appId: number;
        name: string;
        status?: number;
        error?: string;
    }[] = [];

    for (const game of games) {
        try {
            const res = await fetch(
                `http://localhost:3000/api/steam/sync-achievements/${game.appId}`,
                {
                    method: "POST",
                    signal: timeoutSignal(15000),
                }
            );

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                failedGames++;

                failures.push({
                    appId: game.appId,
                    name: game.name,
                    status: res.status,
                    error: data?.error ?? "Unknown error",
                });

                continue;
            }

            syncedGames++;
            syncedAchievements += data?.synced ?? 0;
        } catch (error) {
            failedGames++;

            failures.push({
                appId: game.appId,
                name: game.name,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    return Response.json({
        totalGames: games.length,
        syncedGames,
        failedGames,
        syncedAchievements,
        failures,
    });
}