import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * Wrapper-managed state persisted across restarts and backed up with the
 * `main` volume. The gateway token is auto-generated on first start (see
 * `init/index.ts`) and surfaced to the user via the `Show Gateway Token`
 * action. It is also injected into OpenClaw at runtime as the
 * `OPENCLAW_GATEWAY_TOKEN` environment variable.
 */
const shape = z.object({
  gatewayToken: z.string().optional().catch(undefined),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'store.json' },
  shape,
)
