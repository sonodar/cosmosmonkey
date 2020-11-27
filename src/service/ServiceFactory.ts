// type ServiceFactory struct {
// 	session *session.Session
// 	tagKey  string
// }
//
// func NewServiceFactory(region string, tagKey string) *ServiceFactory {
// 	awsSession := session.Must(session.NewSession(aws.NewConfig().WithRegion(region)))
// 	return &ServiceFactory{session: awsSession, tagKey: tagKey}
// }
//
// func (this *ServiceFactory) CreateStartStopService(dryRun bool) *domain.AutoStartStopService {
// 	rdsClient := rds.New(this.session)
//
// 	manager := &AllResourceManager{dryRun: dryRun}
//
// 	// 各サービスごとの実装を追加する
// 	manager.AddManager(service.NewEC2InstanceManager(this.session, this.tagKey))
// 	manager.AddManager(service.NewDBInstanceManager(rdsClient, this.tagKey))
// 	manager.AddManager(service.NewAutoScalingManager(this.session, this.tagKey))
// 	manager.AddManager(service.NewDBClusterManager(rdsClient, this.tagKey))
//
// 	return domain.New(manager)
// }
import { EC2, AutoScaling, RDS } from 'aws-sdk'
import { ChainResourceManager } from 'models'
import { AutoStartStopService } from 'models'
import { EC2InstanceResourceManager } from './ec2/instance'
import { EC2AutoScalingResourceManager } from './ec2/autoscaling'
import { RDSClusterResourceManager } from './rds/cluster'
import { RDSInstanceResourceManager } from './rds/instance'

export class ServiceFactory {
	constructor(private readonly region: string, private readonly tagName: string) {}

	createStartStopService(dryRun = false): AutoStartStopService {
		const options = { region: this.region }

		const manager = new ChainResourceManager(dryRun)

		manager.addManager(new EC2InstanceResourceManager(new EC2(options), this.tagName))
		manager.addManager(new EC2AutoScalingResourceManager(new AutoScaling(options), this.tagName))

		const rds = new RDS(options)
		manager.addManager(new RDSClusterResourceManager(rds, this.tagName))
		manager.addManager(new RDSInstanceResourceManager(rds, this.tagName))

		return new AutoStartStopService(manager)
	}
}
