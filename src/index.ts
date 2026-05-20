import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import config from "../mias-guide.config.js";
import { scanJournals } from "./parser/scanner.js";
import { parseFile } from "./parser/block-parser.js";
import { extractEntries } from "./parser/extractor.js";
import { generateHTML } from "./generator/html.js";
import { copyAssets } from "./generator/assets.js";
import type { Entry } from "./parser/types.js";

const vaultPath = (process.env.MIAS_GUIDE_VAULT_PATH ?? config.vaultPath).replace(/^~/, homedir());

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

  console.log(`Extracted ${allEntries.length} entries`);

  await mkdir(config.outDir, { recursive: true });

  const html = await generateHTML(allEntries, config);
  await writeFile(join(config.outDir, "index.html"), html);

  await copyAssets(allEntries, vaultPath, config.outDir);

  console.log(`Built site → ${config.outDir}/index.html`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
