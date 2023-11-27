import React from 'react'
import Header from './Header'
import { useQuery } from '@apollo/client'
import { GET_USER } from './User/graphql/queries'
import TodoList from './Todo/TodoList'
import TodoForm from './Todo/TodoForm'

const Home = () => {
  const { loading, error, data } = useQuery(GET_USER)

  if (loading) return null

  return (
    <div className="flex flex-col">
      <Header user={data.user} />
      <div className="mt-[10vh]">
        <TodoForm />
        <TodoList />
      </div>
    </div>
  )
}

export default Home
