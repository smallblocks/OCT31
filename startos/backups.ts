import { sdk } from './sdk'

/**
 * Back up the entire `main` volume.
 *
 * On restore, OpenClaw's `/data/.openclaw/` directory is fully restored
 * before the daemon starts, including:
 *   - openclaw.json (gateway + channel config, includes the gateway password)
 *   - workspace/ (skills, AGENTS.md, SOUL.md, sessions, accumulated memory)
 *   - agents/ (session state)
 */
export const { createBackup, restoreInit } = sdk.setupBackups(
  async ({ effects }) => sdk.Backups.ofVolumes('main'),
)
