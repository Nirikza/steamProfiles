import GameDetails from "@/app/components/GameDetails";

type PageProps = {
    params: Promise<{
        appId: string;
    }>;
};

export default async function GamePage({ params }: PageProps) {
    const { appId } = await params;

    return <GameDetails appId={appId} />;
}