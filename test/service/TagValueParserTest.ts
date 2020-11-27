import { TagValueParser } from '../../src/service/TagValueParser'
import { StartStopTime } from '../../src/model'

describe(TagValueParser, () => {
  it('return StartStopTime and config object when valid value', () => {
    const value: any = TagValueParser.parse('+0900,08:21-22:54,min=2,max=4,capacity=2')
    expect(value).not.toBeNull()
    const startStopTime: StartStopTime = value.startStopTime
    expect(startStopTime.toString()).toEqual('StartAt = 08:21:00+0900, StopAt = 22:54:00+0900')
    expect(value.config).toMatchObject({ min: '2', max: '4', capacity: '2' })
  })

  it('return null when invalid value', () => {
    const value: any = TagValueParser.parse('hoge')
    expect(value).toBeNull()
  })
})
