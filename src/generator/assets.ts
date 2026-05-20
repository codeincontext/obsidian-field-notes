import { copyFile, mkdir } from "node:fs/promises";
import { join, basename } from "node:path";
import type { Entry } from "../parser/types.js";

export async function copyAssets(
  entries: Entry[],
  vaultPath: string,
  outDir: string,
): Promise<void> {
  const allImages = new Set<string>();
  for (const entry of entries) {
    for (const img of entry.images) {
      allImages.add(img);
    }
  }

  if (allImages.size === 0) return;

  const assetsOut = join(outDir, "assets");
  await mkdir(assetsOut, { recursive: true });

  for (const img of allImages) {
    const filename = basename(img);
    const src = join(vaultPath, "assets", filename);
    const dest = join(assetsOut, filename);
    try {
      await copyFile(src, dest);
    } catch {
      console.warn(`Warning: could not copy image ${filename}`);
    }
  }
}
