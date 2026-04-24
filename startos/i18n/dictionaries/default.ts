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

  // actions/configureLanModel.ts — action metadata
  'Configure LAN Model (vLLM)': 15,
  'Register a vLLM server on your local network as an OpenClaw model provider': 16,

  // action result
  'LAN Model Configured': 17,
  'Your vLLM server is registered and set as the default agent model. Restart OpenClaw for changes to take effect.': 18,
  'Your vLLM server is registered as a provider. Restart OpenClaw and select it in the Control UI for specific sessions.': 19,

  // form fields
  'vLLM Base URL': 20,
  'Full URL to your vLLM server, ending in /v1. Example: http://192.168.1.50:8000/v1': 21,
  'Model ID': 22,
  'The exact model id served by vLLM, as returned by /v1/models. Example: meta-llama/Llama-3.3-70B-Instruct': 23,
  'Model Family': 24,
  'Used to pick sensible context-window and max-output-token defaults. Pick the family of your model, or Custom to set them manually.': 25,
  'Context Window Override (optional)': 26,
  'Leave blank to use the default for the selected family. Set this if you launched vLLM with --max-model-len.': 27,
  'Max Output Tokens Override (optional)': 28,
  'Leave blank to use the default for the selected family. Max tokens OpenClaw will request per completion.': 29,
  'API Key (optional)': 30,
  'Only needed if you launched vLLM with --api-key. Leave blank for an open LAN server.': 31,
  'Use as Default Agent Model': 32,
  'Set this provider/model as the default agent model, replacing whatever is currently configured.': 33,

  // model family select values
  'Llama 3.x 70B / 8B (128K context)': 34,
  'Qwen 2.5 (128K context)': 35,
  'Qwen 3 (256K context)': 36,
  'Mistral Large / Nemo (128K context)': 37,
  'DeepSeek V3 / R1 (128K context)': 38,
  'GPT-OSS (128K context)': 39,
  'Custom (manual context window)': 40,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
