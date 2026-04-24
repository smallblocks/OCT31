import { mkdir, writeFile, access } from 'fs/promises'
import { openclawJson } from '../fileModels/openclaw.json'
import { sdk } from '../sdk'

/**
 * Run on install/upgrade/restore. Writes the StartOS-required keys into
 * openclaw.json. User-managed sections (channels, model defaults) are
 * preserved because `openclawJson.merge` only touches the keys we name.
 *
 * Also configures start-cli so the OpenClaw agent can manage the local
 * StartOS server.
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

  // Configure start-cli to talk to the StartOS host.
  // In StartOS LXC containers, the host RPC is at the container gateway (10.0.3.1).
  // start-cli reads its config from /data/.startos/config.yaml.
  const startosDir = sdk.volumes.main.subpath('.startos')
  const configPath = startosDir + '/config.yaml'

  await mkdir(startosDir, { recursive: true })

  // Always write the config (host address doesn't change).
  await writeFile(configPath, 'host: http://10.0.3.1\n', 'utf-8')

  // Login to get a session cookie if we don't have one yet.
  // On first install, the user hasn't set a StartOS password yet so this
  // may fail — that's fine, start-cli will just be unauthenticated until
  // the user runs `start-cli auth login` manually or we retry on upgrade.
  const cookiePath = startosDir + '/.cookies.json'
  try {
    await access(cookiePath)
    // Cookie file exists — don't overwrite (session may still be valid).
  } catch {
    // No cookie file yet. We can't auto-login without knowing the
    // StartOS master password, so just leave it. The agent's SOUL.md
    // instructs it to run `start-cli auth login` if commands fail.
    console.info('[seedFiles] start-cli config written; cookie not yet set (run start-cli auth login inside the container to authenticate)')
  }
})
