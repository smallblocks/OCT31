// Constants shared across the package codebase.
//
// These match upstream OpenClaw defaults. Keep in sync with:
//   https://github.com/openclaw/openclaw/blob/main/docs/gateway/index.md
//   https://github.com/openclaw/openclaw/blob/main/docker-compose.yml

/** Gateway HTTP/WebSocket port — Control UI, RPC, and channel webhooks. */
export const gatewayPort = 18789

/** Bridge port — used by companion apps (macOS / iOS / Android nodes). */
export const bridgePort = 18790

/**
 * Mount point inside the container for the persistent volume.
 *
 * The upstream OpenClaw Dockerfile sets `USER node` (uid 1000) and expects
 * runtime config at `$HOME/.openclaw`. We mount the StartOS `main` volume
 * here and let OpenClaw populate it on first start.
 */
export const dataMountpoint = '/home/node/.openclaw'
