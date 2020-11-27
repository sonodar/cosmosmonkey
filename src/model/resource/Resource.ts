import { ResourceType } from './ResourceType'
import { StartStopTime } from '../time'

/**
 * リソースを表すエンティティのインターフェース。
 */
export interface Resource {
  type: ResourceType
  id: string
  name: string
  startStopTime: StartStopTime
  canStart: boolean
  canStop: boolean
}
