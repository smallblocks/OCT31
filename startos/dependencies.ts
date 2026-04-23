import { sdk } from './sdk'

// OpenClaw is self-contained — no other StartOS services required.
// Users supply their own model API keys (OpenAI, Anthropic, etc.) and channel
// credentials through the OpenClaw onboarding wizard or by editing
// ~/.openclaw/openclaw.json directly.
export const setDependencies = sdk.setupDependencies(
  async ({ effects }) => ({}),
)
