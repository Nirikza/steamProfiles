import { prisma } from "@/lib/prisma";

const API_KEY = process.env.STEAM_API_KEY;
const STEAM_ID = process.env.STEAM_ID;

export async function POST() {
    if (!API_KEY || !STEAM_ID) {
        return Response.json(
            { error: "STEAM_API_KEY ou STEAM_ID em falta no .env" },
            { status: 400 }
        );
    }

    const url =
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/` +
        `?key=${API_KEY}` +
        `&steamid=${STEAM_ID}` +
        `&include_appinfo=true` +
        `&include_played_free_games=true`;

    const res = await fetch(url);

    if (!res.ok) {
        return Response.json(
            { error: "Erro ao buscar jogos da Steam" },
            { status: 500 }
        );
    }

    const data = await res.json();
    const games = data.response?.games ?? [];

    for (const game of games) {
        const headerImage = `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`;

        const iconImage = game.img_icon_url
            ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
            : null;

        await prisma.game.upsert({
            where: { appId: game.appid },
            update: {
                name: game.name,
                headerImage,
                iconImage,
            },
            create: {
                appId: game.appid,
                name: game.name,
                headerImage,
                iconImage,
            },
        });
    }

    return Response.json({
        synced: games.length,
    });
}