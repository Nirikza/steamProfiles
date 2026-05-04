import type { Achievement } from "./types";

type AchievementCardProps = {
    achievement: Achievement;
    isRevealedHidden: boolean;
    onToggleHiddenReveal: (id: number) => void;
    onOpenYoutube: (achievement: Achievement) => void;
    onOpenWrittenGuide: (achievement: Achievement) => void;
    onAskChatGpt: (achievement: Achievement) => void;
    onGenerateAIGuide: (achievement: Achievement) => void;
    onDownloadTxt: (achievement: Achievement) => void;
};

export default function AchievementCard({
    achievement,
    isRevealedHidden,
    onToggleHiddenReveal,
    onOpenYoutube,
    onOpenWrittenGuide,
    onAskChatGpt,
    onGenerateAIGuide,
    onDownloadTxt,
}: AchievementCardProps) {
    const isRare =
        typeof achievement.globalPercent === "number" &&
        achievement.globalPercent < 10;

    const isRareUnlocked = isRare && achievement.achieved;

    const isHiddenAndNotRevealed =
        achievement.hidden && !achievement.achieved && !isRevealedHidden;

    const isHiddenAndRevealed =
        achievement.hidden && !achievement.achieved && isRevealedHidden;

    return (
        <div
            onClick={() => {
                if (achievement.hidden && !achievement.achieved) {
                    onToggleHiddenReveal(achievement.id);
                }
            }}
            className={`rounded-xl border p-4 transition ${achievement.hidden && !achievement.achieved ? "cursor-pointer" : ""
                } ${isRareUnlocked
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
                            className={`h-10 w-10 rounded ${isRareUnlocked ? "ring-2 ring-yellow-400/70" : ""
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
                                    className={`rounded-full bg-orange-500/20 px-2 py-1 text-xs font-bold text-orange-300 ${isRareUnlocked ? "rare-badge-spark" : ""
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

                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onOpenYoutube(achievement);
                                }}
                                className="rounded-full bg-red-600/20 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-600/30"
                            >
                                ▶ YouTube
                            </button>

                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onOpenWrittenGuide(achievement);
                                }}
                                className="rounded-full bg-blue-600/20 px-2 py-1 text-xs font-semibold text-blue-300 hover:bg-blue-600/30"
                            >
                                📄 Written
                            </button>

                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onAskChatGpt(achievement);
                                }}
                                className="rounded-full bg-emerald-600/20 px-2 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30"
                            >
                                🤖 ChatGPT
                            </button>

                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onGenerateAIGuide(achievement);
                                }}
                                className="rounded-full bg-purple-600/20 px-2 py-1 text-xs font-semibold text-purple-300 hover:bg-purple-600/30"
                            >
                                🦙 AI Guide
                            </button>

                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onDownloadTxt(achievement);
                                }}
                                className="rounded-full bg-zinc-700 px-2 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-600"
                            >
                                ⬇ .txt
                            </button>
                        </div>

                        {isHiddenAndNotRevealed ? (
                            <p className="mt-1 text-zinc-500">
                                Clica para revelar os detalhes desta conquista.
                            </p>
                        ) : (
                            <p className="mt-1 text-zinc-400">
                                {achievement.description ||
                                    (achievement.hidden
                                        ? "Descrição oculta pela Steam API."
                                        : "Sem descrição disponível.")}
                            </p>
                        )}

                        {isHiddenAndRevealed && (
                            <p className="mt-2 text-sm text-purple-400">
                                Hidden achievement • Clica para ocultar novamente
                            </p>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    {typeof achievement.globalPercent === "number" && (
                        <p
                            className={`text-sm font-bold ${isRareUnlocked
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
                            {new Date(achievement.unlockTime).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}