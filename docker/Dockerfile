FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates tini tzdata \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g obsidian-headless wrangler@latest tsx

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . ./

COPY docker/entrypoint.sh /usr/local/bin/deploy-once
RUN chmod +x /usr/local/bin/deploy-once

ENTRYPOINT ["/usr/bin/tini", "--"]
# Sleep loop instead of cron: env vars from compose are inherited naturally,
# `timeout 600` prevents a hung run blocking the next, all output goes to docker logs.
CMD ["bash", "-c", "while true; do timeout 600 /usr/local/bin/deploy-once || true; sleep 3600; done"]
