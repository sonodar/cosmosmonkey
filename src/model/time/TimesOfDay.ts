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
