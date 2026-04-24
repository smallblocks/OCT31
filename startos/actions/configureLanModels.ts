import { i18n } from '../i18n'
import { openclawJson } from '../fileModels/openclaw.json'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

/**
 * Multi-slot LAN model configuration.
 *
 * StartOS InputSpecs have no dynamic lists, so we expose three named
 * slots — enough for typical home GPU setups (primary + secondary +
 * experimental). Each slot maps to an OpenClaw provider key:
 *
 *   Slot 1 -> lan-model-1
 *   Slot 2 -> lan-model-2
 *   Slot 3 -> lan-model-3
 *
 * Disabled slots are removed from openclaw.json entirely. Non lan-model-*
 * providers (cloud credentials set via Control UI) are preserved.
 *
 * Migration: if openclaw.json still has the old `lan-vllm` key from the
 * single-model action, we read it as slot 1's prefill and drop it on
 * save.
 */

const modelFamilies = {
  'gemma-4-31b': i18n('Gemma 4 31B (262K context)'),
  'gemma-4-26b-moe': i18n('Gemma 4 26B MoE (262K context)'),
  'nemotron-120b': i18n('Nemotron 3 Super 120B (32K context)'),
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
  'gemma-4-31b': { contextWindow: 262144, maxTokens: 8192 },
  'gemma-4-26b-moe': { contextWindow: 262144, maxTokens: 8192 },
  'nemotron-120b': { contextWindow: 32768, maxTokens: 8192 },
  'llama-3-70b': { contextWindow: 131072, maxTokens: 8192 },
  'qwen-2-5': { contextWindow: 131072, maxTokens: 16384 },
  'qwen-3': { contextWindow: 262144, maxTokens: 16384 },
  'mistral-large': { contextWindow: 131072, maxTokens: 8192 },
  'deepseek-v3': { contextWindow: 131072, maxTokens: 8192 },
  'gpt-oss': { contextWindow: 131072, maxTokens: 16384 },
  custom: { contextWindow: 32768, maxTokens: 4096 },
}

const defaultModelChoices = {
  none: i18n('None — do not change the current default'),
  'slot-1': i18n('Slot 1'),
  'slot-2': i18n('Slot 2'),
  'slot-3': i18n('Slot 3'),
} as const

const slotFields = () =>
  ({
    baseUrl: Value.text({
      name: i18n('Base URL'),
      description: i18n(
        'vLLM endpoint URL, ending in /v1. Example: http://192.168.1.50:8000/v1',
      ),
      required: false,
      default: null,
      placeholder: 'http://192.168.1.50:8000/v1',
      masked: false,
    }),
    modelId: Value.text({
      name: i18n('Model ID'),
      description: i18n(
        'Exact model id from vLLM /v1/models. Example: google/gemma-4-31B-it',
      ),
      required: false,
      default: null,
      placeholder: 'google/gemma-4-31B-it',
      masked: false,
    }),
    displayName: Value.text({
      name: i18n('Display Name'),
      description: i18n(
        'Human-friendly name shown in OpenClaw. Leave blank to use the last path segment of the Model ID.',
      ),
      required: false,
      default: null,
      masked: false,
    }),
    modelFamily: Value.select({
      name: i18n('Model Family'),
      description: i18n(
        'Picks sensible context-window and max-output-token defaults.',
      ),
      default: 'custom',
      values: modelFamilies,
    }),
    contextWindowOverride: Value.number({
      name: i18n('Context Window Override (optional)'),
      description: i18n(
        'Blank = use family default. Set if you launched vLLM with --max-model-len.',
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
        'Blank = use family default. Max tokens OpenClaw requests per completion.',
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
        'Only needed if you launched vLLM with --api-key. Leave blank for open servers.',
      ),
      required: false,
      default: null,
      masked: true,
    }),
    reasoning: Value.toggle({
      name: i18n('Reasoning Model'),
      description: i18n(
        'Enable if this model produces chain-of-thought / thinking tokens (e.g. Gemma 4, DeepSeek R1).',
      ),
      default: false,
    }),
  }) as const

const slot1Fields = InputSpec.of({
  enabled: Value.toggle({
    name: i18n('Enable Slot 1'),
    description: null,
    default: false,
  }),
  ...slotFields(),
})

const slot2Fields = InputSpec.of({
  enabled: Value.toggle({
    name: i18n('Enable Slot 2'),
    description: null,
    default: false,
  }),
  ...slotFields(),
})

const slot3Fields = InputSpec.of({
  enabled: Value.toggle({
    name: i18n('Enable Slot 3'),
    description: null,
    default: false,
  }),
  ...slotFields(),
})

const inputSpec = InputSpec.of({
  slot1: Value.object(
    {
      name: i18n('Slot 1'),
      description: null,
    },
    slot1Fields,
  ),
  slot2: Value.object(
    {
      name: i18n('Slot 2'),
      description: null,
    },
    slot2Fields,
  ),
  slot3: Value.object(
    {
      name: i18n('Slot 3'),
      description: null,
    },
    slot3Fields,
  ),
  defaultModel: Value.select({
    name: i18n('Default Agent Model'),
    description: i18n(
      'Which enabled slot becomes OpenClaw\'s default agent model. Choose "None" to leave the current default alone.',
    ),
    default: 'none',
    values: defaultModelChoices,
  }),
})

type SlotInput = {
  enabled: boolean
  baseUrl: string | null
  modelId: string | null
  displayName: string | null
  modelFamily: FamilyKey | string
  contextWindowOverride: number | null
  maxTokensOverride: number | null
  apiKey: string | null
  reasoning: boolean
}

function normalizeBaseUrl(url: string): string {
  let u = url.trim().replace(/\/+$/, '')
  if (!/\/v\d+$/.test(u)) u = u + '/v1'
  return u
}

function providerFromSlot(
  slot: SlotInput,
): Record<string, unknown> | null {
  if (!slot.enabled) return null
  if (!slot.baseUrl || !slot.modelId) return null

  const famKey =
    (slot.modelFamily as FamilyKey) in familyDefaults
      ? (slot.modelFamily as FamilyKey)
      : ('custom' as FamilyKey)
  const fam = familyDefaults[famKey]
  const contextWindow = slot.contextWindowOverride ?? fam.contextWindow
  const maxTokens = slot.maxTokensOverride ?? fam.maxTokens
  const displayName =
    slot.displayName && slot.displayName.trim().length > 0
      ? slot.displayName.trim()
      : slot.modelId.split('/').slice(-1)[0] || slot.modelId

  return {
    baseUrl: normalizeBaseUrl(slot.baseUrl),
    api: 'openai-completions',
    apiKey:
      slot.apiKey && slot.apiKey.length > 0 ? slot.apiKey : 'not-needed',
    models: [
      {
        id: slot.modelId,
        name: displayName,
        api: 'openai-completions',
        reasoning: !!slot.reasoning,
        input: ['text'],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow,
        maxTokens,
      },
    ],
  }
}

type RawProvider = {
  baseUrl?: unknown
  apiKey?: unknown
  models?: Array<{
    id?: unknown
    contextWindow?: unknown
    maxTokens?: unknown
    reasoning?: unknown
    name?: unknown
  }>
}

function slotFromProvider(p: RawProvider | undefined): Partial<SlotInput> {
  if (!p) return { enabled: false }
  const first = Array.isArray(p.models) ? p.models[0] : undefined
  return {
    enabled: true,
    baseUrl: typeof p.baseUrl === 'string' ? p.baseUrl : null,
    modelId: first && typeof first.id === 'string' ? first.id : null,
    displayName: first && typeof first.name === 'string' ? first.name : null,
    modelFamily: 'custom',
    contextWindowOverride:
      first && typeof first.contextWindow === 'number'
        ? first.contextWindow
        : null,
    maxTokensOverride:
      first && typeof first.maxTokens === 'number' ? first.maxTokens : null,
    apiKey: typeof p.apiKey === 'string' ? p.apiKey : null,
    reasoning: !!(first && first.reasoning),
  }
}

export const configureLanModels = sdk.Action.withInput(
  'configure-lan-models',

  async () => ({
    name: i18n('Configure LAN Models'),
    description: i18n(
      'Register up to three vLLM (OpenAI-compatible) servers on your LAN as model providers. Each slot becomes a separate provider in OpenClaw.',
    ),
    warning: i18n(
      'Your vLLM server must be launched with tool-calling flags for OpenClaw agents to work. For Gemma 4: --enable-auto-tool-choice --tool-call-parser gemma4 --reasoning-parser gemma4 --chat-template examples/tool_chat_template_gemma4.jinja. For Qwen 2.5/3: --enable-auto-tool-choice --tool-call-parser hermes. For Llama 3.x: --enable-auto-tool-choice --tool-call-parser llama3_json.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const providers =
      ((await openclawJson
        .read((c) => c.models?.providers)
        .const(effects)) as Record<string, RawProvider> | undefined) ?? {}

    // Migration: treat legacy lan-vllm as slot 1 if no lan-model-1 yet.
    const slot1Source = providers['lan-model-1'] ?? providers['lan-vllm']
    const slot2Source = providers['lan-model-2']
    const slot3Source = providers['lan-model-3']

    const buildSlot = (src: RawProvider | undefined) => {
      const s = slotFromProvider(src)
      return {
        enabled: s.enabled ?? false,
        baseUrl: s.baseUrl ?? '',
        modelId: s.modelId ?? '',
        displayName: s.displayName ?? '',
        modelFamily: (s.modelFamily ?? 'custom') as FamilyKey,
        contextWindowOverride: s.contextWindowOverride ?? null,
        maxTokensOverride: s.maxTokensOverride ?? null,
        apiKey: s.apiKey ?? '',
        reasoning: s.reasoning ?? false,
      }
    }

    return {
      slot1: buildSlot(slot1Source),
      slot2: buildSlot(slot2Source),
      slot3: buildSlot(slot3Source),
      defaultModel: 'none' as const,
    }
  },

  async ({ effects, input }) => {
    // Start from existing providers so cloud credentials survive.
    const existing =
      ((await openclawJson
        .read((c) => c.models?.providers)
        .const(effects)) as Record<string, unknown> | undefined) ?? {}

    const nextProviders: Record<string, unknown> = { ...existing }

    // Drop any managed keys up front so disabled slots really disappear,
    // and so migration removes the legacy key.
    delete nextProviders['lan-model-1']
    delete nextProviders['lan-model-2']
    delete nextProviders['lan-model-3']
    delete nextProviders['lan-vllm']

    const slotInputs = [
      { key: 'lan-model-1', data: input.slot1 as SlotInput, choice: 'slot-1' },
      { key: 'lan-model-2', data: input.slot2 as SlotInput, choice: 'slot-2' },
      { key: 'lan-model-3', data: input.slot3 as SlotInput, choice: 'slot-3' },
    ] as const

    const summary: string[] = []
    const slotToModelRef: Record<string, string> = {}

    for (const { key, data, choice } of slotInputs) {
      const provider = providerFromSlot(data)
      if (!provider) continue
      nextProviders[key] = provider
      const modelId = (data.modelId ?? '').trim()
      if (modelId) {
        slotToModelRef[choice] = `${key}/${modelId}`
        summary.push(`${key} → ${modelId}`)
      }
    }

    const patch: Record<string, unknown> = {
      models: {
        mode: 'merge',
        providers: nextProviders,
      },
    }

    // Agent default: only touch if user explicitly picked a slot.
    if (input.defaultModel !== 'none') {
      const ref = slotToModelRef[input.defaultModel]
      if (!ref) {
        throw new Error(
          `Default model is set to ${input.defaultModel}, but that slot is not enabled or is missing a Model ID.`,
        )
      }
      patch.agents = { defaults: { model: ref } }
    } else {
      // Migration: if the old default pointed at lan-vllm/... and we just
      // dropped lan-vllm, rewrite it to lan-model-1/... so the gateway
      // doesn't boot with a dangling default.
      const currentDefault = (await openclawJson
        .read((c) => c.agents?.defaults?.model)
        .const(effects)) as string | undefined
      if (
        typeof currentDefault === 'string' &&
        currentDefault.startsWith('lan-vllm/') &&
        nextProviders['lan-model-1']
      ) {
        const rewritten = currentDefault.replace(
          /^lan-vllm\//,
          'lan-model-1/',
        )
        patch.agents = { defaults: { model: rewritten } }
      }
    }

    await openclawJson.merge(effects, patch as never)

    const enabledCount = summary.length
    const message =
      enabledCount === 0
        ? i18n(
            'No enabled slots. All lan-model-* providers have been removed from OpenClaw.',
          )
        : i18n(
            'LAN model providers saved. Restart OpenClaw for changes to take effect.',
          )

    return {
      version: '1' as const,
      title: i18n('LAN Models Configured'),
      message,
      result: null,
    }
  },
)
