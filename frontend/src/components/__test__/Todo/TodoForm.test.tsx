import { MockedProvider } from '@apollo/client/testing'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import { toast } from 'react-hot-toast'
import { MemoryRouter } from 'react-router-dom'
import { ADD_TODO } from '../../Todo/graphql/mutations'
import { GET_TODOS } from '../../Todo/graphql/queries'
import TodoForm from '../../Todo/TodoForm'
import TodoList from '../../Todo/TodoList'

const user = userEvent.setup()

describe('TodoFormComponent', () => {
  let mocks

  beforeEach(() => {
    mocks = [
      {
        request: {
          query: ADD_TODO,
          variables: {
            text: 'test2',
          },
        },
        result: {
          data: {
            createTodo: {
              id: '2',
              text: 'test2',
              completed: false,
            },
          },
        },
      },
      {
        request: {
          query: GET_TODOS,
        },
        result: {
          data: {
            todos: [
              {
                id: '1',
                text: 'test1',
                completed: false,
                updatedAt: new Date(),
                user: { id: '1', name: 'testUser1' },
              },
            ],
          },
        },
      },
      {
        request: {
          query: GET_TODOS,
        },
        result: {
          data: {
            todos: [
              {
                id: '1',
                text: 'test1',
                completed: false,
                updatedAt: new Date(),
                user: { id: '1', name: 'testUser1' },
              },
              {
                id: '2',
                text: 'test2',
                completed: false,
                updatedAt: new Date(),
                user: { id: '1', name: 'testUser1' },
              },
            ],
          },
        },
      },
    ]

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <TodoForm />
          <TodoList />
        </MemoryRouter>
      </MockedProvider>,
    )
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('TodoFormが表示される', () => {
    expect(screen.getByPlaceholderText('Todo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('Todoが追加される', async () => {
    const toastSuccessSpy = jest.spyOn(toast, 'success')
    await waitFor(() => {
      expect(screen.getByText('test1')).toBeInTheDocument()
      expect(screen.queryByText('test2')).not.toBeInTheDocument()
    })
    const input = screen.getByPlaceholderText('Todo')
    await user.type(input, 'test2')
    const button = screen.getByRole('button', { name: 'Add' })
    await user.click(button)
    await waitFor(() =>
      expect(toastSuccessSpy).toHaveBeenCalledWith('Added todo'),
    )
    expect(input).toHaveValue('')
    await waitFor(() => {
      expect(screen.getByText('test1')).toBeInTheDocument()
      expect(screen.getByText('test2')).toBeInTheDocument()
    })
  })

  it('textが空の場合、バリデーションエラーとなる', async () => {
    const input = screen.getByPlaceholderText('Todo')
    expect(input).toHaveValue('')
    const button = screen.getByRole('button', { name: 'Add' })
    await user.click(button)
    expect(screen.getByText('text is required')).toBeInTheDocument()
  })

  it('textが129文字以上の場合、バリデーションエラーとなる', async () => {
    const input = screen.getByPlaceholderText('Todo')
    const randomString = Math.random()
      .toString(36)
      .substring(2, 10)
      .padEnd(129, 'x')
    await user.type(input, randomString)
    expect(input).toHaveValue(randomString)
    const button = screen.getByRole('button', { name: 'Add' })
    await user.click(button)
    expect(
      screen.getByText('please enter at max 128 characters'),
    ).toBeInTheDocument()
  })

  it('mutationがエラーをスローした場合、エラーメッセージが表示される', async () => {
    cleanup()
    const toastErrSpy = jest.spyOn(toast, 'error')
    mocks = [
      {
        request: {
          query: ADD_TODO,
          variables: {
            text: 'test3',
          },
        },
        error: new Error('Create failed'),
      },
    ]
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <TodoForm />
        </MemoryRouter>
      </MockedProvider>,
    )
    const input = screen.getByPlaceholderText('Todo')
    await user.type(input, 'test3')
    expect(input).toHaveValue('test3')
    const button = screen.getByRole('button', { name: 'Add' })
    await user.click(button)

    await waitFor(() =>
      expect(toastErrSpy).toHaveBeenCalledWith('Something Went Wrong'),
    )
    expect(input).toHaveValue('test3')
  })
})
