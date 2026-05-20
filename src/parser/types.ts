export interface Config {
  vaultPath: string;
  tag: string;
  categories: string[];
  /** Tag subpath that marks an entry as locked. Entries with this category are
   * excluded from the published site. Defaults to `"locked"` if unset. */
  lockedCategory?: string;
  siteName: string;
  outDir: string;
}

export interface Block {
  text: string;
  depth: number;
  children: Block[];
}

export interface Entry {
  date: Date;
  text: string;
  children: Block[];
  tags: string[];
  categories: string[];
  images: string[];
}
