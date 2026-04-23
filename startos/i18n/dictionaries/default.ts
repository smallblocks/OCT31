export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting OpenClaw gateway...': 0,
  'Generating gateway auth token...': 1,
  Gateway: 2,
  'OpenClaw gateway is ready': 3,
  'OpenClaw gateway is not responding': 4,

  // interfaces.ts
  'Control UI': 5,
  'Web interface for managing OpenClaw — sessions, channels, tools, and skills.': 6,
  Bridge: 7,
  'WebSocket bridge for OpenClaw companion apps (macOS / iOS / Android nodes).': 8,

  // actions/showGatewayToken.ts
  'Show Gateway Token': 9,
  'Display the auto-generated authentication token used to access the OpenClaw gateway and pair companion apps.': 10,
  'Gateway Token': 11,
  'Paste this token into the OpenClaw companion app or include it as a Bearer token when calling the gateway over HTTP/WebSocket.': 12,
  Token: 13,

  // actions/regenerateGatewayToken.ts
  'Regenerate Gateway Token': 14,
  'Generate a new gateway authentication token. This invalidates the previous token; any companion apps and external clients will need to re-pair.': 15,
  'New Gateway Token': 16,
  'A new token has been generated. Restart the service for it to take effect, then re-pair any clients.': 17,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
