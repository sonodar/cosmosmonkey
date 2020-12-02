import { Resource, ResourceType, StartStopTime } from 'models'
import { AutoScaling } from 'aws-sdk'
import { AutoScalingPolicy } from './EC2AutoScalingPolicy'

export class EC2AutoScalingResource implements Resource, AutoScalingPolicy {
  public readonly type = ResourceType.AUTO_SCALING_GROUP
  public readonly name: string

  public readonly minSize: number
  public readonly maxSize: number
  public readonly desiredCapacity: number

  constructor(
    group: AutoScaling.AutoScalingGroup,
    public readonly originalAutoScalingPolicy: AutoScalingPolicy,
    public readonly startStopTime: StartStopTime
  ) {
    this.name = group.AutoScalingGroupName
    this.minSize = group.MinSize
    this.maxSize = group.MaxSize
    this.desiredCapacity = group.DesiredCapacity
  }

  get id(): string {
    return this.name
  }

  get canStart(): boolean {
    return (
      this.originalAutoScalingPolicy.desiredCapacity === 0 &&
      this.originalAutoScalingPolicy.minSize === 0 &&
      this.originalAutoScalingPolicy.maxSize === 0
    )
  }

  get canStop(): boolean {
    return (
      this.originalAutoScalingPolicy.desiredCapacity > 0 ||
      this.originalAutoScalingPolicy.minSize > 0 ||
      this.originalAutoScalingPolicy.maxSize > 0
    )
  }
}
