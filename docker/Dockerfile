FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
      cron ca-certificates tini tzdata \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g obsidian-headless wrangler@latest

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . ./

COPY docker/crontab /etc/cron.d/mias-guide
RUN chmod 0644 /etc/cron.d/mias-guide && \
    crontab /etc/cron.d/mias-guide

COPY docker/entrypoint.sh /usr/local/bin/deploy-once
RUN chmod +x /usr/local/bin/deploy-once

RUN touch /var/log/cron.log

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["bash", "-c", "cron && tail -F /var/log/cron.log"]
