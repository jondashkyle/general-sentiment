#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, statSync, watch } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import matter from "gray-matter";

// Load .env.local
const envPath = resolve(import.meta.dirname, "../../.env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
    if (match) process.env[match[1]] = match[2];
  }
}

const WATCH_FLAG = process.argv.includes("--watch");

const CONTENT_DIR = resolve(import.meta.dirname, "../../content");
const MEDIA_DIR = resolve(import.meta.dirname, "../../public/media");

function getVaultPath() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const vaultPath = args[0] || process.env.OBSIDIAN_VAULT;
  if (!vaultPath) {
    console.error("Usage: node scripts/sync-obsidian.mjs <vault-path>");
    console.error("  or set OBSIDIAN_VAULT env var");
    process.exit(1);
  }
  return resolve(vaultPath);
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function findCandidates(vaultPath) {
  try {
    const result = execSync(
      `grep -rl --null "public: true" "${vaultPath}" --include="*.md" --include="*.mdx" | xargs -0 grep -l "General Sentiment"`,
      { encoding: "utf-8" },
    );
    return result.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function buildSlugMap(candidates) {
  const map = new Map();
  for (const filePath of candidates) {
    const raw = readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    const filename = basename(filePath).replace(/\.(mdx?)$/, "");
    const slug = data.slug ? slugify(data.slug) : slugify(data.title || filename);
    // Map both the filename and title to the slug
    map.set(filename.toLowerCase(), slug);
    if (data.title) {
      map.set(data.title.toLowerCase(), slug);
    }
  }
  return map;
}

function normalizeWikiLinks(content, slugMap) {
  // [[Page Name|Display Text]] -> [Display Text](/slug)
  // [[Page Name]] -> [Page Name](/slug)
  return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, display) => {
    const text = display || target;
    const slug = slugMap.get(target.toLowerCase()) || slugify(target);
    return `[${text}](/${slug})`;
  });
}

function syncMedia(content, filePath, vaultPath) {
  const imageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  let result = content;

  for (const [, imgPath] of content.matchAll(imageRegex)) {
    if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) continue;

    // Resolve relative to the file, then try vault root
    let srcPath = resolve(dirname(filePath), imgPath);
    if (!existsSync(srcPath)) {
      srcPath = join(vaultPath, imgPath);
    }
    if (!existsSync(srcPath) || !statSync(srcPath).isFile()) continue;

    // Strip leading "media/" from vault path to avoid public/media/media/
    const relativePath = imgPath.startsWith("media/") ? imgPath.slice(6) : imgPath;
    const destPath = join(MEDIA_DIR, relativePath);
    mkdirSync(dirname(destPath), { recursive: true });
    copyFileSync(srcPath, destPath);
    result = result.replaceAll(imgPath, `/media/${relativePath}`);
  }

  return result;
}

function syncFile(filePath, vaultPath, slugMap) {
  const raw = readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  if (data.public !== true) return null;

  const project = String(data.project || "");
  if (!project.includes("General Sentiment")) return null;

  const ext = filePath.endsWith(".mdx") ? ".mdx" : ".md";
  const slug = data.slug ? slugify(data.slug) : slugify(data.title || basename(filePath).replace(/\.(mdx?)$/, ""));

  // Clean frontmatter: remove project and public fields
  const { project: _, public: __, slug: ___, ...cleanData } = data;

  // Add last modified date from source file
  cleanData.updated = statSync(filePath).mtime.toISOString();

  let normalizedContent = normalizeWikiLinks(content, slugMap);
  normalizedContent = syncMedia(normalizedContent, filePath, vaultPath);
  const output = matter.stringify(normalizedContent, cleanData);

  const outPath = join(CONTENT_DIR, `${slug}${ext}`);
  writeFileSync(outPath, output);

  return slug;
}

function sync(vaultPath) {
  if (!existsSync(CONTENT_DIR)) {
    mkdirSync(CONTENT_DIR, { recursive: true });
  }

  console.log(`Scanning ${vaultPath}...`);
  const candidates = findCandidates(vaultPath);
  console.log(`Found ${candidates.length} candidate(s)`);

  const slugMap = buildSlugMap(candidates);

  let synced = 0;
  for (const filePath of candidates) {
    const slug = syncFile(filePath, vaultPath, slugMap);
    if (slug) {
      console.log(`  synced: ${slug}`);
      synced++;
    }
  }

  console.log(`Done. ${synced} file(s) synced to content/`);
  return candidates;
}

function startWatch(vaultPath) {
  console.log(`\nWatching vault for changes...`);

  let debounce = null;

  watch(vaultPath, { recursive: true }, (eventType, filename) => {
    if (!filename || !(filename.endsWith(".md") || filename.endsWith(".mdx"))) return;

    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const filePath = join(vaultPath, filename);
      if (!existsSync(filePath)) return;

      const candidates = findCandidates(vaultPath);
      const slugMap = buildSlugMap(candidates);
      const slug = syncFile(filePath, vaultPath, slugMap);
      if (slug) {
        console.log(`  ${eventType === "rename" ? "new" : "updated"}: ${slug}`);
      }
    }, 300);
  });
}

const vaultPath = getVaultPath();
const candidates = sync(vaultPath);

if (WATCH_FLAG) {
  startWatch(vaultPath);
}
