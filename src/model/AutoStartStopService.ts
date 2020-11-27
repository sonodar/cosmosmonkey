// type AutoStartStopService struct {
// 	manager resource.ResourceManager
// }
//
// func New(manager resource.ResourceManager) *AutoStartStopService {
// 	return &AutoStartStopService{manager: manager}
// }
//
// func (this *AutoStartStopService) Execute(date *time.Time) error {
// 	return this.manager.EachResources(
// 		func(target resource.Resource) error {
// 			if shouldBeStarted(target, date) {
// 				return this.manager.Start(target)
// 			}
// 			if shouldBeStopped(target, date) {
// 				return this.manager.Stop(target)
// 			}
// 			log.Printf("debug: Resource (%s) has nothing to do\n", resource.ToString(target))
// 			return nil
// 		},
// 	)
// }
//
// func shouldBeStarted(resource resource.Resource, date *time.Time) bool {
// 	return resource.CanStart() && resource.StartStopTime().ShouldBeStarted(date)
// }
//
// func shouldBeStopped(resource resource.Resource, date *time.Time) bool {
// 	return resource.CanStop() && resource.StartStopTime().ShouldBeStopped(date)
// }
import { Resource, ResourceManager } from './resource'
import {resourceToString} from './resource/ResourceManager'

export class AutoStartStopService {
	constructor(private readonly manager: ResourceManager<Resource>) {}

	execute(date: Date): Promise<void> {
		const resourceHandler = this.makeHandler(date)
		return this.manager.eachResources(resourceHandler)
	}

	private makeHandler(date: Date) {
		return async (resource: Resource): Promise<void> => {
			if (shouldBeStarted(resource, date)) {
				console.debug(`called start(${resourceToString(resource)})`)
				await this.manager.start(resource)
			} else if (shouldBeStopped(resource, date)) {
				console.debug(`called stop(${resourceToString(resource)})`)
				await this.manager.stop(resource)
			}
			console.debug(`Resource (${resourceToString(resource)}) has nothing to do`)
		}
	}
}

function shouldBeStarted(resource: Resource, date: Date): boolean {
	return resource.canStart && resource.startStopTime.shouldBeStarted(date)
}

function shouldBeStopped(resource: Resource, date: Date): boolean {
	return resource.canStop && resource.startStopTime.shouldBeStopped(date)
}
