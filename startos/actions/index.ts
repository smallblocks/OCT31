import { sdk } from '../sdk'
import { configureLanModel } from './configureLanModel'
import { setPassword } from './setPassword'

export const actions = sdk.Actions.of()
  .addAction(setPassword)
  .addAction(configureLanModel)
