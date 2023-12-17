import React from 'react'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Todo, User } from '../../generated/graphql'
import Header from '../Header'
import { MemoryRouter, Router } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'

const u = userEvent.setup()
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}))

describe('Header', () => {
  let user: User

  beforeEach(() => {
    const todos: Todo[] = [
      {
        id: '1',
        text: 'todo1',
        completed: false,
        createdAt: '2023-12-16',
        updatedAt: '2023-12-16',
        user,
      },
    ]
    user = {
      id: '1',
      name: 'testUser1',
      email: 'test1@co.com',
      hashedPassword: 'password',
      createdAt: '2023-12-16',
      updatedAt: '2023-12-16',
      todos,
    }

    mockedUsedNavigate.mockReset()

    render(
      <MockedProvider>
        <MemoryRouter>
          <Header user={user} />
        </MemoryRouter>
      </MockedProvider>,
    )
  })

  it('user情報が表示される', async () => {
    const element = screen.getByRole('heading', { name: user.name })
    expect(element.textContent).toBe(user.name)
    const logout = screen.getByRole('heading', { name: 'Logout' })
    await u.click(logout)
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/login')
  })
})
