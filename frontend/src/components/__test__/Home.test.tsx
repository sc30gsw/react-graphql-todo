import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { GET_USER } from '../User/graphql/queries'
import Home from '../Home'
import { GET_TODOS } from '../Todo/graphql/queries'

const mocks = [
  {
    request: {
      query: GET_USER,
    },
    result: {
      data: {
        user: {
          id: '1',
          name: 'testUser1',
          email: 'test1@co.com',
          hashedPassword: 'password',
          createdAt: '2023-12-16',
          updatedAt: '2023-12-16',
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
            updatedAt: '2023-12-16 12:00:00',
            user: { id: '1', name: 'testUser1' },
          },
        ],
      },
    },
  },
]

describe('Header', () => {
  beforeEach(() => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </MockedProvider>,
    )
  })

  it('GET_USERのdataが取得できる', async () => {
    await waitFor(() =>
      expect(screen.getByText('testUser1')).toBeInTheDocument(),
    )
  })
})
