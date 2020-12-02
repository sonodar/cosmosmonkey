import { ResourceHandler, ResourceManager, ResourceType } from 'models'
import { EC2AutoScalingResource } from './EC2AutoScalingResource'
import { AutoScaling } from 'aws-sdk'
import { TagValueParser } from '../../TagValueParser'
import { AutoScalingPolicy, EC2AutoScalingPolicy } from './EC2AutoScalingPolicy'

export class EC2AutoScalingResourceManager implements ResourceManager<EC2AutoScalingResource> {
  public readonly supportedType = ResourceType.AUTO_SCALING_GROUP

  constructor(private readonly autoscaling: AutoScaling, private readonly tagName: string) {}

  async eachResources(handler: ResourceHandler<EC2AutoScalingResource>): Promise<void> {
    for await (const group of await getAutoScalingGroups(this.autoscaling)) {
      const resource = toResource(group, this.tagName)
      if (resource) await handler(resource)
    }
  }

  /**
   * AutoScalingGroup の起動数を元に戻す。
   */
  async start(resource: EC2AutoScalingResource): Promise<void> {
    const request: AutoScaling.UpdateAutoScalingGroupType = {
      AutoScalingGroupName: resource.name,
      MinSize: resource.originalAutoScalingPolicy.minSize,
      MaxSize: resource.originalAutoScalingPolicy.maxSize,
      DesiredCapacity: resource.originalAutoScalingPolicy.desiredCapacity,
    }
    await this.autoscaling.updateAutoScalingGroup(request).promise()
  }

  /**
   * AutoScalingGroup の起動数を 0 にする。
   */
  async stop(resource: EC2AutoScalingResource): Promise<void> {
    const request: AutoScaling.UpdateAutoScalingGroupType = {
      AutoScalingGroupName: resource.name,
      MinSize: 0,
      MaxSize: 0,
      DesiredCapacity: 0,
    }
    await this.autoscaling.updateAutoScalingGroup(request).promise()
  }
}

async function* getAutoScalingGroups(
  autoscaling: AutoScaling,
  nextToken?: string
): AsyncGenerator<AutoScaling.AutoScalingGroup> {
  const request: { NextToken?: string } = {}
  if (nextToken) request.NextToken = nextToken
  const { AutoScalingGroups, NextToken } = await autoscaling.describeAutoScalingGroups(request).promise()
  for (const group of AutoScalingGroups || []) yield group
  if (NextToken) return getAutoScalingGroups(autoscaling, NextToken)
}

function toResource(group: AutoScaling.AutoScalingGroup, tagName: string): EC2AutoScalingResource | null {
  const tagValue = getAutoStartStopTagValue(group, tagName)
  if (!tagValue) return null
  const parsedTag = TagValueParser.parse(tagValue)
  if (!parsedTag) return null
  const policy = new EC2AutoScalingPolicy(extractPolicy(parsedTag.config))
  return new EC2AutoScalingResource(group, policy, parsedTag.startStopTime)
}

function getAutoStartStopTagValue(group: AutoScaling.AutoScalingGroup, tagName: string): string | null {
  const tag = (group.Tags || []).find(tag => tag.Key === tagName)
  if (!tag || !tag.Value) return null
  return tag.Value
}

const MIN_SIZE_KEY_PATTERN = /min(?:_?size)?/i
const MAX_SIZE_KEY_PATTERN = /max(?:_?size)?/i
const CAPACITY_KEY_PATTERN = /(:?desired_?)?cap(?:acity)?/i

function extractPolicy(config: Record<string, string>): Partial<AutoScalingPolicy> {
  const policy: Partial<AutoScalingPolicy> = {}
  for (const key in config) {
    const value = parseInt(config[key])
    if (isNaN(value)) continue
    if (MIN_SIZE_KEY_PATTERN.test(key)) policy.minSize = value
    if (MAX_SIZE_KEY_PATTERN.test(key)) policy.maxSize = value
    if (CAPACITY_KEY_PATTERN.test(key)) policy.desiredCapacity = value
  }
  return policy
}
