import prisma from '../libs/prisma'
import bcrypt from 'bcrypt'
import 'dotenv/config'
import jwt from 'jsonwebtoken'

export const createUser = async (
  _: unknown,
  args: { name: string; email: string; password: string },
) => {
  try {
    const { name, email, password } = args

    if (!name || !email || !password)
      throw new Error('Name, Email, or Password is required')

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) throw new Error('User already exists')

    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    })

    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET || '',
      { expiresIn: '24h' },
    )

    return {
      token,
      user: newUser,
    }
  } catch (err) {
    console.log(err)
    throw new Error('Internal Server Error')
  }
}
