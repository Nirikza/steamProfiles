import puppeteer from "puppeteer";
import { marked } from "marked";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  let browser;

  try {
    const {
      gameName,
      achievementTitle,
      achievementDescription,
      guide,
      sources = [],
      headerImage,
      achievementIcon,
    } = await req.json();

    if (!gameName || !achievementTitle || !guide) {
      return Response.json(
        { error: "Dados insuficientes para gerar PDF." },
        { status: 400 }
      );
    }

    const guideHtml = marked.parse(guide, {
      async: false,
      breaks: true,
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #0a0a0a;
      color: #f4f4f5;
    }

    .page {
      padding: 32px;
      background: #0a0a0a;
    }

    .header {
      border-radius: 18px;
      overflow: hidden;
      border: 1px solid #27272a;
      margin-bottom: 24px;
      background: #18181b;
    }

    .header-image {
      width: 100%;
      max-height: 220px;
      object-fit: cover;
      display: block;
    }

    .header-content {
      padding: 24px;
      display: flex;
      gap: 18px;
      align-items: center;
    }

    .icon-wrap {
      width: 86px;
      height: 86px;
      min-width: 86px;
      border-radius: 14px;
      background: #27272a;
      border: 1px solid #3f3f46;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .icon {
      width: 74px;
      height: 74px;
      object-fit: contain;
      display: block;
    }

    h1 {
      margin: 0;
      font-size: 30px;
      line-height: 1.15;
    }

    h2 {
      color: #facc15;
      margin-top: 0;
      margin-bottom: 14px;
    }

    .muted {
      color: #a1a1aa;
      margin: 6px 0 0;
      line-height: 1.35;
    }

    .section {
      border: 1px solid #27272a;
      background: #111113;
      border-radius: 16px;
      padding: 22px;
      margin-bottom: 18px;
      break-inside: avoid;
    }

    .guide {
      line-height: 1.7;
      font-size: 14px;
      color: #f4f4f5;
    }

    .guide h1,
    .guide h2,
    .guide h3 {
      color: #facc15;
      margin-top: 20px;
      margin-bottom: 10px;
      line-height: 1.25;
    }

    .guide h1:first-child,
    .guide h2:first-child,
    .guide h3:first-child {
      margin-top: 0;
    }

    .guide p {
      margin: 10px 0;
    }

    .guide strong {
      color: #ffffff;
      font-weight: 700;
    }

    .guide ul,
    .guide ol {
      padding-left: 22px;
      margin: 10px 0;
    }

    .guide li {
      margin-bottom: 7px;
    }

    .guide code {
      background: #27272a;
      padding: 2px 5px;
      border-radius: 5px;
      color: #facc15;
    }

    a {
      color: #60a5fa;
      word-break: break-word;
      text-decoration: none;
    }

    .source {
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 1.45;
    }

    .footer-note {
      color: #71717a;
      font-size: 11px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      ${headerImage
        ? `<img class="header-image" src="${escapeHtml(headerImage)}" />`
        : ""
      }

      <div class="header-content">
        ${achievementIcon
        ? `
              <div class="icon-wrap">
                <img class="icon" src="${escapeHtml(achievementIcon)}" />
              </div>
            `
        : ""
      }

        <div>
          <h1>${escapeHtml(achievementTitle)}</h1>
          <p class="muted">${escapeHtml(gameName)}</p>
          <p class="muted">
            ${achievementDescription
        ? escapeHtml(achievementDescription)
        : "No description available."
      }
          </p>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>AI Achievement Guide</h2>
      <div class="guide">${guideHtml}</div>
    </div>

    <div class="section">
      <h2>YouTube Search</h2>
      <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${gameName} ${achievementTitle} achievement guide`
      )}">
        Search YouTube guide for ${escapeHtml(gameName)} - ${escapeHtml(
        achievementTitle
      )}
      </a>
    </div>

    ${sources.length > 0
        ? `
      <div class="section">
        <h2>Sources</h2>
        ${sources
          .map(
            (source: { title: string; url: string }, index: number) => `
              <div class="source">
                <strong>${index + 1}. ${escapeHtml(source.title)}</strong><br />
                <a href="${escapeHtml(source.url)}">${escapeHtml(source.url)}</a>
              </div>
            `
          )
          .join("")}
      </div>
    `
        : ""
      }

    <p class="footer-note">
      Generated by Steam Platinum Tracker using local AI and public web references.
    </p>
  </div>
</body>
</html>
`;

    browser = await puppeteer.launch({
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
    });

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${achievementTitle.replace(
          /[^a-z0-9]+/gi,
          "-"
        )}-guide.pdf"`,
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: "Erro ao gerar PDF",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}