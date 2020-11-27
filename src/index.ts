// // 実装オブジェクトの生成
// var factory = infra.NewServiceFactory(config.Region, config.TagKey)
// var appService = factory.CreateStartStopService(config.DryRun)
//
// // Lambda 本体
// func main() {
// 	if config.DryRun {
// 		log.Println("info: Run in dry-run mode")
// 	}
//
// 	// ログのタイムスタンプ用にタイムゾーンを設定
// 	if config.LogLocation != "" {
// 		loc, _ := time.LoadLocation(config.LogLocation)
// 		time.Local = loc
// 	}
//
// 	lambda.Start(func() error {
// 		date := time.Now()
// 		if err := appService.Execute(&date); err != nil {
// 			return err
// 		}
// 		return nil
// 	})
// }
import { ScheduledHandler } from 'aws-lambda'
import { AWS_REGION, DRY_RUN, TAG_KEY } from './config'
import { ServiceFactory } from './service'

// 実装オブジェクトの生成
const factory = new ServiceFactory(AWS_REGION, TAG_KEY)
const service = factory.createStartStopService(DRY_RUN)

// Lambda 本体
export const handler: ScheduledHandler = (_event, _context, callback) => {
	if (DRY_RUN) {
		console.info('Run in dry-run mode')
	}
	service
		.execute(new Date())
		.then(() => callback(null))
		.catch(callback)
}
