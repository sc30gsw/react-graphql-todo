import { Todo, User } from '@prisma/client'
import prisma from '../libs/prisma'
import bcrypt from 'bcrypt'
import 'dotenv/config'
import jwt from 'jsonwebtoken'
import {
  createTodo,
  createUser,
  deleteTodo,
  login,
  updateTodo,
} from './Mutation'

jest.mock('../libs/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  todo: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))
jest.mock('bcrypt')
jest.mock('jsonwebtoken')

const setup = () => {
  const hashedPassword =
    '$2a$12$t.oWWbsQlbdWxWBPmpRtMOzvyG3tGdetmIeTSVrtQvikQ67wMTyIm'

  const testUser: User = {
    id: '1',
    name: 'testNewUser1',
    email: 'testNewUser1@co.com',
    hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

  const testTodo: Todo & { user: User } = {
    id: '1',
    text: 'test1',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '1',
    user: testUser,
  }

  return { testUser, hashedPassword, token, testTodo }
}

describe('Mutation', () => {
  const mockPrisma = jest.mocked(prisma)
  const mockBcrypt = jest.mocked(bcrypt)
  const mockJwt = jest.mocked(jwt)

  beforeEach(() => {
    mockPrisma.user.findUnique.mockReset()
    mockPrisma.user.create.mockReset()
    mockPrisma.todo.create.mockReset()
    mockPrisma.todo.findUnique.mockReset()
    mockPrisma.todo.update.mockReset()
    mockPrisma.todo.delete.mockReset()
    mockBcrypt.hash.mockReset()
    mockBcrypt.compare.mockReset()
    mockJwt.sign.mockReset()
  })

  describe('createUser', () => {
    it('userが作成される', async () => {
      const { hashedPassword, testUser, token } = setup()
      mockBcrypt.hash.mockResolvedValueOnce(hashedPassword as never)
      mockPrisma.user.findUnique.mockResolvedValueOnce(null)
      mockPrisma.user.create.mockResolvedValueOnce(testUser)
      mockJwt.sign.mockImplementationOnce(() => token)
      const result = await createUser('', {
        name: testUser.name,
        email: testUser.email,
        password: 'password',
      })
      expect(result).toEqual({ token, user: testUser })
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: testUser.email },
      })
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password', 12)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: testUser.name,
          email: testUser.email,
          hashedPassword,
        },
      })
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { userId: testUser.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' },
      )
    })

    it('nameが存在しない場合、エラーとなる', async () => {
      const { testUser } = setup()
      await expect(
        createUser('', {
          name: '',
          email: testUser.email,
          password: 'password',
        }),
      ).rejects.toThrow('Name, Email, or Password is required')
    })

    it('emailが存在しない場合、エラーとなる', async () => {
      const { testUser } = setup()
      await expect(
        createUser('', {
          name: testUser.name,
          email: '',
          password: 'password',
        }),
      ).rejects.toThrow('Name, Email, or Password is required')
    })

    it('passwordが存在しない場合、エラーとなる', async () => {
      const { testUser } = setup()
      await expect(
        createUser('', {
          name: testUser.name,
          email: testUser.email,
          password: '',
        }),
      ).rejects.toThrow('Name, Email, or Password is required')
    })

    it('存在するuserを登録しようとするとエラーとなる', async () => {
      const { testUser } = setup()
      mockPrisma.user.findUnique.mockResolvedValueOnce(testUser)
      await expect(
        createUser('', {
          name: testUser.name,
          email: testUser.email,
          password: 'password',
        }),
      ).rejects.toThrow('User already exists')
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: testUser.email },
      })
    })

    it('prismaでエラーが発生した場合、「Internal Server Error」となる', async () => {
      const { testUser } = setup()
      mockPrisma.user.create.mockRejectedValueOnce(
        new Error('Internal Server Error'),
      )
      await expect(
        createUser('', {
          name: testUser.name,
          email: testUser.email,
          password: 'password',
        }),
      ).rejects.toThrow('Internal Server Error')
    })
  })

  describe('login', () => {
    it('ログインできる', async () => {
      const { testUser, token } = setup()
      mockPrisma.user.findUnique.mockResolvedValueOnce(testUser)
      mockBcrypt.compare.mockResolvedValueOnce(true as never)
      mockJwt.sign.mockImplementationOnce(() => token)
      const result = await login('', {
        email: testUser.email,
        password: 'password',
      })
      expect(result).toEqual({ token, user: testUser })
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: testUser.email },
      })
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'password',
        testUser.hashedPassword,
      )
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { userId: testUser.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' },
      )
    })

    it('emailが存在しない場合、エラーとなる', async () =>
      await expect(
        login('', { email: '', password: 'password' }),
      ).rejects.toThrow('Invalid ID'))

    it('passwordが存在しない場合、エラーとなる', async () => {
      const { testUser } = setup()
      await expect(
        login('', { email: testUser.email, password: '' }),
      ).rejects.toThrow('Invalid ID')
    })

    it('userが存在しない場合、エラーとなる', async () => {
      const { testUser } = setup()
      mockPrisma.user.findUnique.mockResolvedValueOnce(null)
      await expect(
        login('', { email: testUser.email, password: 'password' }),
      ).rejects.toThrow('User not found')
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: testUser.email },
      })
    })

    it('passwordが異なる場合、エラーとなる', async () => {
      const { testUser } = setup()
      mockPrisma.user.findUnique.mockResolvedValueOnce(testUser)
      mockBcrypt.compare.mockResolvedValueOnce(false as never)
      await expect(
        login('', { email: testUser.email, password: 'password' }),
      ).rejects.toThrow('Password is invalid')
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: testUser.email },
      })
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'password',
        testUser.hashedPassword,
      )
    })

    it('prismaでエラーが発生した場合、「Internal Server Error」となる', async () => {
      const { testUser } = setup()
      mockPrisma.user.findUnique.mockRejectedValueOnce(
        new Error('Internal Server Error'),
      )
      await expect(
        login('', { email: testUser.email, password: 'password' }),
      ).rejects.toThrow('Internal Server Error')
    })
  })

  describe('createTodo', () => {
    it('todoが登録できる', async () => {
      const { testUser, testTodo } = setup()
      mockPrisma.todo.create.mockResolvedValueOnce(testTodo)
      const result = await createTodo(
        '',
        { text: testTodo.text },
        { userId: testUser.id },
      )
      expect(result).toEqual(testTodo)
      expect(mockPrisma.todo.create).toHaveBeenCalledWith({
        data: {
          text: testTodo.text,
          completed: false,
          user: { connect: { id: testUser.id } },
        },
        include: { user: true },
      })
    })

    it('context.userIdが存在しない場合、エラーとなる', async () => {
      const { testTodo } = setup()
      await expect(
        createTodo('', { text: testTodo.text }, { userId: null }),
      ).rejects.toThrow('Invalid ID')
    })

    it('prismaでエラーが発生した場合、「Internal Server Error」となる', async () => {
      const { testUser, testTodo } = setup()
      mockPrisma.todo.create.mockRejectedValueOnce(
        new Error('Internal Server Error'),
      )
      await expect(
        createTodo('', { text: testTodo.text }, { userId: testUser.id }),
      ).rejects.toThrow('Internal Server Error')
    })
  })

  describe('updateTodo', () => {
    it('todoを更新できる', async () => {
      const { testTodo, testUser } = setup()
      mockPrisma.todo.findUnique.mockResolvedValueOnce(testTodo)
      const updatedTodo = { ...testTodo, text: 'update test1', completed: true }
      mockPrisma.todo.update.mockResolvedValueOnce(updatedTodo)
      const result = await updateTodo(
        '',
        { todoId: testTodo.id, text: 'update todo1', completed: true },
        { userId: testUser.id },
      )
      expect(result).toEqual(updatedTodo)
      expect(mockPrisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: testTodo.id },
      })
      expect(mockPrisma.todo.update).toHaveBeenCalledWith({
        where: { id: testTodo.id },
        data: { text: 'update todo1', completed: true },
        include: { user: true },
      })
    })

    it('context.userIdが存在しない場合、エラーとなる', async () => {
      const { testTodo } = setup()
      await expect(
        updateTodo(
          '',
          { todoId: testTodo.id, text: 'update todo1', completed: true },
          { userId: null },
        ),
      ).rejects.toThrow('Invalid ID')
    })

    it('args.todoIdが存在しない場合、エラーとなる', async () => {
      const { testUser } = setup()
      await expect(
        updateTodo(
          '',
          { todoId: '', text: 'update todo1', completed: true },
          { userId: testUser.id },
        ),
      ).rejects.toThrow('Invalid ID')
    })

    it('todoが存在しない場合、エラーとなる', async () => {
      const { testTodo, testUser } = setup()
      mockPrisma.todo.findUnique.mockResolvedValueOnce(null)
      await expect(
        updateTodo(
          '',
          { todoId: testTodo.id, text: 'update todo1', completed: true },
          { userId: testUser.id },
        ),
      ).rejects.toThrow('Todo not found')
      expect(mockPrisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: testTodo.id },
      })
    })

    it('userIdが一致しない場合、エラーとなる', async () => {
      const { testTodo } = setup()
      mockPrisma.todo.findUnique.mockResolvedValueOnce(testTodo)
      await expect(
        updateTodo(
          '',
          { todoId: testTodo.id, text: 'update todo1', completed: true },
          { userId: '2' },
        ),
      ).rejects.toThrow('UserId not match')
      expect(mockPrisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: testTodo.id },
      })
    })

    it('prismaでエラーが発生した場合、「Internal Server Error」となる', async () => {
      const { testTodo, testUser } = setup()
      mockPrisma.todo.findUnique.mockResolvedValueOnce(testTodo)
      mockPrisma.todo.update.mockRejectedValueOnce(
        new Error('Internal Server Error'),
      )
      await expect(
        updateTodo(
          '',
          { todoId: testTodo.id, text: 'update todo1', completed: true },
          { userId: testUser.id },
        ),
      ).rejects.toThrow('Internal Server Error')
      expect(mockPrisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: testTodo.id },
      })
    })
  })

  describe('deleteTodo', () => {
    it('todoを削除できる', async () => {
      const { testTodo, testUser } = setup()
      mockPrisma.todo.findUnique.mockResolvedValueOnce(testTodo)
      mockPrisma.todo.delete.mockResolvedValueOnce(testTodo)
      const result = await deleteTodo(
        '',
        { todoId: testTodo.id },
        { userId: testUser.id },
      )
      expect(result).toEqual(testTodo)
      expect(mockPrisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: testTodo.id },
      })
      expect(mockPrisma.todo.delete).toHaveBeenCalledWith({
        where: { id: testTodo.id },
        include: { user: true },
      })
    })

    it('context.userIdが存在しない場合、エラーとなる', async () => {
      const { testTodo } = setup()
      await expect(
        deleteTodo('', { todoId: testTodo.id }, { userId: null }),
      ).rejects.toThrow('Invalid ID')
    })

    it('args.todoIdが存在しない場合、エラーとなる', async () => {
      const { testUser } = setup()
      await expect(
        deleteTodo('', { todoId: '' }, { userId: testUser.id }),
      ).rejects.toThrow('Invalid ID')
    })

    it('todoが存在しない場合、エラーとなる', async () => {
      const { testTodo, testUser } = setup()
      mockPrisma.todo.findUnique.mockResolvedValueOnce(null)
      await expect(
        deleteTodo('', { todoId: testTodo.id }, { userId: testUser.id }),
      ).rejects.toThrow('Todo not found')
      expect(mockPrisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: testTodo.id },
      })
    })

    it('userIdが一致しない場合、エラーとなる', async () => {
      const { testTodo } = setup()
      mockPrisma.todo.findUnique.mockResolvedValueOnce(testTodo)
      await expect(
        deleteTodo('', { todoId: testTodo.id }, { userId: '2' }),
      ).rejects.toThrow('UserId not match')
      expect(mockPrisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: testTodo.id },
      })
    })

    it('prismaでエラーが発生した場合、「Internal Server Error」となる', async () => {
      const { testTodo, testUser } = setup()
      mockPrisma.todo.findUnique.mockResolvedValueOnce(testTodo)
      mockPrisma.todo.delete.mockRejectedValueOnce(
        new Error('Internal Server Error'),
      )
      await expect(
        deleteTodo('', { todoId: testTodo.id }, { userId: testUser.id }),
      ).rejects.toThrow('Internal Server Error')
      expect(mockPrisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: testTodo.id },
      })
    })
  })
})
