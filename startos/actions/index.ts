import { sdk } from '../sdk'
import { regenerateGatewayToken } from './regenerateGatewayToken'
import { showGatewayToken } from './showGatewayToken'

export const actions = sdk.Actions.of()
  .addAction(showGatewayToken)
  .addAction(regenerateGatewayToken)
