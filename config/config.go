package config

import (
	"os"
)

const DefaultTagKey = "AutoStartStop"

func getEnvOr(name string, defaultValue string) string {
	value := os.Getenv(name)
	if value == "" {
		return defaultValue
	}
	return value
}

// 環境変数
var (
	Region      = os.Getenv("AWS_REGION")
	TagKey      = getEnvOr("AUTO_START_STOP_TAG_KEY", DefaultTagKey)
	LogLocation = getEnvOr("LOGGING_TZ", "UTC")
	DryRun      = getEnvOr("DRY_RUN", "false") == "true"
)
