// https://www.it-swarm-ja.tech/ja/node.js/jest%E3%81%A7processenv%E3%82%92%E3%83%86%E3%82%B9%E3%83%88%E3%81%99%E3%82%8B/836809277/
describe('environmental variables', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules() // this is important - it clears the cache
    process.env = { ...OLD_ENV }
    delete process.env.NODE_ENV
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  it('will receive process.env variables', () => {
    process.env.AWS_REGION = 'us-east-1'
    process.env.AUTO_START_STOP_TAG_KEY = 'hoge'
    process.env.DRY_RUN = '1'

    const { AWS_REGION, TAG_KEY, DRY_RUN } = require('../../src/config')

    expect(AWS_REGION).toEqual('us-east-1')
    expect(TAG_KEY).toEqual('hoge')
    expect(DRY_RUN).toBeTruthy()
  })

  it('will receive default values if process.env variables are empty', () => {
    delete process.env.AWS_REGION
    delete process.env.AUTO_START_STOP_TAG_KEY
    delete process.env.DRY_RUN

    const { AWS_REGION, TAG_KEY, DRY_RUN } = require('../../src/config')

    expect(AWS_REGION).toEqual('')
    expect(TAG_KEY).toEqual('AutoStartStop')
    expect(DRY_RUN).toBeFalsy()
  })
})
