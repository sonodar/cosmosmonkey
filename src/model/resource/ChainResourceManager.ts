import { Resource, ResourceHandler, ResourceManager, ResourceType } from '.'
import { resourceToString } from './ResourceManager'

/**
 * ResourceManager のファーストクラスコレクション。
 * 自身も ResourceManager を実装する。
 */
export class ChainResourceManager implements ResourceManager<Resource> {
  public readonly supportedType = ResourceType.ALL_SUPPORTED
  private readonly managers = new Map<ResourceType, ResourceManager<Resource>>()

  constructor(...managers: ResourceManager<Resource>[]) {
    for (const manager of managers) this.addManager(manager)
  }

  public addManager(manager: ResourceManager<Resource>): void {
    this.managers.set(manager.supportedType, manager)
  }

  async eachResources(handler: ResourceHandler<Resource>): Promise<void> {
    const waiters: Promise<void>[] = []
    for (const manager of this.managers.values()) {
      console.info(`Search target ${manager.supportedType} resources`)
      const promise = manager.eachResources((resource: Resource) => {
        console.debug(`Target found, Resource = { ${resourceToString(resource)} }`)
        return handler(resource)
      })
      waiters.push(promise)
    }
    await Promise.all(waiters)
  }

  async start(resource: Resource): Promise<void> {
    const manager = this.managers.get(resource.type)
    if (!manager) {
      return console.warn(resource.type + ' is not supported type')
    }
    await manager.start(resource)
  }

  async stop(resource: Resource): Promise<void> {
    const manager = this.managers.get(resource.type)
    if (!manager) {
      return console.warn(resource.type + ' is not supported type')
    }
    await manager.stop(resource)
  }
}
