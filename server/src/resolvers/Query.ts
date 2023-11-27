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
    throw new Error('Internal Server Error')
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
      include: { user: true },
    })

    return todos
  } catch (err) {
    throw new Error('Internal Server Error')
  }
}
