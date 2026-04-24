import { i18n } from '../i18n'
import { openclawJson } from '../fileModels/openclaw.json'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

/**
 * Preset "model family" selections. Each one carries sensible context-window
 * and max-output defaults that match what the model was trained with. The
 * user can still override them.
 *
 * These are not model IDs — the user supplies the exact vLLM model id
 * separately. This is just to pick reasonable defaults for
 * contextWindow / maxTokens.
 */
const modelFamilies = {
  'llama-3-70b': i18n('Llama 3.x 70B / 8B (128K context)'),
  'qwen-2-5': i18n('Qwen 2.5 (128K context)'),
  'qwen-3': i18n('Qwen 3 (256K context)'),
  'mistral-large': i18n('Mistral Large / Nemo (128K context)'),
  'deepseek-v3': i18n('DeepSeek V3 / R1 (128K context)'),
  'gpt-oss': i18n('GPT-OSS (128K context)'),
  custom: i18n('Custom (manual context window)'),
} as const

type FamilyKey = keyof typeof modelFamilies

const familyDefaults: Record<
  FamilyKey,
  { contextWindow: number; maxTokens: number }
> = {
  'llama-3-70b': { contextWindow: 131072, maxTokens: 8192 },
  'qwen-2-5': { contextWindow: 131072, maxTokens: 16384 },
  'qwen-3': { contextWindow: 262144, maxTokens: 16384 },
  'mistral-large': { contextWindow: 131072, maxTokens: 8192 },
  'deepseek-v3': { contextWindow: 131072, maxTokens: 8192 },
  'gpt-oss': { contextWindow: 131072, maxTokens: 16384 },
  custom: { contextWindow: 32768, maxTokens: 4096 },
}

const inputSpec = InputSpec.of({
  baseUrl: Value.text({
    name: i18n('vLLM Base URL'),
    description: i18n(
      'Full URL to your vLLM server, ending in /v1. Example: http://192.168.1.50:8000/v1',
    ),
    required: true,
    default: null,
    placeholder: 'http://192.168.1.50:8000/v1',
    masked: false,
  }),
  modelId: Value.text({
    name: i18n('Model ID'),
    description: i18n(
      'The exact model id served by vLLM, as returned by /v1/models. Example: meta-llama/Llama-3.3-70B-Instruct',
    ),
    required: true,
    default: null,
    placeholder: 'meta-llama/Llama-3.3-70B-Instruct',
    masked: false,
  }),
  modelFamily: Value.select({
    name: i18n('Model Family'),
    description: i18n(
      'Used to pick sensible context-window and max-output-token defaults. Pick the family of your model, or Custom to set them manually.',
    ),
    default: 'llama-3-70b',
    values: modelFamilies,
  }),
  contextWindowOverride: Value.number({
    name: i18n('Context Window Override (optional)'),
    description: i18n(
      'Leave blank to use the default for the selected family. Set this if you launched vLLM with --max-model-len.',
    ),
    required: false,
    default: null,
    min: 1024,
    max: 1_000_000,
    integer: true,
    step: 1024,
  }),
  maxTokensOverride: Value.number({
    name: i18n('Max Output Tokens Override (optional)'),
    description: i18n(
      'Leave blank to use the default for the selected family. Max tokens OpenClaw will request per completion.',
    ),
    required: false,
    default: null,
    min: 256,
    max: 200000,
    integer: true,
    step: 256,
  }),
  apiKey: Value.text({
    name: i18n('API Key (optional)'),
    description: i18n(
      'Only needed if you launched vLLM with --api-key. Leave blank for an open LAN server.',
    ),
    required: false,
    default: null,
    masked: true,
  }),
  setAsDefault: Value.toggle({
    name: i18n('Use as Default Agent Model'),
    description: i18n(
      'Set this provider/model as the default agent model, replacing whatever is currently configured.',
    ),
    default: true,
  }),
})

export const configureLanModel = sdk.Action.withInput(
  'configure-lan-model',

  async () => ({
    name: i18n('Configure LAN Model (vLLM)'),
    description: i18n(
      'Register a vLLM server on your local network as an OpenClaw model provider',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  // Prefill the form from existing config if we've configured this before.
  async ({ effects }) => {
    const existing = await openclawJson
      .read((c) => c.models?.providers?.['lan-vllm'])
      .const(effects)

    if (!existing) {
      // First-time configuration — defaults come from the InputSpec.
      return null
    }

    const first = existing.models?.[0]
    return {
      baseUrl: existing.baseUrl ?? '',
      modelId: first?.id ?? '',
      modelFamily: 'custom' as const,
      contextWindowOverride: first?.contextWindow ?? null,
      maxTokensOverride: first?.maxTokens ?? null,
      apiKey: typeof existing.apiKey === 'string' ? existing.apiKey : '',
      setAsDefault: false,
    }
  },

  async ({ effects, input }) => {
    const fam = familyDefaults[input.modelFamily as FamilyKey]
    const contextWindow = input.contextWindowOverride ?? fam.contextWindow
    const maxTokens = input.maxTokensOverride ?? fam.maxTokens

    // Normalize the base URL: strip trailing slashes, ensure /v1 suffix.
    let baseUrl = input.baseUrl.trim().replace(/\/+$/, '')
    if (!/\/v\d+$/.test(baseUrl)) {
      baseUrl = baseUrl + '/v1'
    }

    const providerConfig = {
      baseUrl,
      api: 'openai-completions' as const,
      // OpenClaw's OpenAI-compat client sends Authorization: Bearer <key>
      // even for open vLLM servers. A placeholder works because vLLM
      // without --api-key ignores the header entirely.
      apiKey: input.apiKey && input.apiKey.length > 0 ? input.apiKey : 'not-needed',
      models: [
        {
          id: input.modelId,
          name: input.modelId.split('/').slice(-1)[0] || input.modelId,
          api: 'openai-completions' as const,
          reasoning: false,
          input: ['text'] as Array<'text' | 'image'>,
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
          contextWindow,
          maxTokens,
        },
      ],
    }

    // Merge: keep the user's other providers (e.g. if they also set
    // Anthropic creds through another action), just add/replace lan-vllm.
    const currentProviders =
      (await openclawJson
        .read((c) => c.models?.providers)
        .const(effects)) ?? {}

    const newProviders = {
      ...currentProviders,
      'lan-vllm': providerConfig,
    }

    const patch: Record<string, unknown> = {
      models: {
        mode: 'merge',
        providers: newProviders,
      },
    }

    if (input.setAsDefault) {
      patch.agents = {
        defaults: {
          model: `lan-vllm/${input.modelId}`,
        },
      }
    }

    await openclawJson.merge(effects, patch as never)

    return {
      version: '1' as const,
      title: i18n('LAN Model Configured'),
      message: input.setAsDefault
        ? i18n(
            'Your vLLM server is registered and set as the default agent model. Restart OpenClaw for changes to take effect.',
          )
        : i18n(
            'Your vLLM server is registered as a provider. Restart OpenClaw and select it in the Control UI for specific sessions.',
          ),
      result: null,
    }
  },
)
