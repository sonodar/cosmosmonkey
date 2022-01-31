import { AWSError, AutoScaling } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'

import { AutoScalingPolicy } from '../../../../src/service/ec2/autoscaling/EC2AutoScalingPolicy'
import { EC2AutoScalingResourceManager } from '../../../../src/service/ec2/autoscaling'
import { EC2AutoScalingResource } from '../../../../src/service/ec2/autoscaling/EC2AutoScalingResource'

import { mocked } from 'jest-mock'
import { createMockAwsApi, defaultStartStopTime, tagName } from '../../utils'

jest.mock('aws-sdk')

type MockAutoScalingGroupType = Pick<
  AutoScaling.AutoScalingGroup,
  'AutoScalingGroupName' | 'MinSize' | 'MaxSize' | 'DesiredCapacity' | 'Tags'
>
type MockAutoScalingGroup = { name: string; tagValue?: string; policy?: AutoScalingPolicy }

const makeAutoScalingGroup = (group: MockAutoScalingGroup): MockAutoScalingGroupType => {
  const tags: AutoScaling.TagDescriptionList = []
  if (group.tagValue) {
    tags.push({ Key: 'AutoStartStop', Value: group.tagValue })
  }
  return {
    AutoScalingGroupName: group.name,
    MinSize: group.policy?.minSize || 1,
    MaxSize: group.policy?.maxSize || 2,
    DesiredCapacity: group.policy?.desiredCapacity || group.policy?.minSize || 1,
    Tags: tags,
  }
}

describe(EC2AutoScalingResourceManager, () => {
  describe('start', () => {
    it('called updateAutoScalingGroup', async () => {
      const updateAutoScalingGroup = createMockAwsApi()
      mocked(AutoScaling).mockImplementationOnce((): any => ({ updateAutoScalingGroup }))
      const manager = new EC2AutoScalingResourceManager(new AutoScaling(), tagName)

      const restorePolicy = { minSize: 2, maxSize: 6, desiredCapacity: 3 }
      const group = makeAutoScalingGroup({ name: 'startingGroup' })
      const resource = new EC2AutoScalingResource(group, restorePolicy, defaultStartStopTime)

      await manager.start(resource)

      expect(updateAutoScalingGroup).lastCalledWith({
        AutoScalingGroupName: resource.name,
        MinSize: resource.originalAutoScalingPolicy.minSize,
        MaxSize: resource.originalAutoScalingPolicy.maxSize,
        DesiredCapacity: resource.originalAutoScalingPolicy.desiredCapacity,
      })
    })
  })

  describe('stop', () => {
    it('called updateAutoScalingGroup with 0', async () => {
      const updateAutoScalingGroup = createMockAwsApi()
      mocked(AutoScaling).mockImplementationOnce((): any => ({ updateAutoScalingGroup }))
      const manager = new EC2AutoScalingResourceManager(new AutoScaling(), tagName)

      const originalPolicy = { minSize: 2, maxSize: 6, desiredCapacity: 3 }
      const group = makeAutoScalingGroup({ name: 'stoppingGroup' })
      const resource = new EC2AutoScalingResource(group, originalPolicy, defaultStartStopTime)

      await manager.stop(resource)

      expect(updateAutoScalingGroup).lastCalledWith({
        AutoScalingGroupName: resource.name,
        MinSize: 0,
        MaxSize: 0,
        DesiredCapacity: 0,
      })
    })
  })

  describe('eachResources', () => {
    it('called describeAutoScalingGroups', async () => {
      const makeResponse = (
        groups: MockAutoScalingGroupType[],
        nextToken?: string
      ): PromiseResult<AutoScaling.AutoScalingGroupsType, AWSError> => ({
        $response: 'dummy' as any,
        AutoScalingGroups: groups as any,
        NextToken: nextToken,
      })

      const tagValue = '+0900 09:00-21:00 min=1 max=4 capacity=2'

      const response1 = makeResponse(
        [
          makeAutoScalingGroup({ name: '通常グループ', tagValue }),
          makeAutoScalingGroup({ name: 'タグ値が不正なグループ', tagValue: '+0900 0900-2100' }),
          makeAutoScalingGroup({
            name: '関係ない数値がタグに混在しているグループ',
            tagValue: tagValue + ' foo=1 bar=bar',
          }),
          makeAutoScalingGroup({ name: '数を増やすためのダミーたち', tagValue }),
        ],
        'next-token'
      )

      const response2 = makeResponse([
        makeAutoScalingGroup({ name: '数を増やすためのダミーたち', tagValue }),
        makeAutoScalingGroup({ name: 'タグがないグループ' }),
        makeAutoScalingGroup({ name: '数を増やすためのダミーたち', tagValue }),
      ])

      const describeAutoScalingGroups = createMockAwsApi(response1, response2)
      mocked(AutoScaling).mockImplementationOnce((): any => ({ describeAutoScalingGroups }))
      const manager = new EC2AutoScalingResourceManager(new AutoScaling(), tagName)

      const handledResources: EC2AutoScalingResource[] = []

      await manager.eachResources(resource => {
        console.debug('TEST: EC2AutoScalingResource = ' + JSON.stringify(resource))
        handledResources.push(resource)
      })

      expect(describeAutoScalingGroups).toBeCalledTimes(2)
      expect(handledResources).toHaveLength(5)
    })
  })
})
