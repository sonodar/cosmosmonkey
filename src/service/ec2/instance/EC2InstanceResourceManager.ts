import { EC2 } from 'aws-sdk'
import { ResourceHandler, ResourceType, ResourceManager } from 'models'
import { EC2InstanceResource } from './EC2InstanceResource'
import { TagValueParser } from '../../TagValueParser'

/**
 * EC2 インスタンスの検索、起動、停止を行う。
 */
export class EC2InstanceResourceManager implements ResourceManager<EC2InstanceResource> {
  public readonly supportedType = ResourceType.EC2_INSTANCE

  constructor(private readonly ec2: EC2, private readonly tagName: string) {}

  async eachResources(handler: ResourceHandler<EC2InstanceResource>): Promise<void> {
    for await (const instance of getTargetInstances(this.ec2, this.tagName)) {
      const resource = toResource(instance, this.tagName)
      if (!resource) continue
      await handler(resource)
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

async function* getTargetInstances(ec2: EC2, tagName: string, nextToken?: string): AsyncGenerator<EC2.Instance> {
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
  const instances = (Reservations || []).map(reservation => reservation.Instances || []).flat()
  for (const instance of instances) yield instance
  if (NextToken) return getTargetInstances(ec2, tagName, NextToken)
}

function toResource(instance: EC2.Instance, tagName: string): EC2InstanceResource | null {
  const value = getTagValue(instance, tagName)
  if (!value) return null
  const tagValue = TagValueParser.parse(value)
  if (!tagValue) return null
  return new EC2InstanceResource(instance, tagValue.startStopTime)
}

function getTagValue(instance: EC2.Instance, name: string): string | undefined {
  const tag = (instance.Tags || []).find(t => t.Key === name)
  if (tag) return tag.Value
  console.warn(`missing ${name} tag`)
  return
}
