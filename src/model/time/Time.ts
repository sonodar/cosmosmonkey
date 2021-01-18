import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

/**
 * 時分を表す値オブジェクト。秒を持たない。
 */
export class Time {
  constructor(public readonly hour: number, public readonly minute: number) {}

  public toString(): string {
    return dayjs().set('hour', this.hour).set('minute', this.minute).format('HH:mm:00')
  }

  public static parse(time: string): Time {
    const maybeTime = dayjs(time, 'HH:mm', true)
    if (!maybeTime.isValid()) {
      throw new Error(`Invalid time format, expected format is "HH:mm", but "${time}"`)
    }
    const date = maybeTime.toDate()
    return new Time(date.getHours(), date.getMinutes())
  }
}
