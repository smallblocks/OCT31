import { setPassword } from '../actions/setPassword'
import { openclawJson } from '../fileModels/openclaw.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

/**
 * On every init, check if the gateway password has been configured.
 * If not, create a "critical" install task so StartOS prompts the user
 * to run the Set Password action before the service can be started.
 */
export const taskSetPassword = sdk.setupOnInit(async (effects) => {
  const hasPassword = await openclawJson
    .read((c) => c.gateway.auth.password)
    .const(effects)

  if (!hasPassword) {
    await sdk.action.createOwnTask(effects, setPassword, 'critical', {
      reason: i18n('Set your OpenClaw Control UI password to enable login'),
    })
  }
})
