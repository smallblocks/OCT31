import { utils } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'

/**
 * Generate a fresh gateway token and persist it. The user must restart the
 * service for the new token to take effect (the running OpenClaw process
 * reads the token from `OPENCLAW_GATEWAY_TOKEN` env at startup), and any
 * paired companion apps and external clients will need to re-authenticate.
 */
export const regenerateGatewayToken = sdk.Action.withoutInput(
  'regenerate-gateway-token',

  async ({ effects }) => ({
    name: i18n('Regenerate Gateway Token'),
    description: i18n(
      'Generate a new gateway authentication token. This invalidates the previous token; any companion apps and external clients will need to re-pair.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const newToken = utils.getDefaultString({
      // 64 hex chars = `openssl rand -hex 32`, matching OpenClaw's docs.
      charset: '0-9,a-f',
      len: 64,
    })

    await storeJson.merge(effects, { gatewayToken: newToken })

    return {
      version: '1',
      title: i18n('New Gateway Token'),
      message: i18n(
        'A new token has been generated. Restart the service for it to take effect, then re-pair any clients.',
      ),
      result: {
        type: 'single',
        name: i18n('Token'),
        description: null,
        value: newToken,
        masked: true,
        copyable: true,
        qr: false,
      },
    }
  },
)
