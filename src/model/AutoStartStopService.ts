import { Resource, ResourceManager } from './resource'
import { resourceToString } from './resource/ResourceManager'

/**
 * 処理のエントリポイントとなるクラス。
 */
export class AutoStartStopService {
  constructor(private readonly manager: ResourceManager<Resource>, private readonly dryRun = false) {}

  execute(date: Date): Promise<void> {
    const resourceHandler = this.makeHandler(date)
    return this.manager.eachResources(resourceHandler)
  }

  private makeHandler(date: Date) {
    return async (resource: Resource): Promise<void> => {
      if (shouldBeStarted(resource, date)) {
        await this.start(resource)
      } else if (shouldBeStopped(resource, date)) {
        await this.stop(resource)
      } else {
        console.debug(`Resource (${resourceToString(resource)}) has nothing to do`)
      }
    }
  }

  private async start(resource: Resource) {
    if (this.dryRun) {
      console.info(`DRY RUN: Called start operation for ${resourceToString(resource)}`)
    } else {
      console.debug(`called start(${resourceToString(resource)})`)
      await this.manager.start(resource)
    }
  }

  private async stop(resource: Resource) {
    if (this.dryRun) {
      console.info(`DRY RUN: Called stop operation for ${resourceToString(resource)}`)
    } else {
      console.debug(`called stop(${resourceToString(resource)})`)
      await this.manager.stop(resource)
    }
  }
}

function shouldBeStarted(resource: Resource, date: Date): boolean {
  return resource.canStart && resource.startStopTime.shouldBeStarted(date)
}

function shouldBeStopped(resource: Resource, date: Date): boolean {
  return resource.canStop && resource.startStopTime.shouldBeStopped(date)
}
