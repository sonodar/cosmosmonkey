// var DefaultScalingSize int64 = 1
//
// type originAutoScalingPolicy struct {
// 	minSize         *int64
// 	maxSize         *int64
// 	desiredCapacity *int64
// }
//
// func (this *originAutoScalingPolicy) toString() string {
// 	return fmt.Sprintf("MinSize = %d, MaxSize = %d, DesiredCapacity = %d",
// 		this.getMinSize(), this.getMaxSize(), this.getDesiredCapacity())
// }
//
// func (this *originAutoScalingPolicy) getMinSize() *int64 {
// 	if this.minSize == nil {
// 		return &DefaultScalingSize
// 	}
// 	return this.minSize
// }
//
// func (this *originAutoScalingPolicy) getMaxSize() *int64 {
// 	if this.maxSize == nil {
// 		return &DefaultScalingSize
// 	}
// 	return this.maxSize
// }
//
// func (this *originAutoScalingPolicy) getDesiredCapacity() *int64 {
// 	if this.desiredCapacity == nil {
// 		return this.getMinSize()
// 	}
// 	return this.desiredCapacity
// }

export interface AutoScalingPolicy {
	minSize: number
	maxSize: number
	desiredCapacity: number
}

const DEFAULT_POLICY: AutoScalingPolicy = { minSize: 1, maxSize: 1, desiredCapacity: 1 }

export class EC2AutoScalingPolicy implements AutoScalingPolicy {
	public readonly minSize: number
	public readonly maxSize: number
	public readonly desiredCapacity: number

	constructor(policy: Partial<AutoScalingPolicy> = DEFAULT_POLICY) {
		this.minSize = policy.minSize || DEFAULT_POLICY.minSize
		this.maxSize = policy.maxSize || DEFAULT_POLICY.maxSize
		this.desiredCapacity = policy.desiredCapacity || this.minSize
	}

	public toString(): string {
		return `minSize = ${this.minSize}, maxSize = ${this.maxSize}, desiredCapacity = ${this.desiredCapacity}`
	}
}
