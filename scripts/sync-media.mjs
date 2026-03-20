#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

// Load .env.local
const envPath = resolve(import.meta.dirname, "../.env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
    if (match) process.env[match[1]] = match[2];
  }
}

const bucket = process.env.S3_MEDIA_BUCKET;
if (!bucket) {
  console.error("S3_MEDIA_BUCKET is not set. Add it to .env.local");
  process.exit(1);
}

const cmd = `aws s3 sync public/media/ s3://${bucket}/media/ --delete --cache-control "public, max-age=31536000, immutable"`;
console.log(`Uploading to s3://${bucket}/media/...`);
execSync(cmd, { stdio: "inherit" });
