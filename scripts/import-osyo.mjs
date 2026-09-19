import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_JSON = path.join(ROOT, "data/osyo-products-seed.json");
const LOGO_DIR = path.join(ROOT, "public/product-logos");
const MANIFEST = path.join(LOGO_DIR, "manifest.json");

const CONCURRENCY = 8;
const UA = "dodai-import/1.0 (+https://dodai.app; catalog import with permission from osyo.app)";

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function domainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function pickWebsite(sameAs = []) {
  const skip = /(instagram|facebook|twitter|x\.com|youtube|linkedin|t\.me|telegram|tiktok|osyo\.app)/i;
  for (const u of sameAs) {
    if (typeof u === "string" && /^https?:/i.test(u) && !skip.test(u)) return u.split("?")[0];
  }
  return null;
}

function pickLogo(images = []) {
  const list = Array.isArray(images) ? images : [images].filter(Boolean);
  const logo = list.find((u) => /\/logo\//i.test(u));
  return logo || list.find((u) => /media\.osyo\.app/i.test(u)) || list[0] || null;
}

function mapPlatforms(os) {
  if (!os) return ["web"];
  const raw = String(os).toLowerCase();
  const out = [];
  if (/\bios\b|iphone|ipad/.test(raw)) out.push("ios");
  if (/android/.test(raw)) out.push("android");
  if (/macos|mac os/.test(raw)) out.push("macos");
  if (/windows|desktop/.test(raw)) out.push("desktop");
  if (/web|saas|browser/.test(raw)) out.push("web");
  if (out.length === 0) out.push("web");
  return [...new Set(out)];
}

function mapCategory(genre, keywords = "") {
  const hay = `${genre ?? ""} ${keywords}`.toLowerCase();
  const rules = [
    [/crm|продаж|sales/, { slug: "crm", nameUk: "CRM" }],
    [/seo|маркетинг/, { slug: "seo", nameUk: "SEO" }],
    [/фін|financ|банк|плат|payment|грош/, { slug: "fintech", nameUk: "Fintech" }],
    [/ai|штучн|нейро/, { slug: "ai", nameUk: "AI" }],
    [/освіт|edtech|навчан|school|курс/, { slug: "edtech", nameUk: "EdTech" }],
    [/робот|job|hr|кар.єр/, { slug: "jobs", nameUk: "Робота" }],
    [/здоров|health|медиц|фітнес|спорт/, { slug: "health", nameUk: "Здоров’я" }],
    [/доставк|логіст|delivery/, { slug: "delivery", nameUk: "Доставка" }],
    [/ігр|game|розваж/, { slug: "games", nameUk: "Ігри" }],
    [/соц|social|комунік/, { slug: "social", nameUk: "Соцмережі" }],
    [/дизайн|design/, { slug: "design", nameUk: "Дизайн" }],
    [/безпек|security|control/, { slug: "security", nameUk: "Безпека" }],
    [/розроб|dev|код|software/, { slug: "software", nameUk: "Software" }],
    [/бізнес|business|saas/, { slug: "business", nameUk: "Бізнес-софт" }],
    [/їжа|food|рецепт|meal/, { slug: "food", nameUk: "Їжа" }],
    [/travel|подорож|туриз/, { slug: "travel", nameUk: "Подорожі" }],
  ];
  for (const [re, cat] of rules) {
    if (re.test(hay)) return cat;
  }
  return { slug: "tools", nameUk: "Інструменти" };
}

function shortTagline(description, max = 120) {
  const t = String(description || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return "Український цифровий продукт.";
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

function extractSoftwareApplication(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  for (const m of blocks) {
    try {
      const data = JSON.parse(m[1]);
      if (data?.["@type"] === "SoftwareApplication") return data;
      const graph = data?.["@graph"];
      if (Array.isArray(graph)) {
        const hit = graph.find((x) => x?.["@type"] === "SoftwareApplication");
        if (hit) return hit;
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

async function downloadLogo(url, slug) {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    let ext = "png";
    if (ct.includes("svg") || url.endsWith(".svg")) ext = "svg";
    else if (ct.includes("jpeg") || ct.includes("jpg") || url.endsWith(".jpg")) ext = "jpg";
    else if (ct.includes("webp") || url.endsWith(".webp")) ext = "webp";
    else if (url.endsWith(".png")) ext = "png";
    const out = path.join(LOGO_DIR, `${slug}.${ext}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 40 || buf.length > 3_000_000) return null;
    writeFileSync(out, buf);
    return `/product-logos/${slug}.${ext}`;
  } catch {
    return null;
  }
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
}

const urls = (await readFile("/tmp/osyo_urls_clean.txt", "utf8"))
  .trim()
  .split("\n")
  .filter(Boolean);

console.log(`Fetching ${urls.length} products…`);
mkdirSync(LOGO_DIR, { recursive: true });

let manifest = {};
if (existsSync(MANIFEST)) {
  try {
    manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
  } catch {
    manifest = {};
  }
}

const products = [];
let ok = 0;
let fail = 0;

await mapPool(urls, CONCURRENCY, async (url, idx) => {
  try {
    const html = await fetchText(url);
    const app = extractSoftwareApplication(html);
    if (!app?.name) {
      fail += 1;
      return;
    }
    const website = pickWebsite(app.sameAs || []);
    const osyoSlug = url.split("/").pop();
    const slug = slugify(app.name) || osyoSlug;
    const category = mapCategory(app.genre || app.applicationCategory, app.keywords);
    const logoRemote = pickLogo(app.image);
    let logoUrl = manifest[slug] || null;
    if (!logoUrl && logoRemote) {
      logoUrl = await downloadLogo(logoRemote, slug);
      if (logoUrl) manifest[slug] = logoUrl;
    }
    const item = {
      source: "osyo",
      sourceUrl: url,
      name: app.name.trim(),
      slug,
      tagline: shortTagline(app.description),
      description: String(app.description || "").trim() || null,
      website: website || url,
      domain: domainFromUrl(website),
      categorySlug: category.slug,
      categoryName: category.nameUk,
      platforms: mapPlatforms(app.operatingSystem),
      logoRemote,
      logoUrl,
      genre: app.genre || app.applicationCategory || null,
      keywords: app.keywords || null,
      authorName: app.author?.name || null,
      claimable: true,
      seed_for_dodai: true,
      missingWebsite: !website,
    };
    products.push(item);
    ok += 1;
    if ((idx + 1) % 25 === 0) console.log(`… ${idx + 1}/${urls.length} ok=${ok} fail=${fail}`);
  } catch (e) {
    fail += 1;
    console.warn("fail", url, e.message);
  }
});

products.sort((a, b) => a.name.localeCompare(b.name, "uk"));
writeFileSync(OUT_JSON, JSON.stringify(products, null, 2));
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`Done: ${products.length} saved → ${OUT_JSON}; logos=${Object.keys(manifest).length}; fail=${fail}`);
