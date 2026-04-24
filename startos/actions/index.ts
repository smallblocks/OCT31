import { sdk } from '../sdk'
import { configureLanModels } from './configureLanModels'
import { setPassword } from './setPassword'

export const actions = sdk.Actions.of()
  .addAction(setPassword)
  .addAction(configureLanModels)
