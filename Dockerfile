FROM node:22-bookworm-slim

ARG OPENCLAW_VERSION=2026.4.23-beta.6

# System dependencies: OpenClaw agents invoke bash/git/curl/jq at runtime.
# ca-certificates is required for the install script's HTTPS fetches.
# uv is the Python package manager some OpenClaw sidecars use.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    jq \
    python3 \
    ripgrep \
    tmux \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install uv (needed by OpenClaw's Python agent sidecars).
RUN curl -LsSf https://astral.sh/uv/install.sh | UV_INSTALL_DIR=/usr/local/bin sh

# Install OpenClaw globally via the official install script.
# HOME is set to a scratch path here so the installer doesn't scribble into /root.
ENV HOME=/opt/openclaw-home
RUN mkdir -p /opt/openclaw-home && \
    curl -fsSL https://openclaw.bot/install.sh \
      | bash -s -- --no-prompt --no-onboard --version "${OPENCLAW_VERSION}"

# Runtime env: volume is mounted at /data on every start.
# OpenClaw reads openclaw.json from $OPENCLAW_STATE_DIR.
ENV NODE_ENV=production
ENV HOME=/data
ENV OPENCLAW_STATE_DIR=/data/.openclaw
ENV PATH="/opt/openclaw-home/.openclaw/bin:/usr/local/lib/node_modules/openclaw/bin:/usr/local/bin:${PATH}"

WORKDIR /data

# StartOS daemons override this, but make the image runnable standalone too.
CMD ["openclaw", "gateway", "--port", "18789", "--bind", "lan"]
