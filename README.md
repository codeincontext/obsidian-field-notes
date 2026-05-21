# obsidian-field-notes

A tool for publishing a [commonplace book](https://en.wikipedia.org/wiki/Commonplace_book)
from an Obsidian vault. Powers [Field Notes for Mia](https://field-notes-mia.codeincontext.workers.dev).

A commonplace book is a personal collection of quotes, advice, recipes,
observations, and other useful snippets — kept over time and organized by
topic for later reference.

You tag short blocks in your daily journal entries with `#fieldnotes/<category>`,
and they're extracted and published as a static website, organized by topic
and dated by the journal entry.

## How it works

1. Write daily notes in Obsidian (in `journal/YYYY-MM-DD.md`).
2. Tag any block you want to publish — e.g. `#fieldnotes/cooking`.
3. Run `npm run deploy`. The parser extracts tagged blocks, generates a static
   HTML site, and pushes it to Cloudflare Workers.

A journal bullet like:

```
- Always taste as you cook, not just at the end. Your taste buds
  are the most important tool. #fieldnotes/cooking
```

becomes a single rendered entry on your site, filed under "cooking", dated by
the journal's filename.

## Personal instance

This repo also contains the config for
[Field Notes for Mia](https://field-notes-mia.codeincontext.workers.dev),
the instance run by the author. See
[`config.ts`](config.ts) for the config shape: vault
path, tag prefix, categories, site name.

## Setup

- `npm install`
- Edit `config.ts` to point at your vault and set your tag/categories
- `npm run build` to generate `dist/index.html`
- `npm run deploy` to publish to Cloudflare Workers (requires `wrangler` auth)

For unattended deploys from a home Docker server (using `obsidian-headless`
Sync + cron), see [`docker/README.md`](docker/README.md).

## Project layout

```
src/         parser + HTML generator + deploy script
test/        vitest suite
docker/      home-server stack (compose + Dockerfile + cron)
docs/        design doc
```

## License

MIT (probably — TBD).
