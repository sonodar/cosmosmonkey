import { Resource, ResourceHandler, ResourceManager, ResourceType } from '.'
import { resourceToString } from './ResourceManager'

/**
 * ResourceManager のファーストクラスコレクション。
 * 自身も ResourceManager を実装する。
 */
export class ChainResourceManager implements ResourceManager<Resource> {
  public readonly supportedType = ResourceType.ALL_SUPPORTED
  private readonly _managers = new Map<ResourceType, ResourceManager<Resource>>()

  constructor(...managers: ResourceManager<Resource>[]) {
    for (const manager of managers) this.addManager(manager)
  }

  public addManager(manager: ResourceManager<Resource>): void {
    this._managers.set(manager.supportedType, manager)
  }

  get managers(): ResourceManager<Resource>[] {
    return Array.from(this._managers.values())
  }

  async eachResources(handler: ResourceHandler<Resource>): Promise<void> {
    const mapper = createEachResourcesForManagerHandler(handler)
    await Promise.all(this.managers.map(mapper))
  }

  async start(resource: Resource): Promise<void> {
    const manager = this._managers.get(resource.type)
    if (!manager) {
      return console.warn(resource.type + ' is not supported type')
    }
    await manager.start(resource)
  }

  async stop(resource: Resource): Promise<void> {
    const manager = this._managers.get(resource.type)
    if (!manager) {
      return console.warn(resource.type + ' is not supported type')
    }
    await manager.stop(resource)
  }
}

function createEachResourcesForManagerHandler(handler: ResourceHandler<Resource>) {
  return async (manager: ResourceManager<Resource>) => {
    console.info(`Search target ${manager.supportedType} resources`)
    await manager.eachResources((resource: Resource) => {
      console.debug(`Target found, Resource = { ${resourceToString(resource)} }`)
      return handler(resource)
    })
  }
}
