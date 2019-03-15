package infra

import (
	"golang.org/x/sync/errgroup"

	"github.com/sonodar/cosmosmonkey/domain/resource"
	"github.com/sonodar/cosmosmonkey/infra/service"
	"github.com/sonodar/cosmosmonkey/infra/util"
)

/**
 * domain.ResourceManager のファーストクラスコレクション。
 * 自身も domain.ResourceManager を実装する。
 */
type AllResourceManager struct {
	managers map[string]service.ServiceManager
	dryRun   bool
}

func (this *AllResourceManager) AddManager(manager service.ServiceManager) {
	if this.managers == nil {
		this.managers = map[string]service.ServiceManager{}
	}
	this.managers[manager.SupportedType()] = manager
}

func (this *AllResourceManager) EachResources(handler resource.ResourceHandler) error {
	eg := errgroup.Group{}
	for _, manager := range this.managers {
		manager := manager
		eg.Go(func() error {
			return manager.EachResources(func(target resource.Resource) error {
				util.Debugf("Target found, Resource = { %s }", resource.ToString(target))
				return handler(target)
			})
		})
	}
	return eg.Wait()
}

func (this *AllResourceManager) Start(target resource.Resource) error {
	if manager := this.managers[target.Type()]; manager == nil {
		util.Warnf("%s is not supported type", target.Type())
		return nil
	} else {
		if this.dryRun {
			util.Infof("Called start operation for ", resource.ToString(target))
			return nil
		}
		return manager.Start(target)
	}
}

func (this *AllResourceManager) Stop(target resource.Resource) error {
	if manager := this.managers[target.Type()]; manager == nil {
		util.Warnf("%s is not supported type", target.Type())
		return nil
	} else {
		if this.dryRun {
			util.Infof("Called stop operation for ", resource.ToString(target))
			return nil
		}
		return manager.Stop(target)
	}
}
