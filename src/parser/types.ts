export interface Config {
  vaultPath: string;
  tag: string;
  categories: string[];
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
