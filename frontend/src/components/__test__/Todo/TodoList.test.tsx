import { MockedProvider } from '@apollo/client/testing'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { GET_TODOS } from '../../Todo/graphql/queries'
import TodoList from '../../Todo/TodoList'

describe('TodoListComponent', () => {
  let mocks

  beforeEach(() => {
    mocks = [
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
                updatedAt: '2023-12-17 12:00:00',
                user: {
                  id: '1',
                  name: 'testUser1',
                },
              },
              {
                id: '2',
                text: 'test2',
                completed: false,
                updatedAt: '2023-12-17 12:10:00',
                user: {
                  id: '1',
                  name: 'testUser1',
                },
              },
            ],
          },
        },
      },
    ]

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <TodoList />
        </MemoryRouter>
      </MockedProvider>,
    )
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('TodoListが表示される', async () => {
    await waitFor(() => {
      expect(screen.getByText('test1')).toBeInTheDocument()
      expect(screen.getByText('test2')).toBeInTheDocument()
    })
  })
})
