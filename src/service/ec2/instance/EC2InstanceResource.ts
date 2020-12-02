import { EC2 } from 'aws-sdk'
import { Resource, ResourceType, StartStopTime } from 'models'

export class EC2InstanceResource implements Resource {
  public readonly type = ResourceType.EC2_INSTANCE
  public readonly id: string
  public readonly name: string
  private readonly state?: string

  constructor(instance: EC2.Instance, public readonly startStopTime: StartStopTime) {
    if (!instance.InstanceId) throw new Error('instance id is empty (dead code)')

    this.id = instance.InstanceId
    this.name = getNameTagValue(instance) || this.id
    this.state = instance.State?.Name
  }

  get canStart(): boolean {
    return this.state === 'stopped'
  }

  get canStop(): boolean {
    return this.state === 'running'
  }
}

function getNameTagValue(instance: EC2.Instance): string | undefined {
  return (instance.Tags || []).find(tag => tag.Key === 'Name')?.Value
}
