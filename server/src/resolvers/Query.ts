import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import prisma from '../libs/prisma'

export const user = async (
  _: unknown,
  __: unknown,
  context: { userId: string | null },
) => {
  try {
    if (!context.userId) throw new Error('Invalid ID')

    const user = await prisma.user.findUnique({
      where: { id: context.userId },
      include: { todos: true },
    })

    return user
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError)
      throw new Error('Internal Server Error')

    throw err
  }
}

export const todos = async (
  _: unknown,
  __: unknown,
  context: { userId: string | null },
) => {
  try {
    if (!context.userId) throw new Error('Invalid ID')

    const todos = await prisma.todo.findMany({
      where: { userId: context.userId },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    })

    return todos
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError)
      throw new Error('Internal Server Error')

    throw err
  }
}

export const todo = async (
  _: unknown,
  args: { todoId: string },
  context: { userId: string | null },
) => {
  try {
    if (!args.todoId || !context.userId) throw new Error('Invalid ID')

    const todo = await prisma.todo.findUnique({
      where: { id: args.todoId },
      include: { user: true },
    })

    if (!todo) throw new Error('Todo not found')

    return todo
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError)
      throw new Error('Internal Server Error')

    throw err
  }
}
