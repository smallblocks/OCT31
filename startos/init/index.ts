import { sdk } from '../sdk'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { seedFiles } from './seedFiles'
import { taskSetPassword } from './taskSetPassword'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  setInterfaces,
  setDependencies,
  actions,
  seedFiles,
  taskSetPassword,
)

export const uninit = sdk.setupUninit(versionGraph)
