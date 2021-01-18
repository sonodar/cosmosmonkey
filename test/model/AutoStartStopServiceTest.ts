import { StartStopTime, Time, TimesOfDay, Resource, ResourceType, AutoStartStopService } from '../../src/model'
import { MockResourceManager } from './resource/MockResourceManager'
import { resourceToString } from '../../src/model/resource/ResourceManager'

const makeTimes = (start: number, stop: number) => new StartStopTime(900, new Time(start, 0), new Time(stop, 0))

const start: Resource = {
  startStopTime: makeTimes(9, 21),
  type: ResourceType.EC2_INSTANCE,
  id: '1',
  name: '起動可能',
  canStart: true,
  canStop: false,
}
const stop: Resource = {
  startStopTime: makeTimes(2, 8),
  type: ResourceType.EC2_INSTANCE,
  id: '2',
  name: '停止可能',
  canStart: false,
  canStop: true,
}
const noop: Resource = {
  startStopTime: makeTimes(9, 21),
  type: ResourceType.EC2_INSTANCE,
  id: '3',
  name: '何もしない',
  canStart: false,
  canStop: false,
}

const mockStart = jest.fn()
const mockStop = jest.fn()
const manager = new MockResourceManager(ResourceType.EC2_INSTANCE, [start, stop, noop], mockStart, mockStop)

const baseDate = new TimesOfDay(new Time(10, 0), 900).toDateTime(new Date())

describe(AutoStartStopService, () => {
  beforeEach(() => {
    mockStart.mockReset()
    mockStop.mockReset()
  })

  describe('execute', () => {
    it('called start, stop function', async () => {
      await new AutoStartStopService(manager).execute(baseDate)

      expect(manager.start).toBeCalledTimes(1)
      expect(manager.start).lastCalledWith(start)

      expect(manager.stop).toBeCalledTimes(1)
      expect(manager.stop).lastCalledWith(stop)
    })

    it('not called start, stop function, when dry-run', async () => {
      console.debug = jest.fn()
      console.info = jest.fn()

      await new AutoStartStopService(manager, true).execute(baseDate)

      expect(manager.start).not.toBeCalled()
      expect(manager.stop).not.toBeCalled()

      expect(console.info).toBeCalledTimes(2)
      expect(console.info).nthCalledWith(1, `DRY RUN: Called start operation for ${resourceToString(start)}`)
      expect(console.info).nthCalledWith(2, `DRY RUN: Called stop operation for ${resourceToString(stop)}`)

      expect(console.debug).toBeCalledTimes(1)
      expect(console.debug).lastCalledWith(`Resource (${resourceToString(noop)}) has nothing to do`)
    })
  })
})
