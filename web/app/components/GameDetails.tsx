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
  globalPercent: number | null;
};

type GameAchievements = {
  appId: number;
  name: string;
  headerImage: string | null;
  iconImage: string | null;
  achievements: Achievement[];
};

type Filter = "all" | "unlocked" | "locked" | "hidden" | "rare" | "common";

type Sort =
  | "default"
  | "unlocked-first"
  | "locked-first"
  | "name"
  | "rarity-asc"
  | "rarity-desc";

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
        locked: 0,
        percentage: 0,
        isPlatinum: false,
        hidden: 0,
        rare: 0,
        rareUnlocked: 0,
      };
    }

    const total = game.achievements.length;
    const unlocked = game.achievements.filter((a) => a.achieved).length;
    const locked = total - unlocked;
    const hidden = game.achievements.filter((a) => a.hidden).length;

    const rare = game.achievements.filter(
      (a) => typeof a.globalPercent === "number" && a.globalPercent < 10
    ).length;

    const rareUnlocked = game.achievements.filter(
      (a) =>
        a.achieved &&
        typeof a.globalPercent === "number" &&
        a.globalPercent < 10
    ).length;

    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
    const isPlatinum = total > 0 && unlocked === total;

    return {
      total,
      unlocked,
      locked,
      percentage,
      isPlatinum,
      hidden,
      rare,
      rareUnlocked,
    };
  }, [game]);

  const filteredAchievements = useMemo(() => {
    if (!game) return [];

    return game.achievements
      .filter((achievement) => {
        const text = `${achievement.displayName} ${
          achievement.description ?? ""
        }`.toLowerCase();

        const matchesSearch = text.includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === "unlocked") return achievement.achieved;
        if (filter === "locked") return !achievement.achieved;
        if (filter === "hidden") return achievement.hidden;

        if (filter === "rare") {
          return (
            typeof achievement.globalPercent === "number" &&
            achievement.globalPercent < 10
          );
        }

        if (filter === "common") {
          return (
            typeof achievement.globalPercent === "number" &&
            achievement.globalPercent >= 10
          );
        }

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

        if (sort === "rarity-asc") {
          const aPercent =
            typeof a.globalPercent === "number" ? a.globalPercent : 999;
          const bPercent =
            typeof b.globalPercent === "number" ? b.globalPercent : 999;

          return aPercent - bPercent;
        }

        if (sort === "rarity-desc") {
          const aPercent =
            typeof a.globalPercent === "number" ? a.globalPercent : -1;
          const bPercent =
            typeof b.globalPercent === "number" ? b.globalPercent : -1;

          return bPercent - aPercent;
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
      <style jsx global>{`
        @keyframes rareShine {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(220%);
          }
        }

        @keyframes rareGlow {
          0%,
          100% {
            box-shadow: 0 0 14px rgba(251, 191, 36, 0.18),
              inset 0 0 0 rgba(251, 191, 36, 0);
          }
          50% {
            box-shadow: 0 0 26px rgba(251, 191, 36, 0.45),
              inset 0 0 18px rgba(251, 191, 36, 0.08);
          }
        }

        @keyframes rareBadgeSpark {
          0%,
          100% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(8deg) scale(1.08);
          }
        }

        .rare-unlocked-card {
          position: relative;
          overflow: hidden;
          animation: rareGlow 2.8s ease-in-out infinite;
        }

        .rare-unlocked-card::before {
          content: "";
          position: absolute;
          inset: 0;
          width: 45%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(251, 191, 36, 0.16),
            transparent
          );
          animation: rareShine 3.2s ease-in-out infinite;
          pointer-events: none;
        }

        .rare-badge-spark {
          animation: rareBadgeSpark 1.8s ease-in-out infinite;
        }
      `}</style>

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

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
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

                  <p className="text-zinc-400 mt-1">
                    {stats.unlocked} / {stats.total} achievements
                  </p>

                  {stats.hidden > 0 && (
                    <p className="text-purple-400 text-sm mt-1">
                      {stats.hidden} hidden achievements
                    </p>
                  )}

                  {stats.rare > 0 && (
                    <p className="text-orange-400 text-sm mt-1">
                      {stats.rare} rare achievements • {stats.rareUnlocked} unlocked
                    </p>
                  )}
                </div>
              </div>

              <p className="text-zinc-300 mt-6">
                Progress: {stats.percentage}%
              </p>

              <div className="w-full bg-zinc-800 rounded-full h-3 mt-3">
                <div
                  className="bg-blue-500 h-3 rounded-full"
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
                <p className="text-yellow-400 font-bold mt-4 text-xl">
                  🏆 Platinum
                </p>
              )}
            </div>
          </section>
        </aside>

        <section>
          <div className="mb-6 grid gap-3 md:grid-cols-3">
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
              <option value="rare">Rare only (&lt;10%)</option>
              <option value="common">Common only (≥10%)</option>
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
              <option value="rarity-asc">Rarest first</option>
              <option value="rarity-desc">Most common first</option>
            </select>
          </div>

          <div className="grid gap-3">
            {filteredAchievements.map((achievement) => {
              const isRare =
                typeof achievement.globalPercent === "number" &&
                achievement.globalPercent < 10;

              const isRareUnlocked = isRare && achievement.achieved;

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
                  className={`rounded-xl border p-4 transition ${
                    achievement.hidden && !achievement.achieved
                      ? "cursor-pointer"
                      : ""
                  } ${
                    isRareUnlocked
                      ? "rare-unlocked-card border-yellow-500/70 bg-yellow-950/20"
                      : achievement.achieved
                      ? "border-green-900/60 bg-green-950/20"
                      : "border-zinc-800 bg-zinc-950 opacity-80"
                  }`}
                >
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      {achievement.icon && !isHiddenAndNotRevealed ? (
                        <img
                          src={achievement.icon}
                          alt={achievement.displayName}
                          className={`h-10 w-10 rounded ${
                            isRareUnlocked ? "ring-2 ring-yellow-400/70" : ""
                          }`}
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
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold">
                            {isHiddenAndNotRevealed
                              ? "Conquista oculta"
                              : achievement.displayName}
                          </h2>

                          {achievement.achieved ? (
                            <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-300">
                              Unlocked
                            </span>
                          ) : (
                            <span className="rounded-full bg-zinc-700 px-2 py-1 text-xs text-zinc-300">
                              Locked
                            </span>
                          )}

                          {achievement.hidden && (
                            <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-300">
                              Hidden
                            </span>
                          )}

                          {isRare && (
                            <span
                              className={`rounded-full bg-orange-500/20 px-2 py-1 text-xs font-bold text-orange-300 ${
                                isRareUnlocked ? "rare-badge-spark" : ""
                              }`}
                            >
                              ✨ Rare
                            </span>
                          )}

                          {isRareUnlocked && (
                            <span className="rounded-full bg-yellow-400/20 px-2 py-1 text-xs font-bold text-yellow-300">
                              ⭐ Rare unlocked
                            </span>
                          )}
                        </div>

                        {isHiddenAndNotRevealed ? (
                          <p className="text-zinc-500 mt-1">
                            Clica para revelar os detalhes desta conquista.
                          </p>
                        ) : (
                          <p className="text-zinc-400 mt-1">
                            {achievement.description ||
                              (achievement.hidden
                                ? "Descrição oculta pela Steam API."
                                : "Sem descrição disponível.")}
                          </p>
                        )}

                        {isHiddenAndRevealed && (
                          <p className="text-purple-400 text-sm mt-2">
                            Hidden achievement • Clica para ocultar novamente
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {typeof achievement.globalPercent === "number" && (
                        <p
                          className={`text-sm font-bold ${
                            isRareUnlocked
                              ? "text-yellow-300"
                              : isRare
                              ? "text-orange-300"
                              : "text-zinc-400"
                          }`}
                        >
                          {achievement.globalPercent.toFixed(1)}%
                        </p>
                      )}

                      {achievement.achieved && achievement.unlockTime && (
                        <span className="mt-2 block whitespace-nowrap text-sm text-zinc-400">
                          {new Date(
                            achievement.unlockTime
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredAchievements.length === 0 && (
              <p className="text-zinc-500">No achievements found.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}