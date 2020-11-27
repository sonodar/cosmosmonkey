package time

import (
	"fmt"
	"testing"
	"time"
)

func Test_StartStopTime(t *testing.T) {
	t.Run("StartStopTime#ToString", func(t *testing.T) {
		td, err := NewStartStopTime("+0900", "08:00", "20:00")
		if err != nil {
			t.Fatal(err.Error())
		}
		if td.ToString() != "StartAt = 08:00+0900, StopAt = 20:00+0900" {
			t.Fatal("StartStopTime#ToString is Failed", td.ToString())
		}
	})
	t.Run("StartStopTime#ToDateTimeString", func(t *testing.T) {
		td, err := NewStartStopTime("+0900", "08:00", "20:00")
		if err != nil {
			t.Fatal(err.Error())
		}
		now := time.Now()
		date := now.Format(DateFormat)
		if td.ToDateTimeString(&now) != fmt.Sprintf("StartAt = %s 08:00+0900, StopAt = %s 20:00+0900", date, date) {
			t.Fatal("StartStopTime#ToDateTimeString is Failed", td.ToDateTimeString(&now))
		}
	})
}
