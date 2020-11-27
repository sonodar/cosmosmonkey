import { EC2, AutoScaling, RDS } from 'aws-sdk'
import { ChainResourceManager, AutoStartStopService } from '../model'
import { EC2Client, EC2InstanceResourceManager } from './ec2/instance'
import { AutoScalingClient, EC2AutoScalingResourceManager } from './ec2/autoscaling'
import { RDSClusterClient, RDSClusterResourceManager } from './rds/cluster'
import { RDSInstanceClient, RDSInstanceResourceManager } from './rds/instance'

export class ServiceFactory {
  public options: { region: string }
  public ec2: EC2Client
  public autoscaling: AutoScalingClient
  public rds: RDSInstanceClient
  public aurora: RDSClusterClient

  constructor(private readonly region: string, private readonly tagName: string) {
    this.options = { region: this.region }
    this.ec2 = new EC2(this.options)
    this.autoscaling = new AutoScaling(this.options)
    this.rds = new RDS(this.options)
    this.aurora = new RDS(this.options)
  }

  createStartStopService(dryRun = false): AutoStartStopService {
    const ec2Instance = new EC2InstanceResourceManager(this.ec2, this.tagName)
    const autoScaling = new EC2AutoScalingResourceManager(this.autoscaling, this.tagName)
    const rdsInstance = new RDSInstanceResourceManager(this.rds, this.tagName)
    const auroraCluster = new RDSClusterResourceManager(this.aurora, this.tagName)

    const manager = new ChainResourceManager(ec2Instance, autoScaling, rdsInstance, auroraCluster)

    return new AutoStartStopService(manager, dryRun)
  }
}
