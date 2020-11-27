import { EC2AutoScalingResource } from '../../../../src/service/ec2/autoscaling/EC2AutoScalingResource'
import { StartStopTime, Time } from '../../../../src/model'
import { EC2AutoScalingPolicy } from '../../../../src/service/ec2/autoscaling/EC2AutoScalingPolicy'

const startStopTime = new StartStopTime(900, Time.parse('09:00'), Time.parse('19:00'))
const originalPolicy = { minSize: 2, maxSize: 4, desiredCapacity: 2 }

describe(EC2AutoScalingResource, () => {
  it('set AutoScalingGroup attributes', () => {
    const target = new EC2AutoScalingResource(
      {
        AutoScalingGroupName: 'hogehoge',
        MinSize: 1,
        MaxSize: 4,
        DesiredCapacity: 2,
      },
      new EC2AutoScalingPolicy(),
      startStopTime
    )

    expect(target.id).toEqual('hogehoge')
    expect(target.name).toEqual('hogehoge')
    expect(target.minSize).toEqual(1)
    expect(target.maxSize).toEqual(4)
    expect(target.desiredCapacity).toEqual(2)
    expect(target.canStart).toBeFalsy()
    expect(target.canStop).toBeTruthy()
    expect(target.originalAutoScalingPolicy.toString()).toEqual('minSize = 1, maxSize = 1, desiredCapacity = 1')
  })

  describe('canStart', () => {
    it('to be truthy if scaling parameters are all 0', () => {
      const target = new EC2AutoScalingResource(
        { AutoScalingGroupName: 'hogehoge', MinSize: 0, MaxSize: 0, DesiredCapacity: 0 },
        originalPolicy,
        startStopTime
      )
      expect(target.canStart).toBeTruthy()
      expect(target.canStop).toBeFalsy()
    })
  })
})
