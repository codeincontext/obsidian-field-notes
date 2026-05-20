import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { parseBlocks } from "../src/parser/block-parser.js";
import { extractEntries } from "../src/parser/extractor.js";
import { scanJournals } from "../src/parser/scanner.js";
import { readFile } from "node:fs/promises";
import type { Config } from "../src/parser/types.js";

const FIXTURES = join(import.meta.dirname, "fixtures");

const config: Config = {
  vaultPath: FIXTURES,
  tag: "miablog",
  categories: ["cooking", "money", "life"],
  siteName: "Mia's Guide",
  outDir: "./dist",
};

describe("scanner", () => {
  it("finds journal files and parses dates", async () => {
    const journals = await scanJournals(FIXTURES);
    expect(journals).toHaveLength(3);
    // Sorted newest first
    expect(journals[0].date.getFullYear()).toBe(2025);
    expect(journals[0].date.getMonth()).toBe(7); // August (0-indexed)
  });
});

describe("block-parser", () => {
  it("parses blocks with children", async () => {
    const content = await readFile(
      join(FIXTURES, "journal", "2025-06-15.md"),
      "utf-8",
    );
    const blocks = parseBlocks(content);
    // Should have the notes blocks (skipping ### headers)
    const tagged = blocks.filter((b) => b.text.includes("#miablog/"));
    expect(tagged).toHaveLength(2);

    // Second tagged block should have children
    const pastaBlock = tagged[1];
    expect(pastaBlock.children).toHaveLength(2);
    expect(pastaBlock.children[0].text).toContain("way more salt");
  });

  it("skips empty and header-only lines", async () => {
    const content = await readFile(
      join(FIXTURES, "journal", "2025-08-20.md"),
      "utf-8",
    );
    const blocks = parseBlocks(content);
    expect(blocks.every((b) => b.text.length > 0)).toBe(true);
  });
});

describe("extractor", () => {
  it("extracts tagged entries with metadata", async () => {
    const content = await readFile(
      join(FIXTURES, "journal", "2025-07-01.md"),
      "utf-8",
    );
    const blocks = parseBlocks(content);
    const date = new Date(2025, 6, 1);
    const entries = extractEntries(blocks, date, config);

    expect(entries).toHaveLength(2);

    expect(entries[0].text).toBe(
      "Start saving early, even small amounts. Compound interest is magic.",
    );
    expect(entries[0].tags).toContain("miablog/money");
    expect(entries[0].categories).toContain("money");

    expect(entries[1].text).toBe(
      "Learn to say no. It's a complete sentence.",
    );
    expect(entries[1].tags).toContain("miablog/life");
    expect(entries[1].categories).toContain("life");
  });

  it("strips #miablog tag but keeps content", async () => {
    const content = await readFile(
      join(FIXTURES, "journal", "2025-06-15.md"),
      "utf-8",
    );
    const blocks = parseBlocks(content);
    const entries = extractEntries(blocks, new Date(), config);

    expect(entries).toHaveLength(2);
    expect(entries[0].text).not.toContain("#miablog");
    expect(entries[0].text).not.toContain("miablog");
    expect(entries[0].text).toContain("taste buds");
  });

  it("includes children of tagged blocks", async () => {
    const content = await readFile(
      join(FIXTURES, "journal", "2025-06-15.md"),
      "utf-8",
    );
    const blocks = parseBlocks(content);
    const entries = extractEntries(blocks, new Date(), config);

    const pastaEntry = entries.find((e) => e.text.includes("pasta water"));
    expect(pastaEntry).toBeDefined();
    expect(pastaEntry!.children).toHaveLength(2);
  });

  it("returns nothing for untagged files", async () => {
    const content = await readFile(
      join(FIXTURES, "journal", "2025-08-20.md"),
      "utf-8",
    );
    const blocks = parseBlocks(content);
    const entries = extractEntries(blocks, new Date(), config);
    expect(entries).toHaveLength(0);
  });
});
