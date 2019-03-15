package util

import (
	"errors"
	"fmt"
	"github.com/sonodar/cosmosmonkey/domain/time"
	"regexp"
	"strconv"
)

var keyValuesPattern = regexp.MustCompile(`(?:([^,=\s]+)?\s*=\s*([^,\s]+))`)
var startStopTimePattern = regexp.MustCompile(`^([\-+]\d{4}),(\d+:\d+)-(\d+:\d+)$`)

func ToInt64P(value string) *int64 {
	if num, err := strconv.ParseInt(value, 10, 64); err != nil {
		return nil
	} else {
		return &num
	}
}

func ParseKeyValues(value string) map[string]string {
	results := map[string]string{}
	matches := keyValuesPattern.FindAllStringSubmatch(value, -1)
	for _, match := range matches {
		results[match[1]] = match[2]
	}
	return results
}

func ParseStartStopTime(value string) (*time.StartStopTime, error) {
	if !startStopTimePattern.MatchString(value) {
		return nil, errors.New(fmt.Sprintf("'%s' is invalid Start/Stop Time", value))
	}
	matches := startStopTimePattern.FindStringSubmatch(value)
	stopAt := string(matches[3])
	startAt := string(matches[2])
	offset := string(matches[1])
	startStopTime, err := time.NewStartStopTime(offset, startAt, stopAt)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("'%s' is invalid Start/Stop Time, %v", value, err))
	}
	return startStopTime, nil
}
