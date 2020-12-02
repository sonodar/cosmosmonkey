import { ChainResourceManager, Resource, ResourceType, StartStopTime, Time } from 'models'
import { MockResourceManager } from './MockResourceManager'

const startStopTime = new StartStopTime(900, new Time(9, 0), new Time(21, 0))
const makeResource = (type: ResourceType, name: string) => ({
  startStopTime,
  type,
  id: name,
  name,
  canStart: false,
  canStop: false,
})

const ec2_1 = makeResource(ResourceType.EC2_INSTANCE, 'EC2-1')
const ec2_2 = makeResource(ResourceType.EC2_INSTANCE, 'EC2-2')
const rds_1 = makeResource(ResourceType.RDS_INSTANCE, 'RDS-1')
const rds_2 = makeResource(ResourceType.RDS_INSTANCE, 'RDS-2')
const aurora_1 = makeResource(ResourceType.RDS_CLUSTER, 'AURORA-1')
const aurora_2 = makeResource(ResourceType.RDS_CLUSTER, 'AURORA-2')
const unsupported: Resource = makeResource(ResourceType.ALL_SUPPORTED, 'サポート外')

const createMockManager = (type: ResourceType, ...resources: Resource[]) => {
  return new MockResourceManager(type, resources, jest.fn(), jest.fn())
}

const ec2 = createMockManager(ResourceType.EC2_INSTANCE, ec2_1, ec2_2)
const rds = createMockManager(ResourceType.RDS_INSTANCE, rds_1, rds_2)
const aurora = createMockManager(ResourceType.RDS_CLUSTER, aurora_1, aurora_2)
const manager = new ChainResourceManager(ec2, rds, aurora)

describe(ChainResourceManager, () => {
  describe('eachResources', () => {
    it('追加したすべてのResourceManagerのeachResourcesが呼び出されること', async () => {
      const callback = jest.fn()
      await manager.eachResources(callback)
      expect(callback).nthCalledWith(1, ec2_1)
      expect(callback).nthCalledWith(2, ec2_2)
      expect(callback).nthCalledWith(3, rds_1)
      expect(callback).nthCalledWith(4, rds_2)
      expect(callback).nthCalledWith(5, aurora_1)
      expect(callback).nthCalledWith(6, aurora_2)
    })
  })

  describe('start', () => {
    it('リソースに応じた開始処理が呼び出されること', async () => {
      await manager.start(ec2_1)
      expect(ec2.start).lastCalledWith(ec2_1)
      await manager.start(rds_1)
      expect(rds.start).lastCalledWith(rds_1)
    })
    it('サポート外のリソースに対しては何もしない', async () => {
      console.warn = jest.fn()
      await manager.start(unsupported)
      expect(console.warn).lastCalledWith(unsupported.type + ' is not supported type')
    })
  })

  describe('stop', () => {
    it('リソースに応じた停止処理が呼び出されること', async () => {
      await manager.stop(rds_1)
      expect(rds.stop).lastCalledWith(rds_1)
      await manager.stop(aurora_1)
      expect(aurora.stop).lastCalledWith(aurora_1)
    })
    it('サポート外のリソースに対しては何もしない', async () => {
      console.warn = jest.fn()
      await manager.stop(unsupported)
      expect(console.warn).lastCalledWith(unsupported.type + ' is not supported type')
    })
  })
})
