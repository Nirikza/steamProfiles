"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AchievementCard from "./game-details/AchievementCard";
import AchievementFilters from "./game-details/AchievementFilters";
import AIGuideModal from "./game-details/AIGuideModal";
import GameStatsSidebar from "./game-details/GameStatsSidebar";
import {
  buildAchievementGuideText,
  getAchievementSearchText,
} from "./game-details/helpers";
import type {
  Achievement,
  AISource,
  Filter,
  GameAchievements,
  GameStats,
  Sort,
} from "./game-details/types";

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

  const [aiGuideOpen, setAiGuideOpen] = useState(false);
  const [aiGuideLoading, setAiGuideLoading] = useState(false);
  const [aiGuideTitle, setAiGuideTitle] = useState("");
  const [aiGuideContent, setAiGuideContent] = useState("");
  const [aiGuideError, setAiGuideError] = useState<string | null>(null);
  const [aiSources, setAiSources] = useState<AISource[]>([]);

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

  function openAchievementGuide(achievement: Achievement) {
    const query = encodeURIComponent(getAchievementSearchText(game, achievement));

    window.open(
      `https://www.youtube.com/results?search_query=${query}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openWrittenGuideSearch(achievement: Achievement) {
    const query = encodeURIComponent(getAchievementSearchText(game, achievement));

    window.open(
      `https://www.google.com/search?q=${query}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function askChatGpt(achievement: Achievement) {
    if (!game) return;

    const prompt = encodeURIComponent(
      `I am playing "${game.name}" on Steam.

Achievement:
"${achievement.displayName}"

Description:
${achievement.description ||
      (achievement.hidden
        ? "This is a hidden achievement."
        : "No description available.")
      }

Please give me a clear, step-by-step guide to unlock this achievement. Include missable warnings, required mission/level, difficulty requirements, multiplayer/co-op requirements, DLC warnings, and any useful tips.`
    );

    window.open(
      `https://chatgpt.com/?q=${prompt}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function generateAIGuide(achievement: Achievement) {
    setAiGuideOpen(true);
    setAiGuideLoading(true);
    setAiGuideError(null);
    setAiGuideTitle(achievement.displayName);
    setAiGuideContent("");
    setAiSources([]);

    try {
      const res = await fetch("/api/ai/achievement-guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          achievementId: achievement.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao gerar guia.");
      }

      setAiGuideContent(data.guide || "Sem resposta da IA.");
      setAiSources(data.sources ?? []);
    } catch (error) {
      setAiGuideError(
        error instanceof Error ? error.message : "Erro desconhecido."
      );
    } finally {
      setAiGuideLoading(false);
    }
  }

  function downloadAchievementGuide(achievement: Achievement) {
    const content = buildAchievementGuideText(game, achievement);

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const safeGameName = game?.name.replace(/[^a-z0-9]+/gi, "-") ?? "game";
    const safeAchievementName = achievement.displayName.replace(
      /[^a-z0-9]+/gi,
      "-"
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeGameName}-${safeAchievementName}-guide.txt`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function downloadAIGuide() {
    if (!game || !aiGuideContent) return;

    const sourcesText =
      aiSources.length > 0
        ? `

Sources:
${aiSources
          .map((source, index) => `${index + 1}. ${source.title}\n${source.url}`)
          .join("\n\n")}
`
        : "";

    const content = `Steam Platinum Tracker - AI Guide

Game:
${game.name}

Achievement:
${aiGuideTitle}

Guide:
${aiGuideContent}
${sourcesText}
`;

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const safeGameName = game.name.replace(/[^a-z0-9]+/gi, "-");
    const safeAchievementName = aiGuideTitle.replace(/[^a-z0-9]+/gi, "-");

    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeGameName}-${safeAchievementName}-ai-guide.txt`;
    link.click();

    URL.revokeObjectURL(url);
  }

  async function downloadAIGuidePdf() {
    if (!game || !aiGuideContent) return;

    const achievement = game.achievements.find(
      (item) => item.displayName === aiGuideTitle
    );

    const res = await fetch("/api/ai/achievement-guide/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gameName: game.name,
        achievementTitle: aiGuideTitle,
        achievementDescription: achievement?.description ?? null,
        achievementIcon: achievement?.icon ?? null,
        headerImage: game.headerImage,
        guide: aiGuideContent,
        sources: aiSources,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Erro ao gerar PDF.");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${game.name}-${aiGuideTitle}-guide.pdf`.replace(
      /[^a-z0-9.-]+/gi,
      "-"
    );
    link.click();

    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    loadGame();
  }, [appId]);

  const stats: GameStats = useMemo(() => {
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
        const text = `${achievement.displayName} ${achievement.description ?? ""
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
      <main className="min-h-screen bg-black p-6 text-white">
        <p className="text-zinc-400">Loading game...</p>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <Link href="/" className="text-blue-400 hover:underline">
          ← Back to dashboard
        </Link>

        <p className="mt-6 text-red-400">Game not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
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

      {aiGuideOpen && (
        <AIGuideModal
          title={aiGuideTitle}
          content={aiGuideContent}
          loading={aiGuideLoading}
          error={aiGuideError}
          sources={aiSources}
          onClose={() => setAiGuideOpen(false)}
          onDownload={downloadAIGuide}
          onDownloadPdf={downloadAIGuidePdf}
        />
      )}

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
        <GameStatsSidebar game={game} stats={stats} />

        <section>
          <AchievementFilters
            search={search}
            filter={filter}
            sort={sort}
            onSearchChange={setSearch}
            onFilterChange={setFilter}
            onSortChange={setSort}
          />

          <div className="grid gap-3">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isRevealedHidden={revealedHidden.includes(achievement.id)}
                onToggleHiddenReveal={toggleHiddenReveal}
                onOpenYoutube={openAchievementGuide}
                onOpenWrittenGuide={openWrittenGuideSearch}
                onAskChatGpt={askChatGpt}
                onGenerateAIGuide={generateAIGuide}
                onDownloadTxt={downloadAchievementGuide}
              />
            ))}

            {filteredAchievements.length === 0 && (
              <p className="text-zinc-500">No achievements found.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}