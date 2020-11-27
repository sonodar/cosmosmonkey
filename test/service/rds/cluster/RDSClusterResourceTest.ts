import { RDS } from 'aws-sdk'
import { StartStopTime, Time } from '../../../../src/model'
import { RDSClusterResource } from '../../../../src/service/rds/cluster/RDSClusterResource'

const startStopTime = new StartStopTime(900, Time.parse('09:00'), Time.parse('19:00'))

describe(RDSClusterResource, () => {
  it('set instance attributes', () => {
    const instance: RDS.DBCluster = { DBClusterIdentifier: 'hogehoge' }
    const target = new RDSClusterResource(instance, startStopTime)

    expect(target.id).toEqual('hogehoge')
    expect(target.name).toEqual('hogehoge')
    expect(target.canStart).toBeFalsy()
    expect(target.canStop).toBeFalsy()
  })

  it('canStart to be truthy if status is stopped', () => {
    const target = new RDSClusterResource(
      {
        DBClusterIdentifier: 'hogehoge',
        Status: 'stopped',
      },
      startStopTime
    )

    expect(target.canStart).toBeTruthy()
  })

  it('canStop to be truthy if status is available', () => {
    const target = new RDSClusterResource(
      {
        DBClusterIdentifier: 'hogehoge',
        Status: 'available',
      },
      startStopTime
    )

    expect(target.canStop).toBeTruthy()
  })
})
