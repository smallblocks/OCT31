Use the `/fileModels` directory to create separate `.ts` files representing files used by the package.

The `store.json` file model persists the wrapper-managed gateway authentication token across service restarts. It is generated on first install (see `init/seedFiles.ts`), surfaced to the user via the `Show Gateway Token` action, and injected into OpenClaw at runtime as the `OPENCLAW_GATEWAY_TOKEN` env var.
