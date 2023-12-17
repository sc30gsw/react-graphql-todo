import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { TodoInput, todoSchema } from '../../types/TodoFormInput'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '../Input'
import toast from 'react-hot-toast'
import { useMutation } from '@apollo/client'
import { ADD_TODO } from './graphql/mutations'
import { GET_TODOS } from './graphql/queries'

const TodoForm = () => {
  const [createTodo] = useMutation(ADD_TODO, {
    // 追加時に再フェッチする（再レンダリング）
    refetchQueries: [{ query: GET_TODOS }],
  })

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<TodoInput>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      text: '',
    },
  })

  const onSubmit: SubmitHandler<TodoInput> = async (data) => {
    try {
      await createTodo({
        variables: {
          text: data.text,
        },
      })

      toast.success('Added todo')
      reset()
    } catch (err) {
      console.log(err)
      toast.error('Something Went Wrong')
    }
  }

  return (
    <div className="mt-5">
      <div>
        <form
          className="flex justify-center items-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            id="text"
            name="text"
            placeholder="Todo"
            type="text"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={control as any}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="bg-indigo-500 py-2 px-4 mt-3 ml-5 rounded-md shadow-md cursor-pointer hover:opacity-70 duration-200 transition text-white"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  )
}

export default TodoForm
