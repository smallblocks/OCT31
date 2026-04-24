import { mkdir } from 'fs/promises'
import { openclawJson } from '../fileModels/openclaw.json'
import { sdk } from '../sdk'

/**
 * Run on install/upgrade/restore. Writes the StartOS-required keys into
 * openclaw.json. User-managed sections (channels, model defaults) are
 * preserved because `openclawJson.merge` only touches the keys we name.
 *
 * We don't seed a password here — that's a critical task ("Set Password")
 * the user completes during install.
 */
export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  // Ensure the state directory exists before FileHelper tries to write.
  await mkdir(sdk.volumes.main.subpath('.openclaw'), { recursive: true })

  await openclawJson.merge(effects, {
    gateway: {
      auth: { mode: 'password' },
      controlUi: {
        enabled: true,
        allowInsecureAuth: true,
        dangerouslyAllowHostHeaderOriginFallback: true,
        dangerouslyDisableDeviceAuth: true,
      },
      trustedProxies: [
        '127.0.0.1',
        '::1',
        '10.0.0.0/8',
        '172.16.0.0/12',
        '192.168.0.0/16',
      ],
    },
  })
})
