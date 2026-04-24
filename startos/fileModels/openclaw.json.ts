import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * Zod schema for the subset of /data/.openclaw/openclaw.json that this
 * wrapper manages. `.catch()` defaults let us merge partial updates
 * without clobbering user-added sections (channel credentials, model
 * settings, etc.) and without failing on older/newer OpenClaw fields.
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

const shape = z.object({
  gateway: gatewaySchema.catch(() => gatewaySchema.parse({})),
})

export const openclawJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '.openclaw/openclaw.json' },
  shape,
)
