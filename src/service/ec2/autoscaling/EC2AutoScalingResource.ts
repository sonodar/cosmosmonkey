// const AutoScalingType = "AWS::AutoScaling::Group"
//
// type autoScalingGroupResource struct {
// 	group          *autoscaling.Group
// 	originalPolicy *originAutoScalingPolicy
// 	startStopTime  *time.StartStopTime
// }
//
// func (this *autoScalingGroupResource) Type() string {
// 	return AutoScalingType
// }
//
// func (this *autoScalingGroupResource) Id() *string {
// 	return this.Name()
// }
//
// func (this *autoScalingGroupResource) Name() *string {
// 	return this.group.AutoScalingGroupName
// }
//
// func (this *autoScalingGroupResource) StartStopTime() *time.StartStopTime {
// 	return this.startStopTime
// }
//
// func (this *autoScalingGroupResource) CanStart() bool {
// 	return *this.group.DesiredCapacity == 0 && *this.group.MaxSize == 0 && *this.group.MinSize == 0
// }
//
// func (this *autoScalingGroupResource) CanStop() bool {
// 	return *this.group.DesiredCapacity > 0 || *this.group.MaxSize > 0 || *this.group.MinSize > 0
// }

import {Resource, ResourceType, StartStopTime} from 'models'
import {AutoScaling} from 'aws-sdk'
import { AutoScalingPolicy } from './EC2AutoScalingPolicy'

export class EC2AutoScalingResource implements Resource, AutoScalingPolicy {
	public readonly type = ResourceType.AUTO_SCALING_GROUP
	public readonly name: string

	public readonly minSize: number
	public readonly maxSize: number
	public readonly desiredCapacity: number

	constructor(group: AutoScaling.AutoScalingGroup, public readonly originalAutoScalingPolicy: AutoScalingPolicy, public readonly startStopTime: StartStopTime) {
		this.name = group.AutoScalingGroupName
		this.minSize = group.MinSize
		this.maxSize = group.MaxSize
		this.desiredCapacity = group.DesiredCapacity
	}

	get id() {
		return this.name
	}

	get canStart(): boolean {
		return this.originalAutoScalingPolicy.desiredCapacity === 0
			&& this.originalAutoScalingPolicy.minSize === 0
			&& this.originalAutoScalingPolicy.maxSize === 0
	}

	get canStop(): boolean {
		return this.originalAutoScalingPolicy.desiredCapacity > 0
			|| this.originalAutoScalingPolicy.minSize > 0
			|| this.originalAutoScalingPolicy.maxSize > 0
	}
}
