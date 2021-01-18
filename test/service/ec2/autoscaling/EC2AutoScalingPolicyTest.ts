import { EC2AutoScalingPolicy } from '../../../../src/service/ec2/autoscaling/EC2AutoScalingPolicy'

describe(EC2AutoScalingPolicy, () => {
  it('set default policy when received empty', () => {
    const policy = new EC2AutoScalingPolicy({})
    expect(policy.minSize).toEqual(1)
    expect(policy.maxSize).toEqual(1)
    expect(policy.desiredCapacity).toEqual(1)
  })
})
