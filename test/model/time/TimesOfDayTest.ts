import { Time, TimesOfDay } from '../../../src/model'

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
