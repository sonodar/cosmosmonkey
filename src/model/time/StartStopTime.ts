package time

import (
	"fmt"
	"strconv"
	"time"
)

const (
	TimeParseFormat = "15:04"
)

// 型

/**
 * 開始終了時刻を表す構造体。
 */
type StartStopTime struct {
	startAt TimesOfDay
	stopAt  TimesOfDay
}

// Public methods

func NewStartStopTime(offset string, startAt string, stopAt string) (*StartStopTime, error) {
	startTime, err := time.Parse(TimeParseFormat, startAt)
	if err != nil {
		return nil, err
	}

	stopTime, err := time.Parse(TimeParseFormat, stopAt)
	if err != nil {
		return nil, err
	}

	if offsetValue, err := strconv.Atoi(offset); err != nil {
		return nil, err
	} else {
		return &StartStopTime{
			startAt: newTimesOfDay(startTime, offsetValue),
			stopAt:  newTimesOfDay(stopTime, offsetValue),
		}, nil
	}
}

func (this *StartStopTime) ToString() string {
	return fmt.Sprintf("StartAt = %s, StopAt = %s",
		this.startAt.toString(),
		this.stopAt.toString())
}

func (this *StartStopTime) ToDateTimeString(date *time.Time) string {
	startAt := this.startAt.toDateTime(date)
	stopAt := this.stopAt.toDateTime(date)
	return fmt.Sprintf("StartAt = %s, StopAt = %s",
		startAt.Format(DateTimeFormat),
		stopAt.Format(DateTimeFormat))
}

/**
 * 指定時刻において開始しているべきかどうかを返す。
 */
func (this *StartStopTime) ShouldBeStarted(date *time.Time) bool {
	return this.isNowInRange(date)
}

/**
 * 指定時刻において停止しているべきかどうかを返す。
 */
func (this *StartStopTime) ShouldBeStopped(date *time.Time) bool {
	return !this.isNowInRange(date)
}

// Private methods

func (this *StartStopTime) isNowInRange(date *time.Time) bool {
	return date.After(this.startAt.toDateTime(date)) && date.Before(this.stopAt.toDateTime(date))
}
