import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import { bridgePort, dataMountpoint, gatewayPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting OpenClaw gateway...'))

  const { gatewayToken } = (await storeJson.read().const(effects)) ?? {}
  if (!gatewayToken) {
    throw new Error(
      'OpenClaw gateway token missing from store.json. ' +
        'Run the "Regenerate Gateway Token" action and then restart the service.',
    )
  }

  /**
   * Pre-seed openclaw.json with bind, auth, mode, and trustedProxies set.
   * Skipped if a config already exists, so user edits survive restarts.
   */
  const openclawConfig = JSON.stringify(
    {
      gateway: {
        mode: 'local',
        port: gatewayPort,
        bind: 'lan',
        auth: {
          mode: 'token',
          token: gatewayToken,
        },
        trustedProxies: [
          '127.0.0.1',
          '::1',
          '10.0.0.0/8',
          '172.16.0.0/12',
          '192.168.0.0/16',
        ],
      },
    },
    null,
    2,
  )
  const configB64 = Buffer.from(openclawConfig).toString('base64')

  /**
   * Bootstrap script. The container starts as root because the volume
   * mount lands at /home/node/.openclaw owned by root — but the upstream
   * Dockerfile expects OpenClaw to run as user `node` (uid 1000). So we:
   *   1. fix ownership of the mountpoint and config dir to node:node
   *   2. write openclaw.json (as root, then chown it to node)
   *   3. drop privileges to node and exec OpenClaw via `su`
   */
  const bootstrapScript =
    'set -e; ' +
    'CONFIG="$OPENCLAW_CONFIG_PATH"; ' +
    'CONFIG_DIR="$(dirname "$CONFIG")"; ' +
    'mkdir -p "$CONFIG_DIR"; ' +
    'chown -R node:node "$CONFIG_DIR"; ' +
    'if [ ! -f "$CONFIG" ]; then ' +
    '  echo "[wrapper] writing initial openclaw.json"; ' +
    '  echo "' + configB64 + '" | base64 -d > "$CONFIG"; ' +
    '  chown node:node "$CONFIG"; ' +
    '  chmod 600 "$CONFIG"; ' +
    'fi; ' +
    'exec su -p node -c "exec node /app/openclaw.mjs gateway"'

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
      command: ['sh', '-c', bootstrapScript],
      env: {
        OPENCLAW_GATEWAY_TOKEN: gatewayToken,
        HOME: '/home/node',
        OPENCLAW_STATE_DIR: dataMountpoint,
        OPENCLAW_CONFIG_PATH: dataMountpoint + '/openclaw.json',
        NODE_ENV: 'production',
      },
      sigtermTimeout: 30_000,
    },
    ready: {
      display: i18n('Gateway'),
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, gatewayPort, {
          successMessage: i18n('OpenClaw gateway is ready'),
          errorMessage: i18n('OpenClaw gateway is not responding'),
        }),
      gracePeriod: 30_000,
    },
    requires: [],
  })
})

export { bridgePort }
