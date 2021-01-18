import { AWSError, EC2 } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'

import { EC2InstanceResourceManager } from '../../../../src/service/ec2/instance'
import { EC2InstanceResource } from '../../../../src/service/ec2/instance/EC2InstanceResource'

import { mocked } from 'ts-jest'
import { createMockAwsApi, defaultStartStopTime, tagName } from '../../utils'

jest.mock('aws-sdk')

describe(EC2InstanceResourceManager, () => {
  describe('#start', () => {
    it('called startInstances', async () => {
      const startInstances = createMockAwsApi()
      mocked(EC2).mockImplementationOnce((): any => ({ startInstances }))
      const manager = new EC2InstanceResourceManager(new EC2(), tagName)

      const resource = new EC2InstanceResource(
        {
          InstanceId: 'ec2instance',
          State: { Name: 'stopped' },
        },
        defaultStartStopTime
      )

      await manager.start(resource)

      expect(startInstances).lastCalledWith({ InstanceIds: ['ec2instance'] })
    })
  })

  describe('#stop', () => {
    it('called stopInstances', async () => {
      const stopInstances = createMockAwsApi()
      mocked(EC2).mockImplementationOnce((): any => ({ stopInstances }))
      const manager = new EC2InstanceResourceManager(new EC2(), tagName)

      const resource = new EC2InstanceResource(
        {
          InstanceId: 'ec2instance',
          State: { Name: 'running' },
        },
        defaultStartStopTime
      )

      await manager.stop(resource)

      expect(stopInstances).lastCalledWith({ InstanceIds: ['ec2instance'] })
    })
  })

  describe('eachResources', () => {
    it('called describeInstances', async () => {
      const makeInstance = (id: string, name: string, tagValue: string) => ({
        InstanceId: id,
        Tags: [
          { Key: 'Name', Value: name },
          { Key: 'AutoStartStop', Value: tagValue },
        ],
      })

      const makeResponse = (
        instances: EC2.Instance[],
        nextToken?: string
      ): PromiseResult<EC2.DescribeInstancesResult, AWSError> => ({
        $response: 'dummy' as any,
        Reservations: [{ Instances: instances }],
        NextToken: nextToken,
      })

      const result1 = makeResponse(
        [
          makeInstance('1', '通常インスタンス', '+0900 09:00-12:00'),
          makeInstance('2', 'タグ値が不正なインスタンス', '+0900 0900-1200'),
          makeInstance('3', '数を増やすためのダミー1', '+0900 09:00-12:00'),
        ],
        'next-token'
      )

      const result2 = makeResponse([
        makeInstance('4', '数を増やすためのダミー2', '+0900 09:00-12:00'),
        makeInstance('5', '数を増やすためのダミー3', '+0900 09:00-12:00'),
      ])

      const describeInstances = createMockAwsApi(result1, result2)
      mocked(EC2).mockImplementationOnce((): any => ({ describeInstances }))

      const manager = new EC2InstanceResourceManager(new EC2(), tagName)

      const handledResources: EC2InstanceResource[] = []

      await manager.eachResources(resource => {
        console.debug('TEST: EC2InstanceResource = ' + JSON.stringify(resource))
        handledResources.push(resource)
      })

      expect(describeInstances).toBeCalledTimes(2)
      expect(handledResources).toHaveLength(4)
    })
  })
})
