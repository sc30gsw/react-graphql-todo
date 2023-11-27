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
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' },
    )

    return {
      token,
      user: newUser,
    }
  } catch (err) {
    throw new Error('Internal Server Error')
  }
}

export const login = async (
  _: unknown,
  args: { email: string; password: string },
) => {
  try {
    const { email, password } = args

    if (!email || !password) throw new Error('Invalid ID')

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) throw new Error('User not found')

    const isCorrectPassword = await bcrypt.compare(
      password,
      user.hashedPassword,
    )

    if (!isCorrectPassword) throw new Error('Password is invalid')

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' },
    )

    return { token, user }
  } catch (err) {
    throw new Error('Internal Server Error')
  }
}

export const createTodo = async (
  _: unknown,
  args: { text: string },
  context: { userId: string | null },
) => {
  try {
    if (!context.userId) throw new Error('Invalid ID')

    const newTodo = await prisma.todo.create({
      data: {
        text: args.text,
        completed: false,
        user: { connect: { id: context.userId } },
      },
      include: { user: true },
    })

    return newTodo
  } catch (err) {
    console.log(err)
    throw new Error('Internal Server Error')
  }
}
