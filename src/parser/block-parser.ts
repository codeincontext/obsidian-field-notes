import { readFile } from "node:fs/promises";
import type { Block } from "./types.js";

const LOGSEQ_METADATA_RE =
  /^(collapsed|id|icon|background-color|heading|public|tags|template|template-including-parent)::/;
const LOGBOOK_START = ":LOGBOOK:";
const LOGBOOK_END = ":END:";

function getDepth(line: string): number {
  let tabs = 0;
  for (const ch of line) {
    if (ch === "\t") tabs++;
    else break;
  }
  return tabs;
}

function isBullet(line: string): boolean {
  const trimmed = line.replace(/^\t+/, "");
  return trimmed.startsWith("- ");
}

function bulletText(line: string): string {
  return line.replace(/^\t+/, "").replace(/^- /, "");
}

function isMetadataLine(text: string): boolean {
  return LOGSEQ_METADATA_RE.test(text.trim());
}

export function parseBlocks(content: string): Block[] {
  const lines = content.split("\n");
  const rootBlocks: Block[] = [];
  const stack: { block: Block; depth: number }[] = [];
  let inLogbook = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === LOGBOOK_START) {
      inLogbook = true;
      continue;
    }
    if (trimmed === LOGBOOK_END) {
      inLogbook = false;
      continue;
    }
    if (inLogbook) continue;

    if (!trimmed || trimmed.startsWith("###")) continue;

    if (isBullet(line)) {
      const text = bulletText(line);
      if (isMetadataLine(text)) continue;

      const depth = getDepth(line);
      const block: Block = { text, depth, children: [] };

      // Find parent: walk stack back to find a block at depth - 1
      while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
        stack.pop();
      }

      if (stack.length === 0) {
        rootBlocks.push(block);
      } else {
        stack[stack.length - 1].block.children.push(block);
      }

      stack.push({ block, depth });
    } else if (stack.length > 0 && !isMetadataLine(trimmed)) {
      // Continuation line — append to current block's text
      const current = stack[stack.length - 1].block;
      current.text += "\n" + trimmed;
    }
  }

  return rootBlocks;
}

export async function parseFile(filePath: string): Promise<Block[]> {
  const content = await readFile(filePath, "utf-8");
  return parseBlocks(content);
}
