import { RDS } from 'aws-sdk'
import { ResourceHandler, ResourceManager, ResourceType } from 'models'
import { RDSClusterResource } from './RDSClusterResource'
import { getRDSTagValue } from '../RDSTagValueParser'
import { TagValueParser } from '../../TagValueParser'

/**
 * Aurora クラスターの取得、起動、停止を行う。
 */
export class RDSClusterResourceManager implements ResourceManager<RDSClusterResource> {
  public readonly supportedType = ResourceType.RDS_CLUSTER

  constructor(private readonly rds: RDS, private readonly tagName: string) {}

  async eachResources(handler: ResourceHandler<RDSClusterResource>): Promise<void> {
    for await (const cluster of getTargetClusters(this.rds, this.tagName)) {
      const resource = await toResource(this.rds, cluster, this.tagName)
      if (resource) await handler(resource)
    }
  }

  async start(resource: RDSClusterResource): Promise<void> {
    const request: RDS.StartDBClusterMessage = { DBClusterIdentifier: resource.id }
    await this.rds.startDBCluster(request).promise()
  }

  async stop(resource: RDSClusterResource): Promise<void> {
    const request: RDS.StopDBClusterMessage = { DBClusterIdentifier: resource.id }
    await this.rds.stopDBCluster(request).promise()
  }
}

/**
 * RDS はタグでの検索に対応していないため、全件取得して N+1 でタグを取得する。
 * TODO: 現在は ResourceManager の search API でタグ検索ができるので後ほどリファクタリング。
 */
async function* getTargetClusters(rds: RDS, tagName: string, marker?: string): AsyncGenerator<RDS.DBCluster> {
  const request: RDS.DescribeDBClustersMessage = {}
  if (marker) request.Marker = marker
  const { DBClusters, Marker } = await rds.describeDBClusters(request).promise()
  for (const cluster of DBClusters || []) yield cluster
  if (Marker) return getTargetClusters(rds, tagName, Marker)
}

/**
 * 指定したタグを持っていた場合のみ、DBCluster をドメインオブジェクトに変換する。
 */
async function toResource(rds: RDS, cluster: RDS.DBCluster, tagName: string): Promise<RDSClusterResource | null> {
  const tag = await getRDSTagValue(rds, cluster.DBClusterArn || '', tagName)
  if (!tag) return null
  const tagValue = TagValueParser.parse(tag)
  if (!tagValue) return null
  return new RDSClusterResource(cluster, tagValue.startStopTime)
}
