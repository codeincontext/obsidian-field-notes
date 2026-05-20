import type { Block, Config, Entry } from "./types.js";

const TAG_RE = /#([\w/-]+)/g;
const IMAGE_RE = /!\[([^\]]*)\]\(([^)]+)\)(\{[^}]*\})?/g;

function hasTag(text: string, tag: string): boolean {
  // Matches `#tag`, `#tag/sub`, `#tag/sub/deeper`
  return new RegExp(`#${tag}(?:/|\\b)`).test(text);
}

function stripTag(text: string, tag: string): string {
  // Strips `#tag` and any nested subtag like `#tag/cooking`
  return text.replace(new RegExp(`#${tag}(?:/[\\w-]+)*\\b`, "g"), "").trim();
}

function stripPageRefs(text: string): string {
  return text.replace(/\[\[([^\]]+)\]\]/g, "$1");
}

function stripTags(text: string): string {
  return text.replace(/#[\w/-]+/g, "").trim();
}

function extractTags(text: string): string[] {
  const tags: string[] = [];
  let match;
  while ((match = TAG_RE.exec(text)) !== null) {
    tags.push(match[1].toLowerCase());
  }
  TAG_RE.lastIndex = 0;
  return tags;
}

function extractImages(text: string): string[] {
  const images: string[] = [];
  let match;
  while ((match = IMAGE_RE.exec(text)) !== null) {
    images.push(match[2]);
  }
  IMAGE_RE.lastIndex = 0;
  return images;
}

function collectImages(block: Block): string[] {
  const images = extractImages(block.text);
  for (const child of block.children) {
    images.push(...collectImages(child));
  }
  return images;
}

function cleanBlockText(text: string, tag: string): string {
  let cleaned = stripTag(text, tag);
  cleaned = stripTags(cleaned);
  cleaned = stripPageRefs(cleaned);
  // Clean up extra whitespace from stripping
  cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
  return cleaned;
}

function findTaggedBlocks(
  blocks: Block[],
  config: Config,
): Entry[] {
  const entries: Entry[] = [];

  for (const block of blocks) {
    if (hasTag(block.text, config.tag)) {
      const tags = extractTags(block.text);
      const prefix = `${config.tag}/`;
      const subCategories = tags
        .filter((t) => t.startsWith(prefix))
        .map((t) => t.slice(prefix.length));

      const categories = subCategories.filter((c) => config.categories.includes(c));
      const images = collectImages(block);

      entries.push({
        date: new Date(), // will be set by caller
        text: cleanBlockText(block.text, config.tag),
        children: block.children,
        tags,
        categories,
        images,
      });
    } else {
      // Recurse into children
      entries.push(...findTaggedBlocks(block.children, config));
    }
  }

  return entries;
}

export function extractEntries(
  blocks: Block[],
  date: Date,
  config: Config,
): Entry[] {
  const entries = findTaggedBlocks(blocks, config);
  for (const entry of entries) {
    entry.date = date;
  }
  return entries;
}

/** Returns true if the entry is in the locked category and should be hidden
 * from the public site. The category is `config.lockedCategory ?? "locked"`. */
export function isLocked(entry: Entry, config: Config): boolean {
  const locked = config.lockedCategory ?? "locked";
  const prefix = `${config.tag}/`;
  return entry.tags.some((t) => t.startsWith(prefix) && t.slice(prefix.length) === locked);
}
