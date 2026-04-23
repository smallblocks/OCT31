import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

/**
 * Run on every init, but only generate a fresh token on first install.
 * On update / restore we leave the persisted token alone so paired clients
 * keep working.
 */
export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    await storeJson.merge(effects, {
      gatewayToken: utils.getDefaultString({
        // 64 hex chars = `openssl rand -hex 32`, matching OpenClaw's docs.
        charset: '0-9,a-f',
        len: 64,
      }),
    })
  } else {
    // Touch the file so it exists with the validated shape.
    await storeJson.merge(effects, {})
  }
})
