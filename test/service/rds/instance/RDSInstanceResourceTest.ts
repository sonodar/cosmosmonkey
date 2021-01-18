import { RDS } from 'aws-sdk'
import { StartStopTime, Time } from '../../../../src/model'
import { RDSInstanceResource } from '../../../../src/service/rds/instance/RDSInstanceResource'

const startStopTime = new StartStopTime(900, Time.parse('09:00'), Time.parse('19:00'))

describe(RDSInstanceResource, () => {
  it('set instance attributes', () => {
    const instance: RDS.DBInstance = { DBInstanceIdentifier: 'hogehoge' }
    const target = new RDSInstanceResource(instance, startStopTime)

    expect(target.id).toEqual('hogehoge')
    expect(target.name).toEqual('hogehoge')
    expect(target.canStart).toBeFalsy()
    expect(target.canStop).toBeFalsy()
  })

  it('canStart to be truthy if status is stopped', () => {
    const target = new RDSInstanceResource(
      {
        DBInstanceIdentifier: 'hogehoge',
        DBInstanceStatus: 'stopped',
      },
      startStopTime
    )

    expect(target.canStart).toBeTruthy()
  })

  it('canStop to be truthy if status is available', () => {
    const target = new RDSInstanceResource(
      {
        DBInstanceIdentifier: 'hogehoge',
        DBInstanceStatus: 'available',
      },
      startStopTime
    )

    expect(target.canStop).toBeTruthy()
  })
})
