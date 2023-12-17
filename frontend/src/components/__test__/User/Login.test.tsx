import { MockedProvider } from '@apollo/client/testing'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import { toast } from 'react-hot-toast'
import { MemoryRouter } from 'react-router-dom'
import { LOGIN } from '../../User/graphql/mutations'
import Login from '../../User/Login'

const user = userEvent.setup()
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}))

describe('LoginComponent', () => {
  let mocks

  beforeEach(() => {
    mocks = [
      {
        request: {
          query: LOGIN,
          variables: {
            email: 'test1@co.com',
            password: 'password1',
          },
        },
        result: {
          data: {
            login: {
              token: 'token',
              user: {
                id: '1',
                name: 'testUser1',
                email: 'test1@co.com',
              },
            },
          },
        },
      },
    ]

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>,
    )
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  describe('Login', () => {
    it('ログインフォームが表示される', () => {
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
    })

    it('ログインボタンをクリックするとmutationが呼び出される', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
      const toastSuccessSpy = jest.spyOn(toast, 'success')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText('Password')
      await user.type(emailInput, 'test1@co.com')
      await user.type(passwordInput, 'password1')
      expect(emailInput).toHaveValue('test1@co.com')
      expect(passwordInput).toHaveValue('password1')
      const button = screen.getByRole('button', { name: 'Login' })
      await user.click(button)
      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith('token', 'token')
        expect(toastSuccessSpy).toHaveBeenCalledWith('Account created!')
      })
      expect(emailInput).toHaveValue('')
      expect(passwordInput).toHaveValue('')
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/')
    })

    it('emailを空で送信するとバリデーションエラーとなる', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
      const toastSuccessSpy = jest.spyOn(toast, 'success')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText('Password')
      await user.type(passwordInput, 'password1')
      expect(emailInput).toHaveValue('')
      expect(passwordInput).toHaveValue('password1')
      const button = screen.getByRole('button', { name: 'Login' })
      await user.click(button)
      await waitFor(() =>
        expect(screen.getByText('email is required')).toBeInTheDocument(),
      )
      expect(setItemSpy).not.toHaveBeenCalledWith('token', 'token')
      expect(toastSuccessSpy).not.toHaveBeenCalledWith('Account created!')
      expect(emailInput).toHaveValue('')
      expect(passwordInput).toHaveValue('password1')
      expect(mockedUsedNavigate).not.toHaveBeenCalledWith('/')
    })

    it('emailの形式でないテキストで送信するとバリデーションエラーとなる', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
      const toastSuccessSpy = jest.spyOn(toast, 'success')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText('Password')
      await user.type(emailInput, 'test.co.com')
      await user.type(passwordInput, 'password1')
      expect(emailInput).toHaveValue('test.co.com')
      expect(passwordInput).toHaveValue('password1')
      const button = screen.getByRole('button', { name: 'Login' })
      await user.click(button)
      await waitFor(() =>
        expect(screen.getByText('format email')).toBeInTheDocument(),
      )
      expect(setItemSpy).not.toHaveBeenCalledWith('token', 'token')
      expect(toastSuccessSpy).not.toHaveBeenCalledWith('Account created!')
      expect(emailInput).toHaveValue('test.co.com')
      expect(passwordInput).toHaveValue('password1')
      expect(mockedUsedNavigate).not.toHaveBeenCalledWith('/')
    })

    it('emailを129文字で送信するとバリデーションエラーとなる', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
      const toastSuccessSpy = jest.spyOn(toast, 'success')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText('Password')
      const randomString = `random${Math.random()
        .toString(36)
        .substring(2, 10)
        .padEnd(117, 'x')}@co.jp`
      await user.type(emailInput, randomString)
      await user.type(passwordInput, 'password1')
      expect(emailInput).toHaveValue(randomString)
      expect(passwordInput).toHaveValue('password1')
      const button = screen.getByRole('button', { name: 'Login' })
      await user.click(button)
      await waitFor(() =>
        expect(
          screen.getByText('please enter at max 128 characters'),
        ).toBeInTheDocument(),
      )
      expect(setItemSpy).not.toHaveBeenCalledWith('token', 'token')
      expect(toastSuccessSpy).not.toHaveBeenCalledWith('Account created!')
      expect(emailInput).toHaveValue(randomString)
      expect(passwordInput).toHaveValue('password1')
      expect(mockedUsedNavigate).not.toHaveBeenCalledWith('/')
    })

    it('passwordを8文字以下で送信するとバリデーションエラーとなる', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
      const toastSuccessSpy = jest.spyOn(toast, 'success')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText('Password')
      await user.type(emailInput, 'test1@co.com')
      await user.type(passwordInput, 'pass123')
      expect(emailInput).toHaveValue('test1@co.com')
      expect(passwordInput).toHaveValue('pass123')
      const button = screen.getByRole('button', { name: 'Login' })
      await user.click(button)
      await waitFor(() =>
        expect(
          screen.getByText('please enter at least 8 characters'),
        ).toBeInTheDocument(),
      )
      expect(setItemSpy).not.toHaveBeenCalledWith('token', 'token')
      expect(toastSuccessSpy).not.toHaveBeenCalledWith('Account created!')
      expect(emailInput).toHaveValue('test1@co.com')
      expect(passwordInput).toHaveValue('pass123')
      expect(mockedUsedNavigate).not.toHaveBeenCalledWith('/')
    })

    it('passwordを文字列のみで送信するとバリデーションエラーとなる', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
      const toastSuccessSpy = jest.spyOn(toast, 'success')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText('Password')
      await user.type(emailInput, 'test1@co.com')
      await user.type(passwordInput, 'password')
      expect(emailInput).toHaveValue('test1@co.com')
      expect(passwordInput).toHaveValue('password')
      const button = screen.getByRole('button', { name: 'Login' })
      await user.click(button)
      await waitFor(() =>
        expect(
          screen.getByText('password must contain both letters and numbers'),
        ).toBeInTheDocument(),
      )
      expect(setItemSpy).not.toHaveBeenCalledWith('token', 'token')
      expect(toastSuccessSpy).not.toHaveBeenCalledWith('Account created!')
      expect(emailInput).toHaveValue('test1@co.com')
      expect(passwordInput).toHaveValue('password')
      expect(mockedUsedNavigate).not.toHaveBeenCalledWith('/')
    })

    it('passwordを129文字で送信するとバリデーションエラーとなる', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
      const toastSuccessSpy = jest.spyOn(toast, 'success')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText('Password')
      const randomString = `${Math.random()
        .toString(36)
        .substring(2, 10)
        .padEnd(128, 'x')}1`
      await user.type(emailInput, 'test1@co.com')
      await user.type(passwordInput, randomString)
      expect(emailInput).toHaveValue('test1@co.com')
      expect(passwordInput).toHaveValue(randomString)
      const button = screen.getByRole('button', { name: 'Login' })
      await user.click(button)
      await waitFor(() =>
        expect(
          screen.getByText('please enter at max 128 characters'),
        ).toBeInTheDocument(),
      )
      expect(setItemSpy).not.toHaveBeenCalledWith('token', 'token')
      expect(toastSuccessSpy).not.toHaveBeenCalledWith('Account created!')
      expect(emailInput).toHaveValue('test1@co.com')
      expect(passwordInput).toHaveValue(randomString)
      expect(mockedUsedNavigate).not.toHaveBeenCalledWith('/')
    })

    it('mutationがエラーをスローした場合、エラーメッセージが表示される', async () => {
      cleanup()
      mocks = [
        {
          request: {
            query: LOGIN,
            variables: {
              email: 'test1@co.com',
              password: 'password1',
            },
          },
          error: new Error('Login failed'),
        },
      ]
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </MockedProvider>,
      )
      const toastErrSpy = jest.spyOn(toast, 'error')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText('Password')
      await user.type(emailInput, 'test1@co.com')
      await user.type(passwordInput, 'password1')
      expect(emailInput).toHaveValue('test1@co.com')
      expect(passwordInput).toHaveValue('password1')
      const button = screen.getByRole('button', { name: 'Login' })
      await user.click(button)
      await waitFor(() =>
        expect(toastErrSpy).toHaveBeenCalledWith('Something Went Wrong'),
      )
      expect(emailInput).toHaveValue('test1@co.com')
      expect(passwordInput).toHaveValue('password1')
    })
  })
})
