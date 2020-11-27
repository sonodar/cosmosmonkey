import { EC2 } from 'aws-sdk'
import { ResourceHandler, ResourceType, ResourceManager } from '../../../model'
import { EC2InstanceResource } from './EC2InstanceResource'
import { TagValueParser } from '../../TagValueParser'

export type EC2Client = Pick<EC2, 'startInstances' | 'stopInstances' | 'describeInstances'>

/**
 * EC2 インスタンスの検索、起動、停止を行う。
 */
export class EC2InstanceResourceManager implements ResourceManager<EC2InstanceResource> {
  public readonly supportedType = ResourceType.EC2_INSTANCE

  constructor(private readonly ec2: EC2Client, private readonly tagName: string) {}

  async eachResources(handler: ResourceHandler<EC2InstanceResource>): Promise<void> {
    for await (const instance of getTargetInstances(this.ec2, this.tagName)) {
      const resource = toResource(instance, this.tagName)
      if (resource) await handler(resource)
    }
  }

  async start(resource: EC2InstanceResource): Promise<void> {
    console.info(`${resource.type} "${resource.name}" starting ...`)
    await this.ec2.startInstances({ InstanceIds: [resource.id] }).promise()
  }

  async stop(resource: EC2InstanceResource): Promise<void> {
    console.info(`${resource.type} "${resource.name}" stopping ...`)
    await this.ec2.stopInstances({ InstanceIds: [resource.id] }).promise()
  }
}

async function* getTargetInstances(ec2: EC2Client, tagName: string, nextToken?: string): AsyncGenerator<EC2.Instance> {
  const request: EC2.DescribeInstancesRequest = {
    Filters: [
      { Name: 'tag-key', Values: [tagName] },
      { Name: 'instance-state-name', Values: ['running', 'stopped'] },
    ],
  }
  if (nextToken) {
    request.NextToken = nextToken
  }

  const { Reservations, NextToken } = await ec2.describeInstances(request).promise()

  if (!Reservations) return

  for (const reserve of Reservations) {
    if (!reserve.Instances) continue

    for (const instance of reserve.Instances) {
      yield instance
    }
  }

  if (!NextToken) return

  for await (const instance of getTargetInstances(ec2, tagName, NextToken)) {
    yield instance
  }
}

function toResource(instance: EC2.Instance, tagName: string): EC2InstanceResource | null {
  const value = instance.Tags?.find(t => t.Key === tagName)?.Value
  const tagValue = TagValueParser.parse(value)
  if (!tagValue) return null
  return new EC2InstanceResource(instance, tagValue.startStopTime)
}
