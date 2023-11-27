import { useQuery } from '@apollo/client'
import React from 'react'
import { GET_TODOS } from './graphql/queries'
import Spinner from '../Spinner'
import { Todo } from '../../generated/graphql'
import TodoItem from './TodoItem'

const TodoList = () => {
  const { loading, error, data } = useQuery(GET_TODOS)

  if (loading) return <Spinner />

  return (
    <ul className="mt-10">
      {data.todos.map((todo: Todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}

export default TodoList
