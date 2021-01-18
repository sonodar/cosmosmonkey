import { Time, StartStopTime } from '../../../src/model'

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
