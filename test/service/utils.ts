import { StartStopTime, Time } from '../../src/model'

export const tagName = 'AutoStartStop'
export const defaultStartStopTime = new StartStopTime(900, Time.parse('09:00'), Time.parse('19:00'))

const returnPromise = (ret?: any) => ({ promise: () => Promise.resolve(ret) })

export function createMockAwsApi(...results: any[]) {
  if (results.length === 0) {
    return jest.fn(() => returnPromise())
  }
  const mock = jest.fn()
  for (const result of results) {
    mock.mockImplementationOnce(() => returnPromise(result))
  }
  return mock
}

export const createAwsApiMock = (...returns: any[]) => {
  if (returns.length === 0) {
    return jest.fn(() => returnPromise())
  }
  const mock = jest.fn()
  for (const ret of returns) {
    mock.mockImplementationOnce(() => returnPromise(ret))
  }
  return mock
}
