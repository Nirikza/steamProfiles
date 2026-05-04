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
        return Response.json(
            { error: "appId inválido" },
            { status: 400 }
        );
    }

    try {
        const game = await prisma.game.findUnique({
            where: { appId: appIdNumber },
            include: {
                achievements: true,
            },
        });

        if (!game) {
            return Response.json(
                { error: "Jogo não encontrado" },
                { status: 404 }
            );
        }

        return Response.json({
            appId: game.appId,
            name: game.name,
            headerImage: game.headerImage,
            iconImage: game.iconImage,
            achievements: game.achievements,
        });
    } catch (error) {
        return Response.json(
            {
                error: "Erro ao buscar achievements",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}