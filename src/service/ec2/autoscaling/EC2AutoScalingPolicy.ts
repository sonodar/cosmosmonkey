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

  constructor(policy: Partial<AutoScalingPolicy> = {}) {
    this.minSize = policy.minSize || DEFAULT_POLICY.minSize
    this.maxSize = policy.maxSize || DEFAULT_POLICY.maxSize
    this.desiredCapacity = policy.desiredCapacity || this.minSize
  }

  public toString(): string {
    return `minSize = ${this.minSize}, maxSize = ${this.maxSize}, desiredCapacity = ${this.desiredCapacity}`
  }
}
