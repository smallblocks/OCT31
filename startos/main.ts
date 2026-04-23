import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import { bridgePort, dataMountpoint, gatewayPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
   *
   * Load the wrapper-managed gateway token and inject it into OpenClaw via
   * the `OPENCLAW_GATEWAY_TOKEN` env var. The token was generated on
   * install (see `init/seedFiles.ts`) and is persisted in `store.json` on
   * the `main` volume.
   *
   * If the token is missing for any reason (corrupt store, manual deletion)
   * we surface that loudly rather than silently starting an unauthenticated
   * gateway — OpenClaw's own startup will refuse to bind to non-loopback
   * without auth, which would loop the service. See:
   *   https://github.com/openclaw/openclaw/blob/main/docs/gateway/configuration-reference.md
   */
  console.info(i18n('Starting OpenClaw gateway...'))

  const { gatewayToken } = (await storeJson.read().const(effects)) ?? {}
  if (!gatewayToken) {
    throw new Error(
      'OpenClaw gateway token missing from store.json. ' +
        'Run the "Regenerate Gateway Token" action and then restart the service.',
    )
  }

  /**
   * ======================== Daemon ========================
   *
   * Single subcontainer running the OpenClaw gateway. Bound to `lan`
   * (0.0.0.0) on port 18789 so StartOS's networking stack can route
   * inbound traffic from LAN, Tor, and clearnet. Auth is enforced via
   * the gateway token.
   *
   * The `main` volume is mounted at `/home/node/.openclaw` because the
   * upstream Dockerfile sets `USER node` (uid 1000) with `HOME=/home/node`
   * and OpenClaw stores its state at `$HOME/.openclaw`. Mounting there
   * means OpenClaw's default paths (`openclaw.json`, `workspace/`, logs,
   * channel sessions) all land on the persistent volume.
   */
  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: await sdk.SubContainer.of(
      effects,
      { imageId: 'main' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: dataMountpoint,
        readonly: false,
      }),
      'openclaw-sub',
    ),
    exec: {
      command: [
        'node',
        '/app/openclaw.mjs',
        'gateway',
        '--bind',
        'lan',
        '--port',
        String(gatewayPort),
        '--allow-unconfigured',
      ],
      env: {
        OPENCLAW_GATEWAY_TOKEN: gatewayToken,
        // Point OpenClaw at the persistent volume for state + workspace.
        // These match the defaults derived from $HOME, but we set them
        // explicitly so future upstream default changes don't surprise us.
        HOME: '/home/node',
        OPENCLAW_STATE_DIR: dataMountpoint,
        OPENCLAW_CONFIG_PATH: `${dataMountpoint}/openclaw.json`,
        // Production mode silences dev warnings.
        NODE_ENV: 'production',
      },
      // OpenClaw's gateway can take a moment to do first-start migrations
      // and to scan the workspace. Give it generous shutdown headroom.
      sigtermTimeout: 30_000,
    },
    ready: {
      display: i18n('Gateway'),
      // OpenClaw exposes `/healthz` for liveness — but the simplest and
      // most reliable check is just whether the port is bound. Once it is,
      // the gateway is accepting connections.
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, gatewayPort, {
          successMessage: i18n('OpenClaw gateway is ready'),
          errorMessage: i18n('OpenClaw gateway is not responding'),
        }),
      // OpenClaw's first start does a node_modules-ish workspace scan and
      // can take 15-30 s; don't flash red during the warm-up.
      gracePeriod: 30_000,
    },
    requires: [],
  })
})

// Avoid unused-import lint when bridgePort isn't referenced in the daemon
// command (it's already declared via setInterfaces). Re-exporting keeps it
// available to anyone extending main.ts.
export { bridgePort }
