import { utils } from '@start9labs/start-sdk'
import { openclawJson } from '../fileModels/openclaw.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

/**
 * Generate (or regenerate) the password used to log in to the OpenClaw
 * Control UI. Name flips to "Reset Password" once a password exists, so
 * users aren't confused about whether it's already been set.
 */
export const setPassword = sdk.Action.withoutInput(
  'set-password',

  async ({ effects }) => {
    const hasPass = !!(await openclawJson
      .read((c) => c.gateway.auth.password)
      .const(effects))

    return {
      name: hasPass ? i18n('Reset Password') : i18n('Set Password'),
      description: hasPass
        ? i18n('Reset your OpenClaw Control UI password')
        : i18n(
            'Generate the password needed to log in to the OpenClaw Control UI',
          ),
      warning: hasPass
        ? i18n('Existing browser sessions will be invalidated.')
        : null,
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    }
  },

  async ({ effects }) => {
    const password = utils.getDefaultString({
      charset: 'a-z,A-Z,1-9,!,@,$,%,&,*',
      len: 22,
    })

    await openclawJson.merge(effects, {
      gateway: { auth: { mode: 'password', password } },
    })

    return {
      version: '1' as const,
      title: i18n('Password Set'),
      message: i18n(
        'Paste this password into the OpenClaw Control UI login form. Copy it now — it is only shown once.',
      ),
      result: {
        type: 'single' as const,
        name: i18n('Password'),
        description: null,
        value: password,
        copyable: true,
        masked: true,
        qr: false,
      },
    }
  },
)
