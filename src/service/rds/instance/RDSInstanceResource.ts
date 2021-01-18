import { RDS } from 'aws-sdk'
import { Resource, ResourceType, StartStopTime } from '../../../model'

export class RDSInstanceResource implements Resource {
  public readonly type = ResourceType.RDS_INSTANCE
  public readonly id: string
  private readonly status: string

  constructor(instance: RDS.DBInstance, public readonly startStopTime: StartStopTime) {
    this.id = instance.DBInstanceIdentifier || ''
    this.status = instance.DBInstanceStatus || ''
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
