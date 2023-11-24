import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { IncomingMessage } from 'http'

type TokenPayload = {
  userId: string
}

const getTokenPayload = (token: string): TokenPayload =>
  jwt.verify(token, process.env.JWT_SECRET || '') as TokenPayload

const getUserId = (req?: IncomingMessage, authToken?: string) => {
  if (req) {
    const authHeader = req.headers.authorization

    if (authHeader) {
      const token = authHeader.replace('Bearer', '')

      if (!token) {
        throw new Error('Token is undefined')
      }

      // トークンの復号
      const { userId } = getTokenPayload(token)

      return userId
    }
  } else if (authToken) {
    const { userId } = getTokenPayload(authToken)
    return userId
  }

  throw new Error('Not Authentication')
}

export default getUserId
