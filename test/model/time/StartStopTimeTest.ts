// func Test_StartStopTime(t *testing.T) {
// 	t.Run("StartStopTime#ToString", func(t *testing.T) {
// 		td, err := NewStartStopTime("+0900", "08:00", "20:00")
// 		if err != nil {
// 			t.Fatal(err.Error())
// 		}
// 		if td.ToString() != "StartAt = 08:00+0900, StopAt = 20:00+0900" {
// 			t.Fatal("StartStopTime#ToString is Failed", td.ToString())
// 		}
// 	})
// 	t.Run("StartStopTime#ToDateTimeString", func(t *testing.T) {
// 		td, err := NewStartStopTime("+0900", "08:00", "20:00")
// 		if err != nil {
// 			t.Fatal(err.Error())
// 		}
// 		now := time.Now()
// 		date := now.Format(DateFormat)
// 		if td.ToDateTimeString(&now) != fmt.Sprintf("StartAt = %s 08:00+0900, StopAt = %s 20:00+0900", date, date) {
// 			t.Fatal("StartStopTime#ToDateTimeString is Failed", td.ToDateTimeString(&now))
// 		}
// 	})
// }
import { Time, StartStopTime } from 'models'

describe(StartStopTime, () => {
  const startStopTime = new StartStopTime(900, new Time(9, 15), new Time(12, 25))

  describe('toString', () => {
    it('開始・終了の時刻文字列を返すこと', () => {
      expect(startStopTime.toString()).toEqual('StartAt = 09:15:00+0900, StopAt = 12:25:00+0900')
    })
  })
  describe('toISOString', () => {
    it('開始・終了の時刻文字列を返すこと', () => {
      const date = new Date(2000, 10, 25)
      expect(startStopTime.toISOString(date)).toEqual(
        'StartAt = 2000-11-25T00:15:00.000Z, StopAt = 2000-11-25T03:25:00.000Z'
      )
    })
  })
  describe('shouldBeStarted', () => {
    it('開始時刻を過ぎていれば true を返すこと', () => {
      const inRange = new Date(2000, 10, 25)
      inRange.setHours(9, 16)
      expect(startStopTime.shouldBeStarted(inRange)).toBeTruthy()

      const outRange = new Date(2000, 10, 25)
      outRange.setHours(9, 14)
      expect(startStopTime.shouldBeStarted(outRange)).toBeFalsy()
    })
  })
  describe('shouldBeStopped', () => {
    it('終了時刻を過ぎていれば true を返すこと', () => {
      const inRange = new Date(2000, 10, 25)
      inRange.setHours(12, 26)
      expect(startStopTime.shouldBeStopped(inRange)).toBeTruthy()

      const outRange = new Date(2000, 10, 25)
      outRange.setHours(12, 24)
      expect(startStopTime.shouldBeStopped(outRange)).toBeFalsy()
    })
  })
})
