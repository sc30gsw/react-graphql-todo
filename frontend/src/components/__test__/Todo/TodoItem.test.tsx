import React from 'react'
import { userEvent } from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import TodoItem from '../../Todo/TodoItem'
import { cleanup, render, screen } from '@testing-library/react'
import { DELETE_TODO, UPDATE_TODO } from '../../Todo/graphql/mutations'
import { GET_TODOS } from '../../Todo/graphql/queries'
import { Todo } from '../../../generated/graphql'

const todo = {
  id: '1',
  text: 'test1',
  completed: false,
  createdAt: '2023-12-17 12:00:00',
  updatedAt: '2023-12-17 12:00:00',
  user: {
    id: '1',
    name: 'testUser1',
    createdAt: '2023-12-17 12:00:00',
    email: 'testUser1@example.com',
    hashedPassword: 'hashedPassword',
    todos: [],
    updatedAt: '2023-12-17 12:00:00',
  },
}

const user = userEvent.setup()

describe('TodoItemComponent', () => {
  let mocks

  beforeEach(() => {
    mocks = [
      {
        request: {
          query: UPDATE_TODO,
          variables: {
            todoId: todo.id,
            text: 'test updated',
            completed: todo.completed,
          },
        },
        result: {
          data: {
            updateTodo: {
              id: todo.id,
              text: 'test updated',
              completed: todo.completed,
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
                id: todo.id,
                text: 'test updated',
                completed: todo.completed,
                updatedAt: new Date(),
                user: { id: todo.user.id, name: todo.user.name },
              },
            ],
          },
        },
      },
    ]

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <TodoItem todo={todo} />
        </MemoryRouter>
      </MockedProvider>,
    )
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('初期状態では、todoのテキスト・チェックボックスが表示されUpdate・Deleteボタンが表示されない', () => {
    expect(screen.getByText(todo.text)).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Update' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument()
  })
  it('todoが更新できる', async () => {
    const todoText = screen.getByText(todo.text)
    await user.dblClick(todoText)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue(todo.text)
    const updateBtn = screen.getByRole('button', { name: 'Update' })
    expect(updateBtn).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    await user.clear(input)
    await user.type(input, 'test updated')
    expect(input).toHaveValue('test updated')
    await user.click(updateBtn)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Update' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument()
    cleanup()
    mocks = [
      {
        request: {
          query: UPDATE_TODO,
          variables: {
            todoId: todo.id,
            text: 'test updated',
            completed: todo.completed,
          },
        },
        result: {
          data: {
            updateTodo: {
              id: todo.id,
              text: 'test updated',
              completed: todo.completed,
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
                id: todo.id,
                text: 'test updated',
                completed: todo.completed,
                updatedAt: new Date(),
                user: { id: todo.user.id, name: todo.user.name },
              },
            ],
          },
        },
      },
    ]
    const updatedTodo = {
      ...todo,
      text: 'test updated',
    }
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <TodoItem todo={updatedTodo} />
        </MemoryRouter>
      </MockedProvider>,
    )
    expect(screen.getByText('test updated')).toBeInTheDocument()
  })

  it('todoが削除できる', async () => {
    const todoText = screen.getByText(todo.text)
    await user.dblClick(todoText)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue(todo.text)
    const deleteBtn = screen.getByRole('button', { name: 'Delete' })
    expect(deleteBtn).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument()
    await user.clear(input)
    await user.type(input, 'test updated')
    expect(input).toHaveValue('test updated')
    await user.click(deleteBtn)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Update' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument()
    cleanup()
    mocks = [
      {
        request: {
          query: DELETE_TODO,
          variables: {
            todoId: todo.id,
          },
        },
        result: {
          data: {
            deleteTodo: {
              id: todo.id,
              text: todo.text,
              completed: todo.completed,
              user: {
                id: todo.user.id,
                name: todo.user.name,
              },
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
            todos: [],
          },
        },
      },
    ]
    const deletedTodo: any = {}
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <TodoItem todo={deletedTodo as Todo} />
        </MemoryRouter>
      </MockedProvider>,
    )
    expect(screen.queryByText(todo.text)).not.toBeInTheDocument()
  })
})
