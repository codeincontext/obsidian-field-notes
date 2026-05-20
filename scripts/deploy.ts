import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

// Both HTMLs are bundled into the Worker, so the deploy hash combines them.
const BUILT_FILES = ["built/public.html", "built/private.html"];
const HASH_FILE = ".last-deploy-hash";

function run(cmd: string, args: string[]): void {
  const res = spawnSync(cmd, args, { stdio: "inherit" });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

function hashBuild(paths: string[]): string {
  const h = createHash("sha256");
  for (const p of paths) {
    h.update(p).update("\0").update(readFileSync(p));
  }
  return h.digest("hex");
}

console.log("→ build");
run("npm", ["run", "build"]);

for (const p of BUILT_FILES) {
  if (!existsSync(p)) {
    console.error(`! build did not produce ${p}`);
    process.exit(1);
  }
}

const currentHash = hashBuild(BUILT_FILES);
const lastHash = existsSync(HASH_FILE) ? readFileSync(HASH_FILE, "utf-8").trim() : "";

if (currentHash === lastHash) {
  console.log("→ no changes since last deploy, skipping wrangler upload");
  process.exit(0);
}

console.log("→ deploy to Cloudflare Workers");
run("npx", ["wrangler", "deploy"]);

writeFileSync(HASH_FILE, currentHash);
console.log(`✓ deployed (hash ${currentHash.slice(0, 8)})`);
