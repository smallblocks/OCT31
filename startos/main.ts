import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import { bridgePort, dataMountpoint, gatewayPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
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
   * Build the openclaw.json content as a JSON string. We pre-seed
   * gateway.trustedProxies with the StartOS internal proxy ranges so
   * OpenClaw accepts WebSocket upgrades from the StartOS reverse proxy
   * (without this, browsers get rejected with code 4008 "connect failed").
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

  // Base64-encode the config so we can pass it through the shell without
  // worrying about quoting. The bootstrap shell snippet decodes it and
  // writes the file only if one doesn't already exist (so user edits to
  // openclaw.json — channel creds, model API keys, etc. — survive restarts).
  const configB64 = Buffer.from(openclawConfig).toString('base64')
  const bootstrapScript =
    'CONFIG="$OPENCLAW_CONFIG_PATH"; ' +
    'if [ ! -f "$CONFIG" ]; then ' +
    '  echo "[wrapper] writing initial openclaw.json"; ' +
    '  mkdir -p "$(dirname "$CONFIG")"; ' +
    '  echo "' + configB64 + '" | base64 -d > "$CONFIG"; ' +
    'fi; ' +
    'exec node /app/openclaw.mjs gateway'

  /**
   * ======================== Daemon ========================
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
