import { EC2 } from 'aws-sdk'
import { EC2InstanceResource } from '../../../../src/service/ec2/instance/EC2InstanceResource'
import { StartStopTime, Time } from '../../../../src/model'

const startStopTime = new StartStopTime(900, Time.parse('09:00'), Time.parse('19:00'))

describe(EC2InstanceResource, () => {
  it('set instance attributes', () => {
    const instance: EC2.Instance = {
      InstanceId: 'i-hogehoge',
      State: { Name: 'running' },
      Tags: [{ Key: 'Name', Value: 'hogehoge' }],
    }
    const target = new EC2InstanceResource(instance, startStopTime)

    expect(target.id).toEqual('i-hogehoge')
    expect(target.name).toEqual('hogehoge')
    expect(target.canStart).toBeFalsy()
    expect(target.canStop).toBeTruthy()
  })

  it('set instance id to name if missing name tag', () => {
    const instance: EC2.Instance = {
      InstanceId: 'i-hogehoge',
      State: { Name: 'stopped' },
    }
    const target = new EC2InstanceResource(instance, startStopTime)

    expect(target.id).toEqual('i-hogehoge')
    expect(target.name).toEqual('i-hogehoge')
    expect(target.canStart).toBeTruthy()
    expect(target.canStop).toBeFalsy()
  })

  it('throw error when id is empty', () => {
    expect(() => new EC2InstanceResource({}, startStopTime)).toThrowError()
  })
})
