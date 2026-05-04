"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Achievement = {
    id: number;
    apiName: string;
    displayName: string;
    description: string | null;
    achieved: boolean;
    hidden: boolean;
    unlockTime: string | null;
    icon: string | null;
};

type GameAchievements = {
    appId: number;
    name: string;
    headerImage: string | null;
    iconImage: string | null;
    achievements: Achievement[];
};

type Filter = "all" | "unlocked" | "locked" | "hidden";
type Sort = "default" | "unlocked-first" | "locked-first" | "name";

type GameDetailsProps = {
    appId: string;
};

export default function GameDetails({ appId }: GameDetailsProps) {
    const [game, setGame] = useState<GameAchievements | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<Filter>("all");
    const [sort, setSort] = useState<Sort>("default");
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [revealedHidden, setRevealedHidden] = useState<number[]>([]);

    async function loadGame() {
        setLoading(true);

        const res = await fetch(`/api/games/${appId}/achievements`, {
            cache: "no-store",
        });

        const data = await res.json();

        setGame(data);
        setLoading(false);
    }

    async function syncAchievements() {
        setSyncing(true);

        await fetch(`/api/steam/sync-achievements/${appId}`, {
            method: "POST",
        });

        await loadGame();
        setSyncing(false);
    }

    function toggleHiddenReveal(id: number) {
        setRevealedHidden((current) =>
            current.includes(id)
                ? current.filter((achievementId) => achievementId !== id)
                : [...current, id]
        );
    }

    useEffect(() => {
        loadGame();
    }, [appId]);

    const stats = useMemo(() => {
        if (!game) {
            return {
                total: 0,
                unlocked: 0,
                percentage: 0,
                isPlatinum: false,
                hidden: 0,
            };
        }

        const total = game.achievements.length;
        const unlocked = game.achievements.filter(
            (achievement) => achievement.achieved
        ).length;
        const hidden = game.achievements.filter(
            (achievement) => achievement.hidden
        ).length;

        const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
        const isPlatinum = total > 0 && unlocked === total;

        return {
            total,
            unlocked,
            percentage,
            isPlatinum,
            hidden,
        };
    }, [game]);

    const filteredAchievements = useMemo(() => {
        if (!game) return [];

        return game.achievements
            .filter((achievement) => {
                const text = `${achievement.displayName} ${achievement.description ?? ""
                    }`.toLowerCase();

                const matchesSearch = text.includes(search.toLowerCase());

                if (!matchesSearch) return false;

                if (filter === "unlocked") return achievement.achieved;
                if (filter === "locked") return !achievement.achieved;
                if (filter === "hidden") return achievement.hidden;

                return true;
            })
            .sort((a, b) => {
                if (sort === "unlocked-first") {
                    return Number(b.achieved) - Number(a.achieved);
                }

                if (sort === "locked-first") {
                    return Number(a.achieved) - Number(b.achieved);
                }

                if (sort === "name") {
                    return a.displayName.localeCompare(b.displayName);
                }

                return a.id - b.id;
            });
    }, [game, search, filter, sort]);

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white p-6">
                <p className="text-zinc-400">Loading game...</p>
            </main>
        );
    }

    if (!game) {
        return (
            <main className="min-h-screen bg-black text-white p-6">
                <Link href="/" className="text-blue-400 hover:underline">
                    ← Back to dashboard
                </Link>

                <p className="text-red-400 mt-6">Game not found.</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
                <Link href="/" className="text-blue-400 hover:underline">
                    ← Back to dashboard
                </Link>

                <button
                    onClick={syncAchievements}
                    disabled={syncing}
                    className="rounded-xl bg-purple-600 px-4 py-2 font-semibold disabled:opacity-50"
                >
                    {syncing ? "Syncing..." : "Sync achievements"}
                </button>
            </div>

            <section className="mb-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                {game.headerImage && (
                    <img
                        src={game.headerImage}
                        alt={game.name}
                        className="w-full max-h-80 object-cover"
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

                            <p className="text-zinc-400 mt-1">
                                {stats.unlocked} / {stats.total} achievements
                            </p>

                            {stats.hidden > 0 && (
                                <p className="text-purple-400 text-sm mt-1">
                                    {stats.hidden} hidden achievements
                                </p>
                            )}
                        </div>
                    </div>

                    <p className="text-zinc-300 mt-4">Progress: {stats.percentage}%</p>

                    <div className="w-full bg-zinc-800 rounded-full h-3 mt-3">
                        <div
                            className="bg-blue-500 h-3 rounded-full"
                            style={{ width: `${stats.percentage}%` }}
                        />
                    </div>

                    {stats.isPlatinum && (
                        <p className="text-yellow-400 font-bold mt-4 text-xl">
                            🏆 Platinum
                        </p>
                    )}
                </div>
            </section>

            <section className="mb-6 grid gap-3 md:grid-cols-3">
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search achievements..."
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                />

                <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value as Filter)}
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                >
                    <option value="all">All achievements</option>
                    <option value="unlocked">Unlocked only</option>
                    <option value="locked">Locked only</option>
                    <option value="hidden">Hidden only</option>
                </select>

                <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as Sort)}
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                >
                    <option value="default">Default order</option>
                    <option value="unlocked-first">Unlocked first</option>
                    <option value="locked-first">Locked first</option>
                    <option value="name">Name</option>
                </select>
            </section>

            <section className="grid gap-3">
                {filteredAchievements.map((achievement) => {
                    const isHiddenAndNotRevealed =
                        achievement.hidden &&
                        !achievement.achieved &&
                        !revealedHidden.includes(achievement.id);

                    const isHiddenAndRevealed =
                        achievement.hidden &&
                        !achievement.achieved &&
                        revealedHidden.includes(achievement.id);

                    return (
                        <div
                            key={achievement.id}
                            onClick={() => {
                                if (achievement.hidden && !achievement.achieved) {
                                    toggleHiddenReveal(achievement.id);
                                }
                            }}
                            className={`rounded-xl border p-4 ${achievement.hidden && !achievement.achieved
                                    ? "cursor-pointer"
                                    : ""
                                } ${achievement.achieved
                                    ? "border-zinc-700 bg-zinc-950"
                                    : "border-zinc-800 bg-zinc-950 opacity-70"
                                }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-3">
                                    {achievement.icon && !isHiddenAndNotRevealed ? (
                                        <img
                                            src={achievement.icon}
                                            alt={achievement.displayName}
                                            className="h-10 w-10 rounded"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded bg-zinc-800">
                                            {isHiddenAndNotRevealed
                                                ? "❓"
                                                : achievement.achieved
                                                    ? "✅"
                                                    : "🔒"}
                                        </div>
                                    )}

                                    <div>
                                        <h2 className="font-semibold">
                                            {isHiddenAndNotRevealed
                                                ? "Conquista oculta"
                                                : achievement.displayName}
                                        </h2>

                                        {isHiddenAndNotRevealed ? (
                                            <p className="text-zinc-500 mt-1">
                                                Clica para revelar os detalhes desta conquista.
                                            </p>
                                        ) : (
                                            <p className="text-zinc-400 mt-1">
                                                {achievement.description || "Sem descrição disponível."}
                                            </p>
                                        )}

                                        {isHiddenAndRevealed && (
                                            <p className="text-purple-400 text-sm mt-2">
                                                Hidden achievement • Clica para ocultar novamente
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {achievement.achieved && achievement.unlockTime && (
                                    <span className="whitespace-nowrap text-sm text-zinc-400">
                                        {new Date(achievement.unlockTime).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {filteredAchievements.length === 0 && (
                    <p className="text-zinc-500">No achievements found.</p>
                )}
            </section>
        </main>
    );
}