import { ServiceFactory } from '../../src/service'
import { AutoStartStopService } from '../../src/model'

describe(ServiceFactory, () => {
  describe('#createStartStopService', () => {
    it('returns a instance of AutoStartStopService', () => {
      const factory = new ServiceFactory('ap-northeast-1', 'AutoStartStop')
      const service = factory.createStartStopService()
      expect(service).toBeInstanceOf(AutoStartStopService)
    })
  })
})
