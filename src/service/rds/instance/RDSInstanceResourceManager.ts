import { RDS } from 'aws-sdk'
import { ResourceHandler, ResourceManager, ResourceType } from '../../../model'
import { RDSInstanceResource } from './RDSInstanceResource'
import { getRDSTagValue } from '../RDSTagValueParser'
import { TagValueParser } from '../../TagValueParser'

export type RDSInstanceClient = Pick<
  RDS,
  'startDBInstance' | 'stopDBInstance' | 'describeDBInstances' | 'listTagsForResource'
>

/**
 * RDS インスタンスの取得、起動、停止を行う。
 */
export class RDSInstanceResourceManager implements ResourceManager<RDSInstanceResource> {
  public readonly supportedType = ResourceType.RDS_INSTANCE

  constructor(private readonly rds: RDSInstanceClient, private readonly tagName: string) {}

  async eachResources(handler: ResourceHandler<RDSInstanceResource>): Promise<void> {
    for await (const instances of getTargetInstances(this.rds, this.tagName)) {
      for (const instance of instances) {
        const resource = await toResource(this.rds, instance, this.tagName)
        if (resource) await handler(resource)
      }
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
async function* getTargetInstances(
  rds: RDSInstanceClient,
  tagName: string,
  marker?: string
): AsyncGenerator<RDS.DBInstance[]> {
  const request: RDS.DescribeDBInstancesMessage = {}
  if (marker) request.Marker = marker

  const { DBInstances, Marker } = await rds.describeDBInstances(request).promise()

  yield DBInstances || []

  if (!Marker) return

  for await (const instances of getTargetInstances(rds, tagName, Marker)) {
    yield instances
  }
}

/**
 * 指定したタグを持っていた場合のみ、DBInstance をドメインオブジェクトに変換する。
 */
async function toResource(
  rds: RDSInstanceClient,
  cluster: RDS.DBInstance,
  tagName: string
): Promise<RDSInstanceResource | null> {
  /* istanbul ignore next */ if (!cluster.DBInstanceArn) return null // dead code
  const tag = await getRDSTagValue(rds, cluster.DBInstanceArn, tagName)
  const tagValue = TagValueParser.parse(tag)
  if (!tagValue) return null
  return new RDSInstanceResource(cluster, tagValue.startStopTime)
}
