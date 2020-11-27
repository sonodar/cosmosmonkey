// const (
// 	TimeFormat     = "%02d:%02d%s"
// 	DateFormat     = "2006-01-02"
// 	DateTimeFormat = "2006-01-02 15:04-0700"
// )
//
// /**
//  * 時刻を表す構造体。メンバーは外部非公開。
//  */
// type TimesOfDay struct {
// 	hour   int
// 	minute int
// 	offset int
// }
//
// // Package scope methods
//
// /**
//  * HH:mm:ssZ の形式の文字列を返す。ただし、秒は必ず "00" となる。 (例: "12:30:00+0900")
//  */
// func (this *TimesOfDay) toString() string {
// 	return fmt.Sprintf(TimeFormat, this.hour, this.minute, _toOffsetString(this.offset))
// }
//
// /**
//  * 指定した日付における `time.Time` に変換する。
//  */
// func (this *TimesOfDay) toDateTime(date *time.Time) time.Time {
// 	dateTimeString := fmt.Sprintf("%s %s", _toDateString(date), this.toString())
// 	dateTime, _ := time.Parse(DateTimeFormat, dateTimeString)
// 	return dateTime
// }
//
// /**
//  * 時刻を生成する。
//  */
// func newTimesOfDay(time time.Time, offset int) TimesOfDay {
// 	return TimesOfDay{hour: time.Hour(), minute: time.Minute(), offset: offset}
// }
//
// // Private functions
//
// func _toDateString(t *time.Time) string {
// 	return t.Format(DateFormat)
// }
//
// func _toOffsetString(offset int) string {
// 	var prefix = "+"
// 	if offset < 0 {
// 		prefix = "-"
// 	}
// 	var abs = int(math.Abs(float64(offset)))
// 	return fmt.Sprintf("%s%04d", prefix, abs)
// }

import dayjs from 'dayjs'
import { Time } from './Time'

const offsetFormatter = new Intl.NumberFormat('ja', { useGrouping: false, minimumIntegerDigits: 4 })

/**
 * 日付を持たないオフセット付きの時刻を表す値オブジェクト。
 */
export class TimesOfDay {
  constructor(private readonly time: Time, private readonly offset: number) {}

  /**
   * 指定した日付におけるタイムスタンプに変換する。
   */
  public toDateTime(date: Date): Date {
    const isoTimestamp = `${dayjs(date).format('YYYY-MM-DD')}T${this.toString()}`
    return new Date(isoTimestamp)
  }

  /**
   * "HH:mm:ss+0900"形式の文字列に変換する。（ただし、秒は必ず 00）
   */
  public toString(): string {
    const hm = this.time.toString()
    if (this.offset === 0) return `${hm}Z`
    return `${hm}${toOffsetString(this.offset)}`
  }
}

function toOffsetString(offset: number): string {
  const prefix = offset < 0 ? '-' : '+'
  const abs = Math.abs(offset)
  return `${prefix}${offsetFormatter.format(abs)}`
}
