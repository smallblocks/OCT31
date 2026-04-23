import { sdk } from './sdk'

/**
 * Back up the entire `main` volume.
 *
 * On restore, OpenClaw's `~/.openclaw` directory (which lives on this volume)
 * is fully restored before the daemon starts, including:
 *   - openclaw.json (gateway + channel config)
 *   - workspace/ (skills, AGENTS.md, SOUL.md, sessions)
 *   - store.json (wrapper-managed gateway token)
 */
export const { createBackup, restoreInit } = sdk.setupBackups(
  async ({ effects }) => sdk.Backups.ofVolumes('main'),
)
