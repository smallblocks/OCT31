import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * Zod schema for the subset of /data/.openclaw/openclaw.json that this
 * wrapper manages. `.catch()` defaults let us merge partial updates
 * without clobbering user-added sections and without failing on
 * older/newer OpenClaw fields.
 */

const authSchema = z.object({
  mode: z.literal('password').catch('password'),
  password: z.string().optional().catch(undefined),
})

const controlUiSchema = z.object({
  enabled: z.literal(true).catch(true),
  allowInsecureAuth: z.literal(true).catch(true),
  dangerouslyAllowHostHeaderOriginFallback: z.literal(true).catch(true),
  dangerouslyDisableDeviceAuth: z.literal(true).catch(true),
})

const gatewaySchema = z.object({
  auth: authSchema.catch(() => authSchema.parse({})),
  controlUi: controlUiSchema.catch(() => controlUiSchema.parse({})),
  trustedProxies: z.array(z.string()).optional().catch(undefined),
})

/**
 * `models` / `agents` are passthrough: we don't validate their shape
 * beyond "is an object", so we can write arbitrary vLLM/OpenAI-compat
 * provider configs without fighting Zod.
 */
const shape = z.object({
  gateway: gatewaySchema.catch(() => gatewaySchema.parse({})),
  models: z.record(z.string(), z.any()).optional().catch(undefined),
  agents: z.record(z.string(), z.any()).optional().catch(undefined),
})

export const openclawJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '.openclaw/openclaw.json' },
  shape,
)
