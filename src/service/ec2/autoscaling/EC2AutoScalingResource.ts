import { Resource, ResourceType, StartStopTime } from '../../../model'
import { AutoScaling } from 'aws-sdk'
import { AutoScalingPolicy } from './EC2AutoScalingPolicy'

export type AutoScalingGroup = Pick<
  AutoScaling.AutoScalingGroup,
  'AutoScalingGroupName' | 'MinSize' | 'MaxSize' | 'DesiredCapacity'
> &
  Partial<Pick<AutoScaling.AutoScalingGroup, 'Tags'>>

export class EC2AutoScalingResource implements Resource, AutoScalingPolicy {
  public readonly type = ResourceType.AUTO_SCALING_GROUP
  public readonly name: string

  public readonly currentAutoScalingPolicy: AutoScalingPolicy

  get minSize(): number {
    return this.currentAutoScalingPolicy.minSize
  }

  get maxSize(): number {
    return this.currentAutoScalingPolicy.maxSize
  }

  get desiredCapacity(): number {
    return this.currentAutoScalingPolicy.desiredCapacity
  }

  constructor(
    group: AutoScalingGroup,
    public readonly originalAutoScalingPolicy: AutoScalingPolicy,
    public readonly startStopTime: StartStopTime
  ) {
    this.name = group.AutoScalingGroupName
    this.currentAutoScalingPolicy = {
      minSize: group.MinSize,
      maxSize: group.MaxSize,
      desiredCapacity: group.DesiredCapacity,
    }
  }

  get id(): string {
    return this.name
  }

  get canStart(): boolean {
    return (
      this.currentAutoScalingPolicy.desiredCapacity === 0 &&
      this.currentAutoScalingPolicy.minSize === 0 &&
      this.currentAutoScalingPolicy.maxSize === 0
    )
  }

  get canStop(): boolean {
    return (
      this.currentAutoScalingPolicy.desiredCapacity > 0 ||
      this.currentAutoScalingPolicy.minSize > 0 ||
      this.currentAutoScalingPolicy.maxSize > 0
    )
  }
}
