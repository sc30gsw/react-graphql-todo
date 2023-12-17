import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { SignUpInput, signUpScheme } from '../../types/SignUpFormInput'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '../Input'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { CREATE_USER } from './graphql/mutations'
import toast from 'react-hot-toast'

const SignUp = () => {
  const navigate = useNavigate()
  const [createUser] = useMutation(CREATE_USER)
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpScheme),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<SignUpInput> = async (data) => {
    try {
      const result = await createUser({
        variables: {
          name: data.name,
          email: data.email,
          password: data.password,
        },
      })
      sessionStorage.setItem('token', result.data.createUser.token)

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
            id="name"
            name="name"
            placeholder="Name"
            type="text"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={control as any}
            disabled={isSubmitting}
            autoFocus
          />
          <Input
            id="email"
            name="email"
            placeholder="Email"
            type="text"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={control as any}
            disabled={isSubmitting}
          />
          <Input
            id="password"
            name="password"
            placeholder="Password"
            type="password"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={control as any}
            disabled={isSubmitting}
          />
          <div className="w-[45%] text-right">
            <button
              type="submit"
              className="bg-indigo-500 py-3 px-6 mr-5 rounded-md shadow-md cursor-pointer hover:opacity-70 duration-200 transition text-white"
            >
              Sign Up
            </button>
          </div>
          <div className="w-[45%] text-right">
            <span className="mr-5">
              Already have an account?{' '}
              <a
                className="text-blue-600 hover:underline hover:text-blue-400"
                href="/login"
              >
                Login
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignUp
