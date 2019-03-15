package domain

import (
	"log"
	"time"

	"github.com/sonodar/cosmosmonkey/domain/resource"
)

type AutoStartStopService struct {
	manager resource.ResourceManager
}

func New(manager resource.ResourceManager) *AutoStartStopService {
	return &AutoStartStopService{manager: manager}
}

func (this *AutoStartStopService) Execute(date *time.Time) error {
	return this.manager.EachResources(
		func(target resource.Resource) error {
			if shouldBeStarted(target, date) {
				return this.manager.Start(target)
			}
			if shouldBeStopped(target, date) {
				return this.manager.Stop(target)
			}
			log.Printf("debug: Resource (%s) has nothing to do\n", resource.ToString(target))
			return nil
		},
	)
}

func shouldBeStarted(resource resource.Resource, date *time.Time) bool {
	return resource.CanStart() && resource.StartStopTime().ShouldBeStarted(date)
}

func shouldBeStopped(resource resource.Resource, date *time.Time) bool {
	return resource.CanStop() && resource.StartStopTime().ShouldBeStopped(date)
}
