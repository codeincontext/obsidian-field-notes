# Docker deploy stack

Runs `ob sync` + build + `wrangler deploy` daily at 09:00 server time.
Designed for an x86_64 home Docker host managed via Dockge.

## Two compose files

- `docker-compose.yml` — primary. Build context is the GitHub repo URL. Use this
  on the home server: only `docker-compose.yml` + `.env` need to live in
  Dockge's stacks folder; the code is pulled from GitHub at build time.
- `docker-compose.local.yml` — for local development. Build context is the
  parent directory (`..`). Use this when iterating on the Dockerfile or
  entrypoint without pushing to GitHub first.

## Prerequisites

- Active Obsidian Sync subscription (same one used by your desktop/mobile clients)
- Cloudflare API token with **Workers Scripts: Edit** + **Account Settings: Read**.
  Create one at https://dash.cloudflare.com/profile/api-tokens
- For the primary compose: the repo pushed to GitHub. Edit the `context:` URL in
  `docker-compose.yml` to point at your fork/account (replace `<github-user>`).
- Server's local time TZ matches when you want the 09:00 cron to fire — change
  `TZ:` in the compose file if needed (default `Europe/Paris`).

## Home server setup (Dockge)

1. Create a stack in Dockge named `mias-guide`.
2. Drop `docker-compose.yml` and `.env` into the stack folder.
3. In `.env`, paste your Cloudflare API token:
   ```
   CLOUDFLARE_API_TOKEN=...
   ```
4. Build the image (pulls the repo at this point):
   ```
   docker compose build
   ```
5. Authenticate Obsidian Sync interactively, **before** starting the long-running container:
   ```
   docker compose run --rm mias-guide bash
   ```
   Inside the container:
   ```
   ob login                                              # interactive prompts
   ob sync-list-remote                                   # find your vault name
   ob sync-setup --vault <vault-name> --path /vault --device-name "home-server"
   exit
   ```
   This persists credentials to the `ob-config` volume.
6. Start the stack (Dockge button or `docker compose up -d`).
7. Trigger a manual run to verify:
   ```
   docker compose exec mias-guide /usr/local/bin/deploy-once
   ```

## Updating after a code change

Push to GitHub, then on the server:
```
docker compose build --pull && docker compose up -d
```

## Local development

```
docker compose -f docker-compose.local.yml build
docker compose -f docker-compose.local.yml run --rm mias-guide bash
```

## How it works

- `cron` runs `/usr/local/bin/deploy-once` daily at 09:00 container time.
- `deploy-once` does: `ob sync --path /vault` → `npm run deploy`
- `deploy` skips Wrangler upload if `dist/index.html` hash is unchanged.
- The `hash-cache` volume keeps `dist/` (and the hash file) between runs.

## Logs

```
docker compose logs -f mias-guide          # cron daemon + tailed entries
```

## Notes

- Do not run `ob` on the same machine where Obsidian.app desktop is syncing the
  same vault. Data conflict risk. (Server is a different device — fine.)
- If the Cloudflare API token leaks, the worst-case is publishing to your
  `mias-guide` Worker. The Obsidian E2EE password lives only on the server's
  `ob-config` volume — protect that disk.
