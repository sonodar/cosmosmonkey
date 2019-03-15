package time

import (
	"testing"
	"time"
)

func Test_TimesOfDay(t *testing.T) {
	t.Run("TimesOfDay#toString", func(t *testing.T) {
		date := time.Date(2019, 3, 6, 12, 30, 0, 0, time.UTC)
		target := newTimesOfDay(date, 900)
		if target.toString() != "12:30+0900" {
			t.Fatal("TimesOfDay#toString is Failed", target.toString())
		}
	})
	t.Run("TimesOfDay#toDateTime", func(t *testing.T) {
		date := time.Date(2019, 3, 6, 12, 30, 0, 0, time.UTC)
		target := newTimesOfDay(date, 900)
		datetime := target.toDateTime(&date)
		if datetime.Format(DateTimeFormat) != "2019-03-06 12:30:00+0900" {
			t.Fatal("TimesOfDay#toDateTime is Failed", datetime.Format(DateTimeFormat))
		}
	})
}
