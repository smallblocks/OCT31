import { VersionInfo } from '@start9labs/start-sdk'

/**
 * Version format is `<upstream-version>:<wrapper-revision>`.
 * Bump the wrapper revision (`:1`, `:2`, ...) for packaging changes that
 * don't change the upstream version.
 *
 * OpenClaw doesn't ship semver tags; their stable channel uses date-based
 * versions like `vYYYY.M.D`. We track those in `upstreamRepo` and pin the
 * specific commit via the git submodule at `./openclaw`.
 */
export const v_2026_4_23_0 = VersionInfo.of({
  version: '2026.4.23:1',
  releaseNotes: {
    en_US: 'Initial StartOS 0.4.0 wrapper for OpenClaw.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
