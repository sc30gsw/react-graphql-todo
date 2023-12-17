import { Todo, User } from '@prisma/client'
import prisma from '../libs/prisma'
import { todo, todos, user } from './Query'

const setup = () => {
  const todos: Todo[] = [
    {
      id: '1',
      text: 'test1',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: '1',
    },
    {
      id: '2',
      text: 'test2',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: '1',
    },
  ]

  const testUser: User & { todos: Todo[] } = {
    id: '1',
    name: 'testUser1',
    email: 'test1@co.com',
    hashedPassword: 'password',
    createdAt: new Date(),
    updatedAt: new Date(),
    todos: todos,
  }

  const testTodos: (Todo & { user: User })[] = todos.map((todo) => ({
    ...todo,
    user: testUser,
  }))

  const testTodo: Todo & { user: User } = testTodos[0]

  return { testUser, testTodos, testTodo }
}

jest.mock('../libs/prisma', () => ({
  user: {
    findUnique: jest.fn(),
  },
  todo: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
}))

describe('Query', () => {
  const mockPrisma = jest.mocked(prisma)

  beforeEach(() => {
    mockPrisma.user.findUnique.mockReset()
    mockPrisma.todo.findMany.mockReset()
    mockPrisma.todo.findUnique.mockReset()
  })

  describe('user', () => {
    it('ユーザーが返却される', async () => {
      const { testUser } = setup()
      mockPrisma.user.findUnique.mockResolvedValueOnce(testUser)
      const result = await user('', '', { userId: testUser.id })
      expect(result).toEqual(testUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: testUser.id },
        include: { todos: true },
      })
    })

    it('context.userIdが存在しない場合、エラーとなる', async () =>
      await expect(user('', '', { userId: null })).rejects.toThrow(
        'Invalid ID',
      ))

    it('prismaでエラーが発生した場合、「Internal Server Error」がthrowされる', async () => {
      const { testUser } = setup()
      mockPrisma.user.findUnique.mockRejectedValueOnce(
        new Error('Internal Server Error'),
      )
      await expect(user('', '', { userId: testUser.id })).rejects.toThrow(
        'Internal Server Error',
      )
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: testUser.id },
        include: { todos: true },
      })
    })
  })

  describe('todos', () => {
    it('todosが返却される', async () => {
      const { testTodos, testUser } = setup()
      mockPrisma.todo.findMany.mockResolvedValueOnce(testTodos)
      const result = await todos('', '', { userId: testUser.id })
      expect(result).toEqual(testTodos)
      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      })
    })

    it('context.userIdが存在しない場合、エラーとなる', async () =>
      await expect(todos('', '', { userId: null })).rejects.toThrow(
        'Invalid ID',
      ))

    it('prismaでエラーが発生した場合、「Internal Server Error」がthrowされる', async () => {
      const { testUser } = setup()
      mockPrisma.todo.findMany.mockRejectedValueOnce(
        new Error('Internal Server Error'),
      )
      await expect(todos('', '', { userId: testUser.id })).rejects.toThrow(
        'Internal Server Error',
      )
      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      })
    })
  })

  describe('todo', () => {
    it('todoが返却される', async () => {
      const { testTodo, testUser } = setup()
      mockPrisma.todo.findUnique.mockResolvedValueOnce(testTodo)
      const result = await todo(
        '',
        { todoId: testTodo.id },
        { userId: testUser.id },
      )
      expect(result).toEqual(testTodo)
      expect(mockPrisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: testTodo.id },
        include: { user: true },
      })
    })

    it('context.userIdが存在しない場合、エラーとなる', async () => {
      const { testTodo } = setup()
      await expect(
        todo('', { todoId: testTodo.id }, { userId: null }),
      ).rejects.toThrow('Invalid ID')
    })

    it('args.todoIdが存在しない場合、エラーとなる', async () => {
      const { testUser } = setup()
      await expect(
        todo('', { todoId: '' }, { userId: testUser.id }),
      ).rejects.toThrow('Invalid ID')
    })

    it('todoが存在しない場合、エラーとなる', async () => {
      const { testTodo, testUser } = setup()
      mockPrisma.todo.findUnique.mockResolvedValueOnce(null)
      await expect(
        todo('', { todoId: testTodo.id }, { userId: testUser.id }),
      ).rejects.toThrow('Todo not found')
    })

    it('prismaでエラーが発生した場合、「Internal Server Error」がthrowされる', async () => {
      const { testTodo, testUser } = setup()
      mockPrisma.todo.findUnique.mockRejectedValueOnce(
        new Error('Internal Server Error'),
      )
      await expect(
        todo('', { todoId: testTodo.id }, { userId: testUser.id }),
      ).rejects.toThrow('Internal Server Error')
      expect(mockPrisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: testTodo.id },
        include: { user: true },
      })
    })
  })
})
