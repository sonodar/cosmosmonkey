import { AWSError, RDS } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'

import { getRDSTagValue } from '../../../src/service/rds/RDSTagValueParser'
import { createAwsApiMock } from '../utils'
import { mocked } from 'jest-mock'

jest.mock('aws-sdk')

export const makeListTagsForResourceResponse = (tags: RDS.TagList): PromiseResult<RDS.TagListMessage, AWSError> => ({
  $response: 'dummy' as any,
  TagList: tags,
})

describe(getRDSTagValue, () => {
  it('return tag value when TagList is contains tagName', async () => {
    const response = makeListTagsForResourceResponse([{ Key: 'AutoStartStop', Value: '+0900,09:00-21:00' }])
    const listTagsForResource = createAwsApiMock(response)
    mocked(RDS).mockImplementationOnce(() => ({ listTagsForResource } as any))

    const result = await getRDSTagValue(new RDS(), 'test', 'AutoStartStop')
    expect(result).toEqual('+0900,09:00-21:00')
  })

  it('return null when resource missing', async () => {
    const listTagsForResource = createAwsApiMock()
    mocked(RDS).mockImplementationOnce(() => ({ listTagsForResource } as any))

    const result = await getRDSTagValue(new RDS(), 'test', 'AutoStartStop')
    expect(result).toBeNull()
  })

  it('return null when empty TagList resource', async () => {
    const response = makeListTagsForResourceResponse([])
    const listTagsForResource = createAwsApiMock(response)
    mocked(RDS).mockImplementationOnce(() => ({ listTagsForResource } as any))

    const result = await getRDSTagValue(new RDS(), 'test', 'AutoStartStop')
    expect(result).toBeNull()
  })

  it('return null when TagList is not contains tagName', async () => {
    const response = makeListTagsForResourceResponse([{ Key: 'AutoStartStop', Value: '+0900,09:00-21:00' }])
    const listTagsForResource = createAwsApiMock(response)
    mocked(RDS).mockImplementationOnce(() => ({ listTagsForResource } as any))

    const result = await getRDSTagValue(new RDS(), 'test', 'hoge')
    expect(result).toBeNull()
  })
})
