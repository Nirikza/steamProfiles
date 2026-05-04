import type { AISource } from "./types";

type AIGuideModalProps = {
    title: string;
    content: string;
    loading: boolean;
    error: string | null;
    sources: AISource[];
    onClose: () => void;
    onDownload: () => void;
    onDownloadPdf: () => void;
};

export default function AIGuideModal({
    title,
    content,
    loading,
    error,
    sources,
    onClose,
    onDownload,
    onDownloadPdf,
}: AIGuideModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
            <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl">
                <div className="flex items-center justify-between border-b border-zinc-800 p-4">
                    <div>
                        <p className="text-sm text-zinc-400">AI Achievement Guide</p>
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
                    >
                        Close
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-5">
                    {loading && (
                        <p className="text-purple-300">
                            Generating guide with local AI...
                        </p>
                    )}

                    {error && (
                        <p className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-red-300">
                            {error}
                        </p>
                    )}

                    {!loading && !error && content && (
                        <>
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-zinc-200">
                                {content}
                            </pre>

                            {sources.length > 0 && (
                                <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                                    <p className="mb-2 text-sm font-semibold text-zinc-300">
                                        Sources used
                                    </p>

                                    <div className="grid gap-2">
                                        {sources.map((source, index) => (
                                            <a
                                                key={`${source.url}-${index}`}
                                                href={source.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm text-blue-400 hover:underline"
                                            >
                                                {index + 1}. {source.title}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-zinc-800 p-4">
                    <button
                        onClick={onDownload}
                        disabled={!content}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold disabled:opacity-50"
                    >
                        Download .txt
                    </button>

                    <button
                        onClick={onDownloadPdf}
                        disabled={!content}
                        className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-semibold disabled:opacity-50"
                    >
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
}