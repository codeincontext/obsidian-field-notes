# Mia's Guide

## What is this?

A collection of notes, wisdom, and life lessons from dad to Mia. Things worth knowing about cooking, life skills, money, relationships, and whatever else comes up. Written in small pieces over time through daily journaling, published as a simple website.

## Motivation

- Dad wants to pass on things he's learned, in case he's not around to say them
- Should be effortless to add to — just tag a block while journaling
- Not a blog, not essays — short notes, a couple of sentences or a paragraph each
- Could grow to include photos and personal memories over time

## Decisions

### Name
- **Site name:** Mia's Guide
- **Tag:** `#miablog/<category>` (nested Obsidian hashtag — was `[[miablog]]` + `#category` in Logseq)

### Content model
- Source: Obsidian daily journal entries tagged with `#miablog/<category>` (e.g. `#miablog/cooking`)
- Bare `#miablog` (no category) is also accepted; the entry just has no category
- Each entry is a block (a bullet point / paragraph)
- Optional topic tags alongside the main tag (e.g. `#cooking`, `#money`)
- Topics are freeform — use whatever tags feel natural
- Tags don't automatically create a category/page on the site; categories are curated separately (e.g. via a config file that maps tags to visible categories)
- Date comes from the journal page filename
- Tone is mixed — some notes are personal ("I learned this when..."), others are practical ("salt your pasta water"). The site doesn't force a voice.
- Private content deferred for now — no private tagging convention yet

### Example journal entry
```
- Always taste as you cook, not just at the end. Your taste buds are the most important tool. #miablog/cooking
```

### Site
- Static HTML/CSS, minimal design
- Default view: chronological list of notes
- Optional topic filtering (curated, not auto-generated from every tag)
- Support for images (rare)
- Private/unlocked version deferred to later

### Tech stack
- **Parser:** TypeScript — reads Obsidian vault markdown, extracts blocks tagged with `#miablog`
- **Build:** Script that extracts tagged blocks → generates static HTML
- **Hosting:** Cloudflare Pages (no custom domain initially, `*.pages.dev`)
- **Vault sync:** Obsidian Sync (paid) handles Mac ↔ Android. Builds run locally against `~/Documents/obsidian-vault/`.

### Domain candidates (for later)
- `mia.adz.co.de`
- `guide.adz.co.de`
- Or any subdomain of adz.co.de / with.co.de / and.co.de / context.co.de
- No custom domain needed initially

## Migration: Logseq → Obsidian (2026-05-20)

Switched from Logseq to Obsidian. Main driver: Logseq sync between Android and Mac was unreliable.

### Vault layout
- Path: `~/Documents/obsidian-vault/`
- Daily notes in `journal/` as `YYYY-MM-DD.md`
- Template in `templates/Daily.md`
- Old Logseq graph kept read-only at `~/Documents/logseq-home/` for reference

### Sync
- Obsidian Sync ($5/mo) — Mac ↔ Android

### Tag convention
- `#miablog/<category>` — nested Obsidian hashtag (e.g. `#miablog/cooking`, `#miablog/money`)
- Bare `#miablog` (no category) is accepted; entry just lacks a category
- Tag pane shows hierarchy: `miablog > cooking, money, life`

### Journal migration
- All 448 Logseq journals copied to the Obsidian vault, renamed `yyyy_MM_dd.md` → `YYYY-MM-DD.md`
- Transforms applied during copy:
  - `- LATER ` / `- NOW ` → `- [ ] ` (Obsidian checkbox)
  - `- DONE ` → `- [x] `
  - Stripped `id::`/`collapsed::` block plumbing lines
  - Stripped `((uuid))` block reference tokens
- First-section heading normalized: all `### Foo` section headers are now plain headings (no `- ` bullet prefix)
- Zero `#miablog` entries existed at migration time, so no tag rewriting was needed

### Parser changes
- Reads from `<vaultPath>/journal/` (singular) instead of `<graphPath>/journals/` (plural)
- Filename regex: `YYYY-MM-DD.md` instead of `yyyy_MM_dd.md`
- Tag detection: matches `#miablog` or `#miablog/<category>`; category is extracted from the path after the slash
- Config field renamed `graphPath` → `vaultPath`

Migration reference: https://msfjarvis.dev/posts/migrating-from-logseq-to-obsidian/
