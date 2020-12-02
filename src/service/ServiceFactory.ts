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

    const ec2Instance = new EC2InstanceResourceManager(new EC2(options), this.tagName)
    const autoScaling = new EC2AutoScalingResourceManager(new AutoScaling(options), this.tagName)

    const rds = new RDS(options)
    const rdsInstance = new RDSClusterResourceManager(rds, this.tagName)
    const auroraCluster = new RDSInstanceResourceManager(rds, this.tagName)

    const manager = new ChainResourceManager(ec2Instance, autoScaling, rdsInstance, auroraCluster)

    return new AutoStartStopService(manager, dryRun)
  }
}
