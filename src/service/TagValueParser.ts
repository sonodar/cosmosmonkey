import { StartStopTime, Time } from '../model'

export type TagValue = {
  startStopTime: StartStopTime
  config: Record<string, string>
}

export class TagValueParser {
  public static parse(value?: string | null): TagValue | null {
    if (!value) return null

    const ret = parseValue(value)

    if (!ret) {
      console.warn('invalid tag value:', value)
      return null
    }

    const offset = parseInt(ret.offset)
    const startAt = Time.parse(ret.startAt)
    const stopAt = Time.parse(ret.stopAt)

    return {
      startStopTime: new StartStopTime(offset, startAt, stopAt),
      config: ret.config,
    }
  }
}

function parseValue(value: string) {
  const matcher = /^([-+]\d{3,4}),(\d{2}:\d{2})-(\d{2}:\d{2})/.exec(value)
  if (!matcher) return null
  const [, offset, startAt, stopAt] = Array.from(matcher)
  const config = getConfig(value)
  return { offset, startAt, stopAt, config }
}

function getConfig(value: string): Record<string, string> {
  const config: Record<string, string> = {}
  const pattern = /(?:([^,=\s]+)?\s*=\s*([^,\s]+))/g
  let matcher = null
  while ((matcher = pattern.exec(value))) {
    const [, name, value] = Array.from(matcher)
    config[name] = value
  }
  return config
}
