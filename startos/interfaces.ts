import { i18n } from './i18n'
import { sdk } from './sdk'
import { bridgePort, gatewayPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  // -- Gateway / Control UI ------------------------------------------------
  // OpenClaw exposes the Control UI, RPC, and channel webhooks all on
  // port 18789. It is masked because access requires the auth token,
  // which the user retrieves via the "Show Gateway Token" action.
  const uiMulti = sdk.MultiHost.of(effects, 'ui-multi')
  const uiOrigin = await uiMulti.bindPort(gatewayPort, {
    protocol: 'http',
  })
  const ui = sdk.createInterface(effects, {
    name: i18n('Control UI'),
    id: 'ui',
    description: i18n(
      'Web interface for managing OpenClaw — sessions, channels, tools, and skills.',
    ),
    type: 'ui',
    masked: true,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const uiReceipt = await uiOrigin.export([ui])

  // -- Bridge / WebSocket --------------------------------------------------
  // Companion apps (macOS / iOS / Android nodes) pair to the gateway over
  // a WebSocket on this port. Exposed as an `api` interface — no browser UI.
  const bridgeMulti = sdk.MultiHost.of(effects, 'bridge-multi')
  const bridgeOrigin = await bridgeMulti.bindPort(bridgePort, {
    protocol: 'http',
  })
  const bridge = sdk.createInterface(effects, {
    name: i18n('Bridge'),
    id: 'bridge',
    description: i18n(
      'WebSocket bridge for OpenClaw companion apps (macOS / iOS / Android nodes).',
    ),
    type: 'api',
    masked: true,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const bridgeReceipt = await bridgeOrigin.export([bridge])

  return [uiReceipt, bridgeReceipt]
})
