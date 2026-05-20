import { readdir } from "node:fs/promises";
import { join } from "node:path";

export interface JournalFile {
  filePath: string;
  date: Date;
}

const FILENAME_RE = /^(\d{4})-(\d{2})-(\d{2})\.md$/;

export async function scanJournals(vaultPath: string): Promise<JournalFile[]> {
  const journalsDir = join(vaultPath, "journal");
  const files = await readdir(journalsDir);

  const journals: JournalFile[] = [];

  for (const file of files) {
    const match = file.match(FILENAME_RE);
    if (!match) continue;

    const [, year, month, day] = match;
    journals.push({
      filePath: join(journalsDir, file),
      date: new Date(Number(year), Number(month) - 1, Number(day)),
    });
  }

  return journals.sort((a, b) => b.date.getTime() - a.date.getTime());
}
