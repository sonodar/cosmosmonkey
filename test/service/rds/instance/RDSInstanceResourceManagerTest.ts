import { RDS } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'

import { RDSInstanceResourceManager } from '../../../../src/service/rds/instance'
import { RDSInstanceResource } from '../../../../src/service/rds/instance/RDSInstanceResource'

import { mocked } from 'ts-jest'
import { createAwsApiMock, defaultStartStopTime, tagName } from '../../utils'
import { makeListTagsForResourceResponse } from '../RDSTagValueParserTest'

jest.mock('aws-sdk')

describe(RDSInstanceResourceManager, () => {
  describe('start', () => {
    it('called startDBInstance', async () => {
      const startDBInstance = createAwsApiMock()
      mocked(RDS).mockImplementationOnce((): any => ({ startDBInstance }))
      const manager = new RDSInstanceResourceManager(new RDS(), tagName)

      const resource = new RDSInstanceResource({ DBInstanceIdentifier: 'hogehoge' }, defaultStartStopTime)

      await manager.start(resource)
      expect(startDBInstance).lastCalledWith({ DBInstanceIdentifier: resource.id })
    })
  })

  describe('stop', () => {
    it('called stopDBInstance', async () => {
      const stopDBInstance = createAwsApiMock()
      mocked(RDS).mockImplementationOnce((): any => ({ stopDBInstance }))
      const manager = new RDSInstanceResourceManager(new RDS(), tagName)

      const resource = new RDSInstanceResource({ DBInstanceIdentifier: 'hogehoge' }, defaultStartStopTime)

      await manager.stop(resource)
      expect(stopDBInstance).lastCalledWith({ DBInstanceIdentifier: resource.id })
    })
  })

  describe('eachResources', () => {
    it('called describeDBInstances', async () => {
      const makeInstanceResult = (name: string): RDS.DBInstance => ({
        DBInstanceIdentifier: name,
        DBInstanceStatus: 'available',
        DBInstanceArn: name,
      })
      const makeTagList = (tag: string): RDS.TagList => [{ Key: 'AutoStartStop', Value: tag }]

      const instances1 = [
        makeInstanceResult('通常クラスター'),
        makeInstanceResult('タグ値が不正なクラスター'),
        makeInstanceResult('数を増やすためのダミー 1'),
      ]

      const instances2 = [
        makeInstanceResult('タグがないクラスター'),
        makeInstanceResult('数を増やすためのダミー 2'),
        makeInstanceResult('数を増やすためのダミー 3'),
      ]

      const tagsResponse = [
        makeListTagsForResourceResponse(makeTagList('+0900 09:00-21:00')),
        makeListTagsForResourceResponse(makeTagList('+0900 0900-2100')),
        makeListTagsForResourceResponse(makeTagList('+0900 09:00-21:00')),
        makeListTagsForResourceResponse([]),
        makeListTagsForResourceResponse(makeTagList('+0900 09:00-21:00')),
        makeListTagsForResourceResponse(makeTagList('+0900 09:00-21:00')),
      ]

      const makeInstancesResponse = (
        instances: RDS.DBInstance[],
        marker?: string
      ): PromiseResult<RDS.DBInstanceMessage, any> => ({
        $response: 'dummy' as any,
        DBInstances: instances,
        Marker: marker,
      })

      const describeDBInstances = createAwsApiMock(
        makeInstancesResponse(instances1, 'marker'),
        makeInstancesResponse(instances2)
      )
      const listTagsForResource = createAwsApiMock(...tagsResponse)
      mocked(RDS).mockImplementationOnce((): any => ({ describeDBInstances, listTagsForResource }))

      const manager = new RDSInstanceResourceManager(new RDS(), tagName)

      const handledResources: RDSInstanceResource[] = []

      await manager.eachResources(resource => {
        console.debug('TEST: RDSInstanceResource = ' + JSON.stringify(resource))
        handledResources.push(resource)
      })

      expect(describeDBInstances).toBeCalledTimes(2)
      expect(listTagsForResource).toBeCalledTimes(6)
      expect(handledResources).toHaveLength(4)
    })
  })
})
