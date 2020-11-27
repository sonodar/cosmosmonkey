package service

import (
	"github.com/aws/aws-sdk-go/service/rds"

	"github.com/sonodar/cosmosmonkey/infra/util"
)

/**
 * RDS の Describe 系レスポンスはタグを持っていないので、タグ取得のAPIを別途実行してタグ値を取得する。
 */
func getDBTagValue(client *rds.RDS, arn *string, tagKey string) (*string, error) {
	input := &rds.ListTagsForResourceInput{ResourceName: arn}
	output, err := client.ListTagsForResource(input)

	if err != nil {
		util.Errorf("rds:ListTagsForResource %v\n", err)
		return nil, err
	}

	for _, tag := range output.TagList {
		if *tag.Key == tagKey {
			return tag.Value, nil
		}
	}
	return nil, nil
}
