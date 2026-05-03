import { prisma } from "@/lib/prisma";

export async function GET() {
    const games = await prisma.game.findMany();
    return Response.json(games);
}