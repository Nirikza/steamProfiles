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

        await fetch("/api/steam/sync", {
            method: "POST",
        });

        await loadGames();
        setSyncingLibrary(false);
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

                if (filter === "platinum") return game.isPlatinum;

                if (filter === "in-progress") {
                    return game.totalAchievements > 0 && !game.isPlatinum;
                }

                if (filter === "no-achievements") {
                    return game.totalAchievements === 0;
                }

                return true;
            })
            .sort((a, b) => {
                if (sort === "progress-desc") return b.percentage - a.percentage;
                if (sort === "progress-asc") return a.percentage - b.percentage;

                return a.name.localeCompare(b.name);
            });
    }, [games, search, filter, sort]);

    const platinumCount = games.filter((game) => game.isPlatinum).length;

    const syncedAchievementsCount = games.filter(
        (game) => game.totalAchievements > 0
    ).length;

    return (
        <main className="min-h-screen bg-black text-white p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Steam Platinum Tracker</h1>

                <p className="text-zinc-400 mt-2">
                    {games.length} games • {syncedAchievementsCount} with achievements •{" "}
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
                    Platinum
                </button>

                <button
                    onClick={() => setFilter("in-progress")}
                    className={`rounded-full px-4 py-2 ${filter === "in-progress" ? "bg-blue-500 text-white" : "bg-zinc-800"
                        }`}
                >
                    In Progress
                </button>

                <button
                    onClick={() => setFilter("no-achievements")}
                    className={`rounded-full px-4 py-2 ${filter === "no-achievements"
                        ? "bg-zinc-300 text-black"
                        : "bg-zinc-800"
                        }`}
                >
                    No achievements
                </button>
            </section>

            {loading ? (
                <p className="text-zinc-400">Loading games...</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredGames.map((game) => (
                        <Link
                            key={game.appId}
                            href={`/games/${game.appId}`}
                            className="overflow-hidden border border-zinc-700 rounded-xl hover:border-blue-500 transition bg-zinc-950"
                        >
                            {game.headerImage && (
                                <img
                                    src={game.headerImage}
                                    alt={game.name}
                                    className="w-full h-36 object-cover"
                                />
                            )}

                            <div className="p-5">
                                <div className="flex items-center gap-3">
                                    {game.iconImage && (
                                        <img
                                            src={game.iconImage}
                                            alt={`${game.name} icon`}
                                            className="w-8 h-8 rounded"
                                        />
                                    )}

                                    <h2 className="text-xl font-semibold">{game.name}</h2>
                                </div>

                                <p className="text-zinc-300 mt-3">
                                    {game.unlockedAchievements} / {game.totalAchievements}{" "}
                                    achievements
                                </p>

                                <p className="text-zinc-300">Progress: {game.percentage}%</p>

                                <div className="w-full bg-zinc-800 rounded-full h-2 mt-3">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${game.percentage}%` }}
                                    />
                                </div>

                                {game.isPlatinum && (
                                    <p className="text-yellow-400 font-bold mt-3">🏆 Platinum</p>
                                )}

                                {game.totalAchievements === 0 && (
                                    <p className="text-zinc-500 mt-3">No achievements synced</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}