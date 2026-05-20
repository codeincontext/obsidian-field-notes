import { readFile } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import type { Block, Config, Entry } from "../parser/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function miniMarkdown(text: string): string {
  let html = text
    // Images — strip Logseq metadata suffix like {:height 214, :width 560}
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)(\{[^}]*\})?/g,
      (_match, alt: string, src: string) => {
        const filename = basename(src);
        return `<img src="./assets/${filename}" alt="${alt}">`;
      },
    )
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

  return html;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderChildren(children: Block[]): string {
  if (children.length === 0) return "";
  const items = children
    .map((child) => {
      const text = miniMarkdown(child.text);
      const nested = renderChildren(child.children);
      return `<li>${text}${nested}</li>`;
    })
    .join("\n");
  return `<ul class="entry-children">${items}</ul>`;
}

function renderEntry(entry: Entry): string {
  const cats = entry.categories.join(" ");
  const dateFmt = formatDate(entry.date);
  const text = miniMarkdown(entry.text);
  const children = renderChildren(entry.children);
  const categoryPills = entry.categories
    .map((c) => `<span>${c}</span>`)
    .join("");

  return `
    <article class="entry" data-categories="${cats}">
      <div class="entry-date">${dateFmt}</div>
      <div class="entry-text">${text}</div>
      ${children}
      ${categoryPills ? `<div class="entry-categories">${categoryPills}</div>` : ""}
    </article>`;
}

function filterScript(): string {
  return `
  <script>
    document.querySelector('.filters')?.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      const cat = e.target.dataset.category;
      document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      document.querySelectorAll('.entry').forEach(el => {
        if (cat === 'all') {
          el.style.display = '';
        } else {
          el.style.display = el.dataset.categories.split(' ').includes(cat) ? '' : 'none';
        }
      });
    });
  </script>`;
}

export async function generateHTML(
  entries: Entry[],
  config: Config,
): Promise<string> {
  const css = await readFile(
    join(__dirname, "..", "templates", "styles.css"),
    "utf-8",
  );

  const usedCategories = [
    ...new Set(entries.flatMap((e) => e.categories)),
  ].filter((c) => config.categories.includes(c));

  const filterButtons =
    usedCategories.length > 0
      ? `<div class="filters">
          <button class="active" data-category="all">All</button>
          ${usedCategories.map((c) => `<button data-category="${c}">${c}</button>`).join("\n")}
        </div>`
      : "";

  const entriesHTML =
    entries.length > 0
      ? entries.map(renderEntry).join("\n")
      : '<p class="empty">No notes yet.</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.siteName}</title>
  <style>${css}</style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${config.siteName}</h1>
      <p>Notes from dad</p>
    </header>
    ${filterButtons}
    <main>
      ${entriesHTML}
    </main>
  </div>
  ${usedCategories.length > 0 ? filterScript() : ""}
</body>
</html>`;
}
