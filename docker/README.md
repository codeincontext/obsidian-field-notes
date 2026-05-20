# Docker deploy stack

Runs `ob sync` + build + `wrangler deploy` hourly. Designed for an x86_64
home Docker host managed via Dockge.

## Two compose files

- `docker-compose.yml` — primary. Build context is the GitHub repo URL. Use this
  on the home server: only `docker-compose.yml` + `.env` need to live in
  Dockge's stacks folder; the code is pulled from GitHub at build time.
- `docker-compose.local.yml` — for local development. Build context is the
  parent directory (`..`). Use this when iterating on the Dockerfile or
  entrypoint without pushing to GitHub first.

## Prerequisites

- Active Obsidian Sync subscription (same one used by your desktop/mobile clients)
- Cloudflare Account API Token with **Workers Scripts: Edit** + **Account Settings: Read**.
  Create one at https://dash.cloudflare.com/<account-id>/api-tokens
- The repo pushed to GitHub. Edit the `context:` URL in `docker-compose.yml` if
  you've forked.
- Server's local time TZ — change `TZ:` in the compose file if needed (default
  `Europe/Paris`).

## Home server setup (Dockge)

1. Create a stack in Dockge named `field-notes-mia`.
2. Drop `docker-compose.yml` and `.env` into the stack folder.
3. In `.env`, paste your Cloudflare API token:
   ```
   CLOUDFLARE_API_TOKEN=...
   ```
4. Build the image (clones the repo at this point):
   ```
   docker compose build
   ```
5. Authenticate Obsidian Sync interactively, **before** starting the long-running container:
   ```
   docker compose run --rm field-notes-mia bash
   ```
   Inside the container:
   ```
   ob login                                              # interactive prompts
   ob sync-list-remote                                   # find your vault name
   ob sync-setup --vault <vault-name> --path /vault --device-name "<server-name>"
   exit
   ```
   This persists credentials to the `ob-config` volume.
6. Start the stack (Dockge button or `docker compose up -d`).
7. Trigger a manual run to verify:
   ```
   docker compose exec field-notes-mia /usr/local/bin/deploy-once
   ```

## Updating after a code change

Push to GitHub, then on the server:
```
docker compose build --pull --no-cache && docker compose up -d
```

## Local development

```
docker compose -f docker-compose.local.yml build
docker compose -f docker-compose.local.yml run --rm field-notes-mia bash
```

## How it works

- The container's CMD is a bash loop: `deploy-once`, then `sleep 3600`, repeat.
- `deploy-once` runs `ob sync --path /vault`, then `npm run deploy`.
- `npm run deploy` builds the two HTMLs, then runs `wrangler deploy`. The
  upload is skipped when the hash of `built/{public,private}.html` matches the
  previous deploy.
- Each `deploy-once` call is wrapped in `timeout 600`.
- Logs go to stdout/stderr (`docker compose logs`).

## Logs

```
docker compose logs -f field-notes-mia
```

## Notes

- Do not run `ob` on the same machine where Obsidian.app desktop is syncing the
  same vault. Data conflict risk. (Server is a different device — fine.)
- If the Cloudflare API token leaks, the worst-case is publishing to your
  `field-notes-mia` Worker. The Obsidian E2EE password lives only on the server's
  `ob-config` volume — protect that disk.
