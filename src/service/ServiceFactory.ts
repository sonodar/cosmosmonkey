package infra

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/rds"
	"github.com/sonodar/cosmosmonkey/domain"

	"github.com/sonodar/cosmosmonkey/infra/service"
)

type ServiceFactory struct {
	session *session.Session
	tagKey  string
}

func NewServiceFactory(region string, tagKey string) *ServiceFactory {
	awsSession := session.Must(session.NewSession(aws.NewConfig().WithRegion(region)))
	return &ServiceFactory{session: awsSession, tagKey: tagKey}
}

func (this *ServiceFactory) CreateStartStopService(dryRun bool) *domain.AutoStartStopService {
	rdsClient := rds.New(this.session)

	manager := &AllResourceManager{dryRun: dryRun}

	// 各サービスごとの実装を追加する
	manager.AddManager(service.NewEC2InstanceManager(this.session, this.tagKey))
	manager.AddManager(service.NewDBInstanceManager(rdsClient, this.tagKey))
	manager.AddManager(service.NewAutoScalingManager(this.session, this.tagKey))
	manager.AddManager(service.NewDBClusterManager(rdsClient, this.tagKey))

	return domain.New(manager)
}
