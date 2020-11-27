// /**
//  * RDS の Describe 系レスポンスはタグを持っていないので、タグ取得のAPIを別途実行してタグ値を取得する。
//  */
// func getDBTagValue(client *rds.RDS, arn *string, tagKey string) (*string, error) {
// 	input := &rds.ListTagsForResourceInput{ResourceName: arn}
// 	output, err := client.ListTagsForResource(input)
//
// 	if err != nil {
// 		util.Errorf("rds:ListTagsForResource %v\n", err)
// 		return nil, err
// 	}
//
// 	for _, tag := range output.TagList {
// 		if *tag.Key == tagKey {
// 			return tag.Value, nil
// 		}
// 	}
// 	return nil, nil
// }
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
