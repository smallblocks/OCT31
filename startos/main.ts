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
   * Pre-seed openclaw.json. Key decisions:
   *   - bind: "lan"            - listen on all interfaces so StartOS can proxy
   *   - auth: token            - use our generated token
   *   - trustedProxies         - trust the StartOS internal proxy (10.0.x.x)
   *   - controlUi.dangerouslyAllowHostHeaderOriginFallback: true
   *                            - accept any origin whose host matches the
   *                              request host. Safe on StartOS because only
   *                              the StartOS proxy can reach us.
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
        controlUi: {
          dangerouslyAllowHostHeaderOriginFallback: true,
        },
      },
    },
    null,
    2,
  )
  const configB64 = Buffer.from(openclawConfig).toString('base64')

  const bootstrapScript =
    'set -e; ' +
    'CONFIG="$OPENCLAW_CONFIG_PATH"; ' +
    'mkdir -p "$(dirname "$CONFIG")"; ' +
    'if [ ! -f "$CONFIG" ] || ! grep -q "dangerouslyAllowHostHeaderOriginFallback" "$CONFIG"; then ' +
    '  echo "[wrapper] writing openclaw.json with StartOS-compatible settings"; ' +
    '  echo "' + configB64 + '" | base64 -d > "$CONFIG"; ' +
    '  chmod 600 "$CONFIG"; ' +
    'fi; ' +
    'exec node /app/openclaw.mjs gateway'

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
      user: 'root',
      env: {
        OPENCLAW_GATEWAY_TOKEN: gatewayToken,
        HOME: '/root',
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
