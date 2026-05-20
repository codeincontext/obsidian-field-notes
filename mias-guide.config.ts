import type { Config } from "./src/parser/types.js";

const config: Config = {
  vaultPath: "~/Documents/obsidian-vault",
  tag: "fieldnotes",
  categories: ["cooking", "money", "life"],
  lockedCategory: "locked",
  siteName: "Field Notes for Mia",
  outDir: "./dist",
};

export default config;
