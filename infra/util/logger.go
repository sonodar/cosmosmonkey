package util

import (
	"fmt"
	"log"
	"os"
	"regexp"
	"runtime"
	"strings"
)

var pathPrefixPattern = regexp.MustCompile(`^.+\/github.com\/sonodar\/cosmosmonkey\/`)

type logLevel int

const (
	debugLevel logLevel = iota
	infoLevel
	warnLevel
	errorLevel
	disableLevel
)

func toRelative(path string) string {
	return pathPrefixPattern.ReplaceAllString(path, "")
}

func parseLogLevel() logLevel {
	switch strings.ToLower(os.Getenv("LOG_LEVEL")) {
	case "debug":
		return debugLevel
	case "info":
		return infoLevel
	case "warn", "warning":
		return warnLevel
	case "error", "fatal":
		return errorLevel
	case "disabled", "off", "false":
		return disableLevel
	default:
		return infoLevel
	}
}

var currentLogLevel = parseLogLevel()

func logf(prefix string, message string, args ...interface{}) {
	if len(args) > 0 {
		message = fmt.Sprintf(message, args...)
	}
	if _, file, line, ok := runtime.Caller(2); ok {
		log.Printf("%s: [%s:%d] - %s", prefix, toRelative(file), line, message)
	} else {
		log.Printf("%s: [unknown:] - %s", prefix, message)
	}
}

func logln(prefix string, args ...interface{}) {
	message := fmt.Sprintln(args...)
	if _, file, line, ok := runtime.Caller(2); ok {
		log.Printf("%s: [%s:%d] - %s", prefix, toRelative(file), line, message)
	} else {
		log.Printf("%s: [unknown:] - %s", prefix, message)
	}
}

func Debugf(message string, args ...interface{}) {
	if currentLogLevel > debugLevel {
		return
	}
	logf("debug", message, args...)
}

func Infof(message string, args ...interface{}) {
	if currentLogLevel > infoLevel {
		return
	}
	logf("info", message, args...)
}

func Warnf(message string, args ...interface{}) {
	if currentLogLevel > warnLevel {
		return
	}
	logf("warn", message, args...)
}

func Errorf(message string, args ...interface{}) {
	if currentLogLevel > errorLevel {
		return
	}
	logf("error", message, args...)
}

func Debugln(args ...interface{}) {
	if currentLogLevel > debugLevel {
		return
	}
	logln("debug", args...)
}

func Infoln(args ...interface{}) {
	if currentLogLevel > infoLevel {
		return
	}
	logln("info", args...)
}

func Warnln(args ...interface{}) {
	if currentLogLevel > warnLevel {
		return
	}
	logln("warn", args...)
}

func Errorln(args ...interface{}) {
	if currentLogLevel > errorLevel {
		return
	}
	logln("error", args...)
}
