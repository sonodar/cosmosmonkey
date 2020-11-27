package main

import (
	"log"
	"time"

	"github.com/aws/aws-lambda-go/lambda"

	"github.com/sonodar/cosmosmonkey/config"
	"github.com/sonodar/cosmosmonkey/infra"
)

// 実装オブジェクトの生成
var factory = infra.NewServiceFactory(config.Region, config.TagKey)
var appService = factory.CreateStartStopService(config.DryRun)

// Lambda 本体
func main() {
	if config.DryRun {
		log.Println("info: Run in dry-run mode")
	}

	// ログのタイムスタンプ用にタイムゾーンを設定
	if config.LogLocation != "" {
		loc, _ := time.LoadLocation(config.LogLocation)
		time.Local = loc
	}

	lambda.Start(func() error {
		date := time.Now()
		if err := appService.Execute(&date); err != nil {
			return err
		}
		return nil
	})
}
