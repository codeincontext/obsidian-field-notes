import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import config from "../mias-guide.config.js";
import { scanJournals } from "./parser/scanner.js";
import { parseFile } from "./parser/block-parser.js";
import { extractEntries, isLocked } from "./parser/extractor.js";
import { generateHTML } from "./generator/html.js";
import { copyAssets } from "./generator/assets.js";
import type { Entry } from "./parser/types.js";

const vaultPath = (process.env.MIAS_GUIDE_VAULT_PATH ?? config.vaultPath).replace(/^~/, homedir());

// HTMLs go into `built/` and get bundled into the Worker — they are source,
// not public assets. Only genuinely-public files (images, etc.) belong in
// `config.outDir` (a.k.a. dist/).
const BUILT_DIR = "built";

async function build() {
  console.log(`Scanning ${vaultPath}/journal/...`);
  const journals = await scanJournals(vaultPath);
  console.log(`Found ${journals.length} journal files`);

  const allEntries: Entry[] = [];

  for (const journal of journals) {
    const blocks = await parseFile(journal.filePath);
    const entries = extractEntries(blocks, journal.date, config);
    allEntries.push(...entries);
  }

  // Sort newest first
  allEntries.sort((a, b) => b.date.getTime() - a.date.getTime());

  const publicEntries = allEntries.filter((e) => !isLocked(e, config));
  console.log(`Extracted ${allEntries.length} entries (${publicEntries.length} public, ${allEntries.length - publicEntries.length} locked)`);

  await mkdir(BUILT_DIR, { recursive: true });
  await mkdir(config.outDir, { recursive: true });

  const publicHTML = await generateHTML(publicEntries, config);
  await writeFile(join(BUILT_DIR, "public.html"), publicHTML);

  const privateHTML = await generateHTML(allEntries, config);
  await writeFile(join(BUILT_DIR, "private.html"), privateHTML);

  await copyAssets(allEntries, vaultPath, config.outDir);

  console.log(`Built → ${BUILT_DIR}/public.html and ${BUILT_DIR}/private.html (bundled into Worker on deploy)`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
