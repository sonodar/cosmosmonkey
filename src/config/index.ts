const DefaultTagKey = 'AutoStartStop'

// func getEnvOr(name string, defaultValue string) string {
// 	value := os.Getenv(name)
// 	if value == "" {
// 		return defaultValue
// 	}
// 	return value
// }
//
// // 環境変数
// var (
// 	Region      = os.Getenv("AWS_REGION")
// 	TagKey      = getEnvOr("AUTO_START_STOP_TAG_KEY", DefaultTagKey)
// 	LogLocation = getEnvOr("LOGGING_TZ", "UTC")
// 	DryRun      = getEnvOr("DRY_RUN", "false") == "true"
// )

// 環境変数
export const AWS_REGION = process.env.AWS_REGION || ''
export const TAG_KEY = process.env.AUTO_START_STOP_TAG_KEY || DefaultTagKey
export const DRY_RUN = !!process.env.DRY_RUN && process.env.DRY_RUN !== 'false'
