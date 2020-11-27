// const (
// TimeParseFormat = "15:04"
// )
//
// // 型
//
// /**
//  * 開始終了時刻を表す構造体。
//  */
// type StartStopTime struct {
//   startAt TimesOfDay
//   stopAt  TimesOfDay
// }
//
// // Public methods
//
// func NewStartStopTime(offset string, startAt string, stopAt string) (*StartStopTime, error) {
//   startTime, err := time.Parse(TimeParseFormat, startAt)
//   if err != nil {
//     return nil, err
//   }
//
//   stopTime, err := time.Parse(TimeParseFormat, stopAt)
//   if err != nil {
//     return nil, err
//   }
//
//   if offsetValue, err := strconv.Atoi(offset); err != nil {
//     return nil, err
//   } else {
//     return &StartStopTime{
//       startAt: newTimesOfDay(startTime, offsetValue),
//           stopAt:  newTimesOfDay(stopTime, offsetValue),
//     }, nil
//   }
// }
//
// func (this *StartStopTime) ToString() string {
//   return fmt.Sprintf("StartAt = %s, StopAt = %s",
//       this.startAt.toString(),
//       this.stopAt.toString())
// }
//
// func (this *StartStopTime) ToDateTimeString(date *time.Time) string {
//   startAt := this.startAt.toDateTime(date)
//   stopAt := this.stopAt.toDateTime(date)
//   return fmt.Sprintf("StartAt = %s, StopAt = %s",
//       startAt.Format(DateTimeFormat),
//       stopAt.Format(DateTimeFormat))
// }
//
// /**
//  * 指定時刻において開始しているべきかどうかを返す。
//  */
// func (this *StartStopTime) ShouldBeStarted(date *time.Time) bool {
//   return this.isNowInRange(date)
// }
//
// /**
//  * 指定時刻において停止しているべきかどうかを返す。
//  */
// func (this *StartStopTime) ShouldBeStopped(date *time.Time) bool {
//   return !this.isNowInRange(date)
// }
//
// // Private methods
//
// func (this *StartStopTime) isNowInRange(date *time.Time) bool {
//   return date.After(this.startAt.toDateTime(date)) && date.Before(this.stopAt.toDateTime(date))
// }
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
