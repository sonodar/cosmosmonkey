import { RDS } from 'aws-sdk'
import { Resource, ResourceType, StartStopTime } from '../../../model'

export class RDSClusterResource implements Resource {
  public readonly type = ResourceType.RDS_CLUSTER
  public readonly id: string
  private readonly status: string

  constructor(cluster: RDS.DBCluster, public readonly startStopTime: StartStopTime) {
    this.id = cluster.DBClusterIdentifier || ''
    this.status = cluster.Status || ''
  }

  get name(): string {
    return this.id
  }

  get canStart(): boolean {
    return this.status === 'stopped'
  }

  get canStop(): boolean {
    return this.status === 'available'
  }
}
