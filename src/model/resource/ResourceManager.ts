import { Resource } from './Resource'
import { ResourceType } from './ResourceType'

export type ResourceHandler<T extends Resource> = (resource: T) => void

/**
 * リソースの検索、起動、停止を行うドメインオブジェクトのインターフェース。
 */
export interface ResourceManager<T extends Resource> {
  supportedType: ResourceType
  /** 起動・停止対象となるリソースに対して処理を行う */
  eachResources(handler: ResourceHandler<T>): Promise<void>
  /** 当該サービスリソースを起動する。起動方法はサービスによって様々。 */
  start(resource: T): Promise<void>
  /** 当該サービスリソースを停止する。停止方法はサービスによって様々。 */
  stop(resource: T): Promise<void>
}

export function resourceToString(resource: Resource): string {
  return `type = ${resource.type}, id = ${resource.id}, name = ${resource.name}, ${resource.startStopTime.toString()}`
}
