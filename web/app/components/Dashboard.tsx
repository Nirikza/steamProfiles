"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type GameProgress = {
    appId: number;
    name: string;
    headerImage: string | null;
    iconImage: string | null;
    totalAchievements: number;
    unlockedAchievements: number;
    percentage: number;
    isPlatinum: boolean;
};

type Filter = "all" | "platinum" | "in-progress" | "no-achievements";
type Sort = "name" | "progress-desc" | "progress-asc";

export default function Dashboard() {
    const [games, setGames] = useState<GameProgress[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<Filter>("all");
    const [sort, setSort] = useState<Sort>("name");
    const [loading, setLoading] = useState(true);
    const [syncingLibrary, setSyncingLibrary] = useState(false);
    const [syncingAchievements, setSyncingAchievements] = useState(false);

    async function loadGames() {
        setLoading(true);

        const res = await fetch("/api/games/progress", {
            cache: "no-store",
        });

        const data = await res.json();

        setGames(data);
        setLoading(false);
    }

    async function syncLibrary() {
        setSyncingLibrary(true);

        try {
            await fetch("/api/steam/sync", {
                method: "POST",
            });

            await loadGames();
        } finally {
            setSyncingLibrary(false);
        }
    }

    async function syncAllAchievements() {
        setSyncingAchievements(true);

        try {
            await fetch("/api/steam/sync-achievements-all", {
                method: "POST",
            });

            await loadGames();
        } catch (error) {
            console.error("Failed to sync all achievements", error);
        } finally {
            setSyncingAchievements(false);
        }
    }

    useEffect(() => {
        loadGames();
    }, []);

    const filteredGames = useMemo(() => {
        return games
            .filter((game) => {
                const matchesSearch = game.name
                    .toLowerCase()
                    .includes(search.toLowerCase());

                if (!matchesSearch) return false;

                if (filter === "platinum") {
                    return game.totalAchievements > 0 && game.isPlatinum;
                }

                if (filter === "in-progress") {
                    return game.totalAchievements > 0 && !game.isPlatinum;
                }

                if (filter === "no-achievements") {
                    return game.totalAchievements === 0;
                }

                return true;
            })
            .sort((a, b) => {
                const aHasAchievements = a.totalAchievements > 0;
                const bHasAchievements = b.totalAchievements > 0;

                if (aHasAchievements && !bHasAchievements) return -1;
                if (!aHasAchievements && bHasAchievements) return 1;

                if (sort === "progress-desc") {
                    return b.percentage - a.percentage;
                }

                if (sort === "progress-asc") {
                    return a.percentage - b.percentage;
                }

                return a.name.localeCompare(b.name);
            });
    }, [games, search, filter, sort]);

    const gamesWithAchievements = games.filter(
        (game) => game.totalAchievements > 0
    );

    const platinumCount = gamesWithAchievements.filter(
        (game) => game.isPlatinum
    ).length;

    const inProgressCount = gamesWithAchievements.filter(
        (game) => !game.isPlatinum
    ).length;

    const noAchievementsCount = games.filter(
        (game) => game.totalAchievements === 0
    ).length;

    return (
        <main className="min-h-screen bg-black text-white p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Steam Platinum Tracker</h1>

                <p className="text-zinc-400 mt-2">
                    {games.length} games • {gamesWithAchievements.length} with achievements •{" "}
                    {platinumCount} platinum
                </p>
            </div>

            <section className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <button
                    onClick={syncLibrary}
                    disabled={syncingLibrary || syncingAchievements}
                    className="rounded-xl bg-blue-600 px-4 py-3 font-semibold disabled:opacity-50"
                >
                    {syncingLibrary ? "Syncing library..." : "Sync library"}
                </button>

                <button
                    onClick={syncAllAchievements}
                    disabled={syncingAchievements || syncingLibrary}
                    className="rounded-xl bg-purple-600 px-4 py-3 font-semibold disabled:opacity-50"
                >
                    {syncingAchievements
                        ? "Syncing achievements..."
                        : "Sync all achievements"}
                </button>

                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search games..."
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                />

                <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as Sort)}
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                >
                    <option value="name">Sort by name</option>
                    <option value="progress-desc">Progress high to low</option>
                    <option value="progress-asc">Progress low to high</option>
                </select>
            </section>

            <section className="mb-6 flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter("all")}
                    className={`rounded-full px-4 py-2 ${filter === "all" ? "bg-white text-black" : "bg-zinc-800"
                        }`}
                >
                    All
                </button>

                <button
                    onClick={() => setFilter("platinum")}
                    className={`rounded-full px-4 py-2 ${filter === "platinum" ? "bg-yellow-400 text-black" : "bg-zinc-800"
                        }`}
                >
                    Platinum ({platinumCount})
                </button>

                <button
                    onClick={() => setFilter("in-progress")}
                    className={`rounded-full px-4 py-2 ${filter === "in-progress" ? "bg-blue-500 text-white" : "bg-zinc-800"
                        }`}
                >
                    In Progress ({inProgressCount})
                </button>

                <button
                    onClick={() => setFilter("no-achievements")}
                    className={`rounded-full px-4 py-2 ${filter === "no-achievements"
                            ? "bg-zinc-300 text-black"
                            : "bg-zinc-800"
                        }`}
                >
                    No achievements ({noAchievementsCount})
                </button>
            </section>

            {loading ? (
                <p className="text-zinc-400">Loading games...</p>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredGames.map((game) => (
                        <Link
                            key={game.appId}
                            href={`/games/${game.appId}`}
                            className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition hover:border-blue-500 hover:bg-zinc-900"
                        >
                            <div className="relative aspect-[16/7] overflow-hidden bg-zinc-900">
                                {game.headerImage ? (
                                    <img
                                        src={game.headerImage}
                                        alt={game.name}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-zinc-600">
                                        No image
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                                    {game.iconImage && (
                                        <img
                                            src={game.iconImage}
                                            alt={`${game.name} icon`}
                                            className="h-10 w-10 rounded shadow-lg"
                                        />
                                    )}

                                    <h2 className="line-clamp-2 text-xl font-bold drop-shadow">
                                        {game.name}
                                    </h2>
                                </div>
                            </div>

                            <div className="p-5">
                                {game.totalAchievements === 0 ? (
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                                        <p className="font-semibold text-zinc-300">Sem conquistas</p>
                                        <p className="mt-1 text-sm text-zinc-500">
                                            Este jogo não tem achievements sincronizáveis.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-zinc-300">
                                                {game.unlockedAchievements} / {game.totalAchievements}{" "}
                                                achievements
                                            </p>

                                            <p className="font-bold text-zinc-100">
                                                {game.percentage}%
                                            </p>
                                        </div>

                                        <div className="mt-3 h-2 w-full rounded-full bg-zinc-800">
                                            <div
                                                className="h-2 rounded-full bg-blue-500"
                                                style={{ width: `${game.percentage}%` }}
                                            />
                                        </div>

                                        {game.isPlatinum && (
                                            <p className="mt-4 font-bold text-yellow-400">
                                                🏆 Platinum
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </Link>
                    ))}

                    {filteredGames.length === 0 && (
                        <p className="text-zinc-500">No games found.</p>
                    )}
                </div>
            )}
        </main>
    );
}