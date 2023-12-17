import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { IncomingMessage } from 'http'
import getUserId from './tokenPayload'

jest.mock('jsonwebtoken')
describe('getUserId', () => {
  const mockJwt = jest.mocked(jwt)

  beforeEach(() => mockJwt.verify.mockReset())

  it('reqの分岐で、userIdを取得できる', () => {
    const token = 'testToken'
    const userId = 'testUserId'
    mockJwt.verify.mockImplementationOnce(() => ({
      userId,
    }))
    const req: Partial<IncomingMessage> = {
      headers: { authorization: `Bearer ${token}` },
    }
    const result = getUserId(req as IncomingMessage)
    expect(result).toBe(userId)
    expect(mockJwt.verify).toHaveBeenCalledWith(
      token,
      process.env.JWT_SECRET as string,
    )
  })

  it('tokenが存在しない場合、エラーとなる', () => {
    const req: Partial<IncomingMessage> = {
      headers: { authorization: 'Bearer ' },
    }
    expect(() => getUserId(req as IncomingMessage)).toThrow(
      'Token is undefined',
    )
  })

  it('authHeaderが存在しない場合', () => {
    const req: Partial<IncomingMessage> = {
      headers: { authorization: undefined },
    }
    expect(() => getUserId(req as IncomingMessage)).toThrow(
      'Not Authentication',
    )
  })

  it('authTokenの分岐でuserIdを取得できる', () => {
    const authToken = 'testToken'
    const userId = 'testUserId'
    mockJwt.verify.mockImplementationOnce(() => ({
      userId,
    }))
    const result = getUserId(undefined, authToken)
    expect(result).toBe(userId)
    expect(mockJwt.verify).toHaveBeenCalledWith(
      authToken,
      process.env.JWT_SECRET as string,
    )
  })

  it('引数が存在しない場合、エラーとなる', () =>
    expect(() => getUserId()).toThrow('Not Authentication'))
})
