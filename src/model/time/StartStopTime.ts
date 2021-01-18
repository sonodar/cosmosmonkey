import { TimesOfDay } from './TimesOfDay'
import { Time } from './Time'

/**
 * 開始終了の時刻を表す値オブジェクト。
 */
export class StartStopTime {
  private readonly startAt: TimesOfDay
  private readonly stopAt: TimesOfDay

  constructor(offset: number, startAt: Time, stopAt: Time) {
    this.startAt = new TimesOfDay(startAt, offset)
    this.stopAt = new TimesOfDay(stopAt, offset)
  }

  /**
   * 指定時刻において開始しているべきかどうかを返す。
   */
  public shouldBeStarted(date: Date): boolean {
    return this._isNowInRange(date)
  }

  /**
   * 指定時刻において停止しているべきかどうかを返す。
   */
  public shouldBeStopped(date: Date): boolean {
    return !this._isNowInRange(date)
  }

  public toString(): string {
    return this._dateTimeString()
  }

  public toISOString(date: Date): string {
    return this._dateTimeString(date)
  }

  private _isNowInRange(date: Date): boolean {
    return (
      this.startAt.toDateTime(date).getTime() < date.getTime() &&
      this.stopAt.toDateTime(date).getTime() > date.getTime()
    )
  }

  private _dateTimeString(date: Date | null = null): string {
    const startAt = date ? this.startAt.toDateTime(date).toISOString() : this.startAt.toString()
    const stopAt = date ? this.stopAt.toDateTime(date).toISOString() : this.stopAt.toString()
    return `StartAt = ${startAt}, StopAt = ${stopAt}`
  }
}
