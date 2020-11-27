// /**
//  * domain.ResourceManager のファーストクラスコレクション。
//  * 自身も domain.ResourceManager を実装する。
//  */
// type AllResourceManager struct {
//   managers map[string]service.ServiceManager
//   dryRun   bool
// }
//
// func (this *AllResourceManager) AddManager(manager service.ServiceManager) {
//   if this.managers == nil {
//     this.managers = map[string]service.ServiceManager{}
//   }
//   this.managers[manager.SupportedType()] = manager
// }
//
// func (this *AllResourceManager) EachResources(handler resource.ResourceHandler) error {
//   eg := errgroup.Group{}
//   for _, manager := range this.managers {
//     manager := manager
//     eg.Go(func() error {
//       return manager.EachResources(func(target resource.Resource) error {
//         util.Debugf("Target found, Resource = { %s }", resource.ToString(target))
//         return handler(target)
//       })
//     })
//   }
//   return eg.Wait()
// }
//
// func (this *AllResourceManager) Start(target resource.Resource) error {
//   if manager := this.managers[target.Type()]; manager == nil {
//     util.Warnf("%s is not supported type", target.Type())
//     return nil
//   } else {
//     if this.dryRun {
//       util.Infof("Called start operation for ", resource.ToString(target))
//       return nil
//     }
//     return manager.Start(target)
//   }
// }
//
// func (this *AllResourceManager) Stop(target resource.Resource) error {
//   if manager := this.managers[target.Type()]; manager == nil {
//     util.Warnf("%s is not supported type", target.Type())
//     return nil
//   } else {
//     if this.dryRun {
//       util.Infof("Called stop operation for ", resource.ToString(target))
//       return nil
//     }
//     return manager.Stop(target)
//   }
// }
import { Resource, ResourceHandler, ResourceManager, ResourceType } from './index'
import {resourceToString} from './ResourceManager'

export class ChainResourceManager implements ResourceManager<Resource> {
  public readonly supportedType = ResourceType.ALL_SUPPORTED
  private readonly _managers = new Map<ResourceType, ResourceManager<Resource>>()

  constructor(private readonly dryRun: boolean = false) {}

  public addManager(manager: ResourceManager<Resource>): void {
    this._managers.set(manager.supportedType, manager)
  }

  get managers(): ResourceManager<Resource>[] {
    return Object.values(this._managers)
  }

  async eachResources(handler: ResourceHandler<Resource>): Promise<void> {
    const waiters: Promise<void>[] = []
    for (const manager of this.managers) {
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
    const manager = this._managers.get(resource.type)
    if (!manager) {
      return console.warn(resource.type + ' is not supported type')
    }
    if (this.dryRun) {
      return console.info(`DRY RUN: Called start operation for ${resourceToString(resource)}`)
    }
    await manager.start(resource)
  }

  async stop(resource: Resource): Promise<void> {
    const manager = this._managers.get(resource.type)
    if (!manager) {
      return console.warn(resource.type + ' is not supported type')
    }
    if (this.dryRun) {
      return console.info(`DRY RUN: Called stop operation for ${resourceToString(resource)}`)
    }
    await manager.stop(resource)
  }
}
