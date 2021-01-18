import { RDS } from 'aws-sdk'

type RDSClient = Pick<RDS, 'listTagsForResource'>

/**
 * RDS の Describe 系レスポンスはタグを持っていないので、タグ取得のAPIを別途実行してタグ値を取得する。
 */
export async function getRDSTagValue(rds: RDSClient, arn: string, tagKey: string): Promise<string | null> {
  const request: RDS.ListTagsForResourceMessage = { ResourceName: arn }
  const response = await rds.listTagsForResource(request).promise()
  return response?.TagList?.find(t => t.Key === tagKey)?.Value || null
}
