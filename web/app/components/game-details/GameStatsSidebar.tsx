import type { GameAchievements, GameStats } from "./types";

type GameStatsSidebarProps = {
    game: GameAchievements;
    stats: GameStats;
};

export default function GameStatsSidebar({ game, stats }: GameStatsSidebarProps) {
    return (
        <aside className="xl:sticky xl:top-6 xl:self-start">
            <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                {game.headerImage && (
                    <img
                        src={game.headerImage}
                        alt={game.name}
                        className="aspect-video w-full object-cover"
                    />
                )}

                <div className="p-6">
                    <div className="flex items-center gap-4">
                        {game.iconImage && (
                            <img
                                src={game.iconImage}
                                alt={`${game.name} icon`}
                                className="h-12 w-12 rounded"
                            />
                        )}

                        <div>
                            <h1 className="text-3xl font-bold">{game.name}</h1>

                            <p className="mt-1 text-zinc-400">
                                {stats.unlocked} / {stats.total} achievements
                            </p>

                            {stats.hidden > 0 && (
                                <p className="mt-1 text-sm text-purple-400">
                                    {stats.hidden} hidden achievements
                                </p>
                            )}

                            {stats.rare > 0 && (
                                <p className="mt-1 text-sm text-orange-400">
                                    {stats.rare} rare achievements • {stats.rareUnlocked} unlocked
                                </p>
                            )}
                        </div>
                    </div>

                    <p className="mt-6 text-zinc-300">Progress: {stats.percentage}%</p>

                    <div className="mt-3 h-3 w-full rounded-full bg-zinc-800">
                        <div
                            className="h-3 rounded-full bg-blue-500"
                            style={{ width: `${stats.percentage}%` }}
                        />
                    </div>

                    <div className="mt-4 grid gap-3">
                        <div className="rounded-xl bg-zinc-900 p-4">
                            <p className="text-sm text-zinc-400">Unlocked</p>
                            <p className="text-2xl font-bold text-green-400">
                                {stats.unlocked}
                            </p>
                        </div>

                        <div className="rounded-xl bg-zinc-900 p-4">
                            <p className="text-sm text-zinc-400">Locked</p>
                            <p className="text-2xl font-bold text-zinc-300">
                                {stats.locked}
                            </p>
                        </div>

                        <div className="rounded-xl bg-zinc-900 p-4">
                            <p className="text-sm text-zinc-400">Hidden</p>
                            <p className="text-2xl font-bold text-purple-400">
                                {stats.hidden}
                            </p>
                        </div>

                        <div className="rounded-xl border border-orange-900/40 bg-orange-950/30 p-4">
                            <p className="text-sm text-orange-300">Rare unlocked</p>
                            <p className="text-2xl font-bold text-orange-400">
                                {stats.rareUnlocked} / {stats.rare}
                            </p>
                        </div>
                    </div>

                    {stats.isPlatinum && (
                        <p className="mt-4 text-xl font-bold text-yellow-400">🏆 Platinum</p>
                    )}
                </div>
            </section>
        </aside>
    );
}