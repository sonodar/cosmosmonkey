import { RDS } from 'aws-sdk'

/**
 * RDS の Describe 系レスポンスはタグを持っていないので、タグ取得のAPIを別途実行してタグ値を取得する。
 */
export async function getRDSTagValue(rds: RDS, arn: string, tagKey: string): Promise<string | null> {
  const request: RDS.ListTagsForResourceMessage = { ResourceName: arn }
  const response = await rds.listTagsForResource(request).promise()

  if (!response || !response.TagList) {
    throw new Error(`rds:ListTagsForResource ${arn}`)
  }

  const tag = response.TagList.find(t => t.Key === tagKey)
  return tag?.Value || null
}
