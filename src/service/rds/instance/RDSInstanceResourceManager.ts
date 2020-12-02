import { RDS } from 'aws-sdk'
import { ResourceHandler, ResourceManager, ResourceType } from 'models'
import { RDSInstanceResource } from './RDSInstanceResource'
import { getRDSTagValue } from '../RDSTagValueParser'
import { TagValueParser } from '../../TagValueParser'

/**
 * RDS インスタンスの取得、起動、停止を行う。
 */
export class RDSInstanceResourceManager implements ResourceManager<RDSInstanceResource> {
  public readonly supportedType = ResourceType.RDS_INSTANCE

  constructor(private readonly rds: RDS, private readonly tagName: string) {}

  async eachResources(handler: ResourceHandler<RDSInstanceResource>): Promise<void> {
    for await (const instance of getTargetInstances(this.rds, this.tagName)) {
      const resource = await toResource(this.rds, instance, this.tagName)
      if (resource) await handler(resource)
    }
  }

  async start(resource: RDSInstanceResource): Promise<void> {
    const request: RDS.StartDBInstanceMessage = { DBInstanceIdentifier: resource.id }
    await this.rds.startDBInstance(request).promise()
  }

  async stop(resource: RDSInstanceResource): Promise<void> {
    const request: RDS.StopDBInstanceMessage = { DBInstanceIdentifier: resource.id }
    await this.rds.stopDBInstance(request).promise()
  }
}

/**
 * RDS はタグでの検索に対応していないため、全件取得して N+1 でタグを取得する。
 * TODO: 現在は ResourceManager の search API でタグ検索ができるので後ほどリファクタリング。
 */
async function* getTargetInstances(rds: RDS, tagName: string, marker?: string): AsyncGenerator<RDS.DBInstance> {
  const request: RDS.DescribeDBInstancesMessage = {}
  if (marker) request.Marker = marker
  const { DBInstances, Marker } = await rds.describeDBInstances(request).promise()
  for (const instance of DBInstances || []) yield instance
  if (Marker) return getTargetInstances(rds, tagName, Marker)
}

/**
 * 指定したタグを持っていた場合のみ、DBInstance をドメインオブジェクトに変換する。
 */
async function toResource(rds: RDS, cluster: RDS.DBInstance, tagName: string): Promise<RDSInstanceResource | null> {
  const tag = await getRDSTagValue(rds, cluster.DBInstanceArn || '', tagName)
  if (!tag) return null
  const tagValue = TagValueParser.parse(tag)
  if (!tagValue) return null
  return new RDSInstanceResource(cluster, tagValue.startStopTime)
}
