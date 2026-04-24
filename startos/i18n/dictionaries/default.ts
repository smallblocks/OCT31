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

  // actions/configureLanModels.ts — action metadata
  'Configure LAN Models': 15,
  'Register up to three vLLM (OpenAI-compatible) servers on your LAN as model providers. Each slot becomes a separate provider in OpenClaw.': 16,
  'Your vLLM server must be launched with tool-calling flags for OpenClaw agents to work. For Gemma 4: --enable-auto-tool-choice --tool-call-parser gemma4 --reasoning-parser gemma4 --chat-template examples/tool_chat_template_gemma4.jinja. For Qwen 2.5/3: --enable-auto-tool-choice --tool-call-parser hermes. For Llama 3.x: --enable-auto-tool-choice --tool-call-parser llama3_json.': 17,

  // action result
  'LAN Models Configured': 18,
  'LAN model providers saved. Restart OpenClaw for changes to take effect.': 19,
  'No enabled slots. All lan-model-* providers have been removed from OpenClaw.': 20,

  // slot labels
  'Slot 1': 21,
  'Slot 2': 22,
  'Slot 3': 23,
  'Enable Slot 1': 24,
  'Enable Slot 2': 25,
  'Enable Slot 3': 26,

  // slot fields
  'Base URL': 27,
  'vLLM endpoint URL, ending in /v1. Example: http://192.168.1.50:8000/v1': 28,
  'Model ID': 29,
  'Exact model id from vLLM /v1/models. Example: google/gemma-4-31B-it': 30,
  'Display Name': 31,
  'Human-friendly name shown in OpenClaw. Leave blank to use the last path segment of the Model ID.': 32,
  'Model Family': 33,
  'Picks sensible context-window and max-output-token defaults.': 34,
  'Context Window Override (optional)': 35,
  'Blank = use family default. Set if you launched vLLM with --max-model-len.': 36,
  'Max Output Tokens Override (optional)': 37,
  'Blank = use family default. Max tokens OpenClaw requests per completion.': 38,
  'API Key (optional)': 39,
  'Only needed if you launched vLLM with --api-key. Leave blank for open servers.': 40,
  'Reasoning Model': 41,
  'Enable if this model produces chain-of-thought / thinking tokens (e.g. Gemma 4, DeepSeek R1).': 42,

  // default model selector
  'Default Agent Model': 43,
  'Which enabled slot becomes OpenClaw\'s default agent model. Choose "None" to leave the current default alone.': 44,
  'None — do not change the current default': 45,

  // model family select values
  'Gemma 4 31B (262K context)': 46,
  'Gemma 4 26B MoE (262K context)': 47,
  'Nemotron 3 Super 120B (32K context)': 48,
  'Llama 3.x 70B / 8B (128K context)': 49,
  'Qwen 2.5 (128K context)': 50,
  'Qwen 3 (256K context)': 51,
  'Mistral Large / Nemo (128K context)': 52,
  'DeepSeek V3 / R1 (128K context)': 53,
  'GPT-OSS (128K context)': 54,
  'Custom (manual context window)': 55,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
