// Constants shared across the package codebase.

import { sdk } from './sdk'

/** Gateway HTTP/WebSocket port — Control UI, RPC, and channel webhooks. */
export const gatewayPort = 18789

/** Bridge port — used by companion apps (macOS / iOS / Android nodes). */
export const bridgePort = 18790

/** Mount point inside the container for the persistent volume. */
export const dataMountpoint = '/data'

/** Mount helper used by main.ts and any oneshot tasks. */
export function mainMounts() {
  return sdk.Mounts.of().mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: dataMountpoint,
    readonly: false,
  })
}
