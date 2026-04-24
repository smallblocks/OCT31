import { openclawJson } from './fileModels/openclaw.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { bridgePort, gatewayPort, mainMounts } from './utils'

/**
 * Daemon layout:
 *
 *   chown (oneshot)  -> primary (daemon)
 *
 * - chown runs as root before the gateway starts and fixes ownership
 *   on the mounted volume so OpenClaw (running as node inside the image)
 *   can write to /data. This is required because StartOS mounts the
 *   volume owned by the container's root user.
 *
 * - primary runs the OpenClaw gateway. Auth config lives in
 *   /data/.openclaw/openclaw.json, written by the wrapper's init hooks.
 *   The `--allow-unconfigured` flag lets the gateway start even if the
 *   user hasn't finished the optional channel setup.
 */
export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting OpenClaw Gateway...'))

  // Require the password to be set before we start. The "Set Password"
  // critical install task enforces this interactively; this is a guard
  // in case the user starts the service without completing that task.
  const password = await openclawJson
    .read((c) => c.gateway.auth.password)
    .const(effects)
  if (!password) {
    throw new Error(
      'OpenClaw password is not set. Run the "Set Password" action and then start the service.',
    )
  }

  const openclawSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'main' },
    mainMounts(),
    'openclaw-sub',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('chown', {
      subcontainer: openclawSub,
      exec: {
        command: ['chown', '-R', 'node:node', '/data'],
      },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer: openclawSub,
      exec: {
        command: [
          'openclaw',
          'gateway',
          '--port',
          gatewayPort.toString(),
          '--bind',
          'lan',
          '--verbose',
          '--allow-unconfigured',
        ],
        env: {
          HOME: '/data',
          OPENCLAW_STATE_DIR: '/data/.openclaw',
        },
        sigtermTimeout: 30_000,
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkWebUrl(
            effects,
            `http://openclaw.startos:${gatewayPort}`,
            {
              successMessage: i18n('OpenClaw Gateway is ready'),
              errorMessage: i18n('OpenClaw Gateway is not ready'),
            },
          ),
        gracePeriod: 40_000,
      },
      requires: ['chown'],
    })
})

export { bridgePort }
