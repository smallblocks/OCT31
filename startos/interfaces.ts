import { i18n } from './i18n'
import { sdk } from './sdk'
import { gatewayPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  // OpenClaw exposes the Control UI, RPC, channel webhooks, and node bridge
  // all on the same port. The Control UI's own login form handles auth via
  // the password set through the Set Password action — no URL-embedded
  // credentials needed, so we leave the interface unmasked and the user
  // can just click the link in the StartOS UI.
  const uiMulti = sdk.MultiHost.of(effects, 'ui-multi')
  const uiOrigin = await uiMulti.bindPort(gatewayPort, {
    protocol: 'http',
  })
  const ui = sdk.createInterface(effects, {
    name: i18n('Web UI'),
    id: 'ui',
    description: i18n(
      'OpenClaw Gateway Control UI — sessions, channels, tools, and skills.',
    ),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const uiReceipt = await uiOrigin.export([ui])

  return [uiReceipt]
})
