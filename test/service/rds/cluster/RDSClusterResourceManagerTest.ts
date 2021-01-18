import { RDS } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'

import { RDSClusterResourceManager } from '../../../../src/service/rds/cluster'
import { RDSClusterResource } from '../../../../src/service/rds/cluster/RDSClusterResource'

import { mocked } from 'ts-jest'
import { createAwsApiMock, defaultStartStopTime, tagName } from '../../utils'
import { makeListTagsForResourceResponse } from '../RDSTagValueParserTest'

jest.mock('aws-sdk')

describe(RDSClusterResourceManager, () => {
  describe('start', () => {
    it('called startDBCluster', async () => {
      const startDBCluster = createAwsApiMock()
      mocked(RDS).mockImplementationOnce((): any => ({ startDBCluster }))
      const manager = new RDSClusterResourceManager(new RDS(), tagName)

      const resource = new RDSClusterResource({ DBClusterIdentifier: 'hogehoge' }, defaultStartStopTime)

      await manager.start(resource)
      expect(startDBCluster).lastCalledWith({ DBClusterIdentifier: resource.id })
    })
  })

  describe('stop', () => {
    it('called stopDBCluster', async () => {
      const stopDBCluster = createAwsApiMock()
      mocked(RDS).mockImplementationOnce((): any => ({ stopDBCluster }))
      const manager = new RDSClusterResourceManager(new RDS(), tagName)

      const resource = new RDSClusterResource({ DBClusterIdentifier: 'hogehoge' }, defaultStartStopTime)

      await manager.stop(resource)
      expect(stopDBCluster).lastCalledWith({ DBClusterIdentifier: resource.id })
    })
  })

  describe('eachResources', () => {
    it('called describeDBClusters', async () => {
      const makeClusterResult = (name: string): RDS.DBCluster => ({
        DBClusterIdentifier: name,
        Status: 'available',
        DBClusterArn: name,
      })
      const makeTagList = (tag: string): RDS.TagList => [{ Key: 'AutoStartStop', Value: tag }]

      const clusters1 = [
        makeClusterResult('通常クラスター'),
        makeClusterResult('タグ値が不正なクラスター'),
        makeClusterResult('数を増やすためのダミー 1'),
      ]

      const clusters2 = [
        makeClusterResult('タグがないクラスター'),
        makeClusterResult('数を増やすためのダミー 2'),
        makeClusterResult('数を増やすためのダミー 3'),
      ]

      const tagsResponse = [
        makeListTagsForResourceResponse(makeTagList('+0900 09:00-21:00')),
        makeListTagsForResourceResponse(makeTagList('+0900 0900-2100')),
        makeListTagsForResourceResponse(makeTagList('+0900 09:00-21:00')),
        makeListTagsForResourceResponse([]),
        makeListTagsForResourceResponse(makeTagList('+0900 09:00-21:00')),
        makeListTagsForResourceResponse(makeTagList('+0900 09:00-21:00')),
      ]

      const makeClustersResponse = (
        clusters: RDS.DBCluster[],
        marker?: string
      ): PromiseResult<RDS.DBClusterMessage, any> => ({
        $response: 'dummy' as any,
        DBClusters: clusters,
        Marker: marker,
      })

      const describeDBClusters = createAwsApiMock(
        makeClustersResponse(clusters1, 'marker'),
        makeClustersResponse(clusters2)
      )
      const listTagsForResource = createAwsApiMock(...tagsResponse)
      mocked(RDS).mockImplementationOnce((): any => ({ describeDBClusters, listTagsForResource }))

      const manager = new RDSClusterResourceManager(new RDS(), tagName)

      const handledResources: RDSClusterResource[] = []

      await manager.eachResources(resource => {
        console.debug('TEST: RDSClusterResource = ' + JSON.stringify(resource))
        handledResources.push(resource)
      })

      expect(describeDBClusters).toBeCalledTimes(2)
      expect(listTagsForResource).toBeCalledTimes(6)
      expect(handledResources).toHaveLength(4)
    })
  })
})
