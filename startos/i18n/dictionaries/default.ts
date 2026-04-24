export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting OpenClaw Gateway...': 0,
  'Web Interface': 1,
  'OpenClaw Gateway is ready': 2,
  'OpenClaw Gateway is not ready': 3,

  // interfaces.ts
  'Web UI': 4,
  'OpenClaw Gateway Control UI — sessions, channels, tools, and skills.': 5,

  // actions/setPassword.ts
  'Set Password': 6,
  'Reset Password': 7,
  'Generate the password needed to log in to the OpenClaw Control UI': 8,
  'Reset your OpenClaw Control UI password': 9,
  'Existing browser sessions will be invalidated.': 10,
  'Password Set': 11,
  'Paste this password into the OpenClaw Control UI login form. Copy it now — it is only shown once.': 12,
  Password: 13,

  // init/taskSetPassword.ts
  'Set your OpenClaw Control UI password to enable login': 14,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
