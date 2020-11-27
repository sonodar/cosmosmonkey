import { ServiceFactory } from '../src/service'
jest.mock('aws-sdk')

const event = {} as any
const context = {} as any

describe('handler', () => {
  it('called ServiceFactory#createStartStopService, and StartStopService#execute', async () => {
    const execute = jest.fn(date => Promise.resolve(date))
    const startStopService = { execute } as any
    const createStartStopService = jest
      .spyOn(ServiceFactory.prototype, 'createStartStopService')
      .mockReturnValueOnce(startStopService)
    const callback = jest.fn()

    console.info = jest.fn()
    process.env.DRY_RUN = 'true'

    const { handler } = require('../src')
    await handler(event, context, callback)

    expect(createStartStopService).toBeCalled()
    expect(callback).lastCalledWith(null)
    expect(console.info).nthCalledWith(1, 'Run in dry-run mode')
  })
})
