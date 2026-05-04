import * as cheerio from "cheerio";
import { prisma } from "@/lib/prisma";

type SearchResult = {
    title: string;
    url: string;
    snippet: string;
};

const allowedDomains = [
    "steamcommunity.com",
    "trueachievements.com",
    "playstationtrophies.org",
    "psnprofiles.com",
    "exophase.com",
    "ign.com",
    "fandom.com",
    "reddit.com",
    "youtube.com",
];

function isAllowedUrl(url: string) {
    try {
        const hostname = new URL(url).hostname.replace(/^www\./, "");
        return allowedDomains.some((domain) => hostname.endsWith(domain));
    } catch {
        return false;
    }
}

function cleanDuckDuckGoUrl(url: string) {
    try {
        const parsed = new URL(url, "https://duckduckgo.com");

        const uddg = parsed.searchParams.get("uddg");

        if (uddg) {
            return decodeURIComponent(uddg);
        }

        return parsed.href;
    } catch {
        return url;
    }
}

async function searchWeb(query: string): Promise<SearchResult[]> {
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(
        query
    )}`;

    const res = await fetch(searchUrl, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (compatible; SteamPlatinumTracker/1.0; +local-app)",
        },
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    const results: SearchResult[] = [];

    $(".result").each((index: number, element: any) => {
        const title = $(element).find(".result__a").text().trim();
        const rawUrl = $(element).find(".result__a").attr("href");
        const snippet = $(element).find(".result__snippet").text().trim();

        if (!title || !rawUrl) return;

        const url = cleanDuckDuckGoUrl(rawUrl);

        if (!isAllowedUrl(url)) return;

        results.push({
            title,
            url,
            snippet,
        });
    });

    return results.slice(0, 5);
}

async function extractPageText(url: string) {
    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (compatible; SteamPlatinumTracker/1.0; +local-app)",
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) return "";

        const html = await res.text();
        const $ = cheerio.load(html);

        $("script, style, nav, footer, header, aside").remove();

        const text = $("body")
            .text()
            .replace(/\s+/g, " ")
            .trim();

        return text.slice(0, 2500);
    } catch {
        return "";
    }
}

export async function POST(req: Request) {
    try {
        const { achievementId } = await req.json();

        if (!achievementId) {
            return Response.json(
                { error: "achievementId é obrigatório" },
                { status: 400 }
            );
        }

        const achievement = await prisma.achievement.findUnique({
            where: {
                id: Number(achievementId),
            },
            include: {
                game: true,
            },
        });

        if (!achievement) {
            return Response.json(
                { error: "Achievement não encontrada" },
                { status: 404 }
            );
        }

        const query = `${achievement.game.name} ${achievement.displayName} achievement guide`;

        const searchResults = await searchWeb(query);

        const sources = [];

        for (const result of searchResults) {
            const text = await extractPageText(result.url);

            if (!text) continue;

            sources.push({
                ...result,
                text,
            });
        }

        const context = sources
            .map(
                (source, index) => `
Source ${index + 1}
Title: ${source.title}
URL: ${source.url}
Snippet: ${source.snippet}
Content excerpt:
${source.text}
`
            )
            .join("\n\n");

        const ollamaUrl = process.env.OLLAMA_URL ?? "http://ollama:11434";
        const model = process.env.OLLAMA_MODEL ?? "llama3.2";

        const prompt = `
You are a gaming guide writer.

Use the web sources below to write a practical guide for unlocking this achievement.

Game:
${achievement.game.name}

Achievement:
${achievement.displayName}

Achievement description:
${achievement.description ||
            (achievement.hidden
                ? "This is a hidden achievement."
                : "No description available.")
            }

Web sources:
${context || "No useful web sources were found."}

Instructions:
- Do not invent exact requirements if the sources do not support them.
- If sources are weak, say that clearly.
- Write a useful step-by-step guide.
- Include warnings about difficulty, missables, multiplayer, co-op, DLC, RNG, or grind if relevant.
- End with recommended search terms.
- Keep it concise but useful.
`;

        const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                prompt,
                stream: false,
            }),
        });

        const rawText = await ollamaResponse.text();

        if (!ollamaResponse.ok) {
            return Response.json(
                {
                    error: "Erro ao chamar Ollama",
                    details: rawText,
                },
                { status: 500 }
            );
        }

        const data = JSON.parse(rawText);

        const guide = data.response || "";

        if (!guide) {
            return Response.json(
                {
                    error: "Ollama respondeu sem texto.",
                    raw: data,
                },
                { status: 500 }
            );
        }

        return Response.json({
            guide,
            sources: sources.map((source) => ({
                title: source.title,
                url: source.url,
                snippet: source.snippet,
            })),
        });
    } catch (error) {
        return Response.json(
            {
                error: "Erro ao gerar guia",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}