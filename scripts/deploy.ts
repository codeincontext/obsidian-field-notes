import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const INDEX = join(DIST, "index.html");
const HASH_FILE = join(DIST, ".last-deploy-hash");

function run(cmd: string, args: string[]): void {
  const res = spawnSync(cmd, args, { stdio: "inherit" });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

function hashFile(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

console.log("→ build");
run("npm", ["run", "build"]);

if (!existsSync(INDEX)) {
  console.error(`! build did not produce ${INDEX}`);
  process.exit(1);
}

const currentHash = hashFile(INDEX);
const lastHash = existsSync(HASH_FILE) ? readFileSync(HASH_FILE, "utf-8").trim() : "";

if (currentHash === lastHash) {
  console.log("→ no changes since last deploy, skipping wrangler upload");
  process.exit(0);
}

console.log("→ deploy to Cloudflare Workers");
run("npx", ["wrangler", "deploy"]);

writeFileSync(HASH_FILE, currentHash);
console.log(`✓ deployed (hash ${currentHash.slice(0, 8)})`);
