import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const REPOS = [
  "General-Sentiment/Browser",
  "General-Sentiment/Fence",
  "General-Sentiment/app",
];

const OUT = "src/data/releases.json";

const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: "application/vnd.github+json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${url} → ${res.status} ${res.statusText}\n${body}`);
  }
  return res.json();
}

const out = {};
for (const repo of REPOS) {
  console.log(`Fetching ${repo}...`);
  const releases = await fetchJson(
    `https://api.github.com/repos/${repo}/releases?per_page=20`,
  );
  const latest = releases[0];
  const dmg = latest?.assets?.find((a) => a.name.endsWith(".dmg"));
  const downloadUrl =
    dmg?.browser_download_url ??
    latest?.html_url ??
    `https://github.com/${repo}/releases/latest`;

  out[repo] = {
    downloadUrl,
    releases: releases.map((r) => ({
      tag: r.tag_name,
      date: r.published_at,
      url: r.html_url,
    })),
  };
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`Saved ${OUT}`);
