// func Test_TimesOfDay(t *testing.T) {
// 	t.Run("TimesOfDay#toString", func(t *testing.T) {
// 		date := time.Date(2019, 3, 6, 12, 30, 0, 0, time.UTC)
// 		target := newTimesOfDay(date, 900)
// 		if target.toString() != "12:30+0900" {
// 			t.Fatal("TimesOfDay#toString is Failed", target.toString())
// 		}
// 	})
// 	t.Run("TimesOfDay#toDateTime", func(t *testing.T) {
// 		date := time.Date(2019, 3, 6, 12, 30, 0, 0, time.UTC)
// 		target := newTimesOfDay(date, 900)
// 		datetime := target.toDateTime(&date)
// 		if datetime.Format(DateTimeFormat) != "2019-03-06 12:30:00+0900" {
// 			t.Fatal("TimesOfDay#toDateTime is Failed", datetime.Format(DateTimeFormat))
// 		}
// 	})
// }
import { Time, TimesOfDay } from 'models'

describe(TimesOfDay, () => {
  describe('toString', () => {
    it('HH:mm:ss+0000形式の文字列が返ること', () => {
      const timesOfDay = new TimesOfDay(new Time(12, 15), 900)
      expect(timesOfDay.toString()).toEqual('12:15:00+0900')
    })
    it('HH:mm:ss-0000形式の文字列が返ること', () => {
      const timesOfDay = new TimesOfDay(new Time(12, 15), -900)
      expect(timesOfDay.toString()).toEqual('12:15:00-0900')
    })
    it('UTCの場合はHH:mm:ssZ形式の文字列が返ること', () => {
      const timesOfDay = new TimesOfDay(new Time(12, 15), 0)
      expect(timesOfDay.toString()).toEqual('12:15:00Z')
    })
  })

  describe('toDateTime', () => {
    it('指定した日付における時刻のDateインスタンスが返ること', () => {
      const date = new Date(2000, 10, 25)
      date.setHours(12, 15, 0, 0)
      const timesOfDay = new TimesOfDay(new Time(12, 15), 900)
      expect(timesOfDay.toDateTime(date)).toEqual(date)
    })
  })
})
