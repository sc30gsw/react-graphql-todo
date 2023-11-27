import React from 'react'
import Input from '../Input'
import { SubmitHandler, useForm } from 'react-hook-form'
import { LoginInput, loginSchema } from '../../types/LoginFormInput'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { LOGIN } from './graphql/mutations'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const [login] = useMutation(LOGIN)

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<LoginInput> = async (data) => {
    try {
      const result = await login({
        variables: {
          email: data.email,
          password: data.password,
        },
      })

      sessionStorage.setItem('token', result.data.login.token)
      toast.success('Account created!')
      reset()
      navigate('/')
    } catch (err) {
      console.log(err)
      toast.error('Something Went Wrong')
    }
  }
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <h2 className="font-bold text-xl">Sign Up</h2>
      <div className="w-full">
        <form
          className="flex flex-col items-center justify-center gap-3 border py-6 w-1/2 mx-auto mt-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            id="email"
            name="email"
            placeholder="Email"
            type="email"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={control as any}
            disabled={isSubmitting}
            required
            autoFocus
          />
          <Input
            id="password"
            name="password"
            placeholder="Password"
            type="password"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={control as any}
            disabled={isSubmitting}
            required
          />
          <div className="w-[45%] text-right">
            <button
              type="submit"
              className="bg-indigo-500 py-3 px-6 mr-5 rounded-md shadow-md cursor-pointer hover:opacity-70 duration-200 transition text-white"
            >
              Login
            </button>
          </div>
          <div className="w-[45%] text-right">
            <span className="mr-5">
              {"Don't have an account?"}{' '}
              <a
                className="text-blue-600 hover:underline hover:text-blue-400"
                href="/signUp"
              >
                SignUp
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
