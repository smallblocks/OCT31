import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'

/**
 * Display the wrapper-managed gateway auth token to the user.
 *
 * The token is required to:
 *   - Log into the Control UI (Bearer or query param)
 *   - Pair OpenClaw companion apps (macOS / iOS / Android)
 *   - Authenticate any external client calling the gateway
 */
export const showGatewayToken = sdk.Action.withoutInput(
  'show-gateway-token',

  async ({ effects }) => ({
    name: i18n('Show Gateway Token'),
    description: i18n(
      'Display the auto-generated authentication token used to access the OpenClaw gateway and pair companion apps.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const token = await storeJson.read((s) => s.gatewayToken).once()

    return {
      version: '1',
      title: i18n('Gateway Token'),
      message: i18n(
        'Paste this token into the OpenClaw companion app or include it as a Bearer token when calling the gateway over HTTP/WebSocket.',
      ),
      result: {
        type: 'single',
        name: i18n('Token'),
        description: null,
        value: token ?? 'UNKNOWN',
        masked: true,
        copyable: true,
        qr: false,
      },
    }
  },
)
